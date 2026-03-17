import { writer } from '../agents/writer.js';
import { completenessChecker } from '../agents/completeness.js';
import { summarizer } from '../agents/summarizer.js';
import { canonValidator } from '../agents/canonValidator.js';
import { memoryExtractor } from '../agents/memoryExtractor.js';
import { planScenes } from '../agents/scenePlanner.js';
import { storyDirector, type DirectorOutput } from '../agents/storyDirector.js';
import { generateTensionGuidance, analyzeTension } from '../agents/tensionController.js';
import { createStructuredState } from '../story/structuredState.js';
import { WorldStateEngine, createWorldStateEngine } from '../world/worldStateEngine.js';
import type { GenerationContext, Chapter, ChapterSummary, SceneOutput, ScenePlan, StoryBible } from '../types/index.js';
import type { CanonStore } from '../memory/canonStore.js';
import { extractCanonFromChapter } from '../memory/canonStore.js';
import type { VectorStore } from '../memory/vectorStore.js';
import { createMemoryRetriever, MemoryRetriever } from '../memory/memoryRetriever.js';

export interface GenerateChapterResult {
  chapter: Chapter;
  summary: ChapterSummary;
  violations: string[];
  memoriesExtracted: number;
}

export interface GenerateChapterOptions {
  canon?: CanonStore;
  vectorStore?: VectorStore;
  validateCanon?: boolean;
  maxContinuationAttempts?: number;
  retrieveMemories?: boolean;
  useSceneLevel?: boolean; // Enable scene-by-scene generation (Phase 12)
  targetSceneCount?: number;
  worldStateEngine?: WorldStateEngine; // Phase 14 - World State Engine
}

export async function generateChapter(
  context: GenerationContext,
  options: GenerateChapterOptions = {}
): Promise<GenerateChapterResult> {
  const { bible, state, chapterNumber } = context;
  const { 
    canon, 
    vectorStore, 
    validateCanon = true, 
    maxContinuationAttempts = 3, 
    retrieveMemories = true,
    useSceneLevel = true, // Default to scene-level generation
    targetSceneCount // If not provided, scene planner will auto-calculate
  } = options;

  console.log(`Generating Chapter ${chapterNumber}...`);

  // Use scene-level generation if enabled
  if (useSceneLevel) {
    return generateChapterSceneLevel(context, options);
  }

  // Legacy chapter-level generation
  return generateChapterLegacy(context, options);
}

/**
 * Scene-level chapter generation (Phase 12)
 * Breaks chapter into scenes, generates each individually, then assembles
 */
async function generateChapterSceneLevel(
  context: GenerationContext,
  options: GenerateChapterOptions
): Promise<GenerateChapterResult> {
  const { bible, state, chapterNumber } = context;
  const { 
    canon, 
    vectorStore, 
    validateCanon = true,
    targetSceneCount, // Auto-calculated by scene planner if not provided
    worldStateEngine: providedWorldState
  } = options;

  // Note: targetSceneCount will be auto-calculated by scene planner if not specified
  console.log(`  Using scene-level generation...`);

  // Initialize memory retriever if vector store provided
  let memoryRetriever: MemoryRetriever | undefined;
  if (vectorStore) {
    await vectorStore.initialize();
    memoryRetriever = createMemoryRetriever(vectorStore);
  }

  // Phase 14: Initialize World State Engine
  const worldStateEngine = providedWorldState || createWorldStateEngine(bible.id);
  
  // Initialize world state from bible characters if empty
  if (Object.keys(worldStateEngine.getState().characters).length === 0) {
    console.log('  Initializing world state from story bible...');
    for (const char of bible.characters) {
      worldStateEngine.addCharacter(char.name, 'unknown', 'neutral');
    }
  }
  worldStateEngine.setChapterScene(chapterNumber, 1);

  // Step 1: Story Director - Get chapter direction
  console.log('  Consulting Story Director...');
  
  // Create or get structured state
  let structuredState = createStructuredState(bible.id);
  // TODO: Load existing structured state from storage
  
  // Analyze tension
  const tensionAnalysis = analyzeTension(state, structuredState);
  const tensionGuidance = generateTensionGuidance(tensionAnalysis, state);
  
  const directorOutput = await storyDirector.direct({
    bible,
    state,
    structuredState,
    tensionGuidance,
    previousSummaries: state.chapterSummaries.slice(-3)
  });
  console.log(`  Director goal: ${directorOutput.overallGoal}`);
  console.log(`  Objectives: ${directorOutput.objectives.length}`);

  // Step 2: Plan scenes for this chapter (now with director guidance)
  console.log('  Planning scenes...');
  const previousSummary = state.chapterSummaries[state.chapterSummaries.length - 1]?.summary;
  const scenePlan = await planScenes({
    bible,
    state,
    chapterNumber,
    previousChapterSummary: previousSummary,
    targetSceneCount,
    directorOutput
  });
  console.log(`  Planned ${scenePlan.scenes.length} scenes`);

  // Step 2: Generate chapter holistically
  console.log('  Writing chapter holistically...');
  
  const writerOutput = await writer.writeHolistic(
    context,
    scenePlan,
    directorOutput,
    canon,
    memoryRetriever
  );
  
  console.log(`  Generated: ${writerOutput.wordCount} words`);

  // Step 3: Validate full chapter
  let violations: string[] = [];
  if (validateCanon && canon) {
    console.log('  Validating chapter...');
    const validation = await canonValidator.validate(writerOutput.content, canon);
    violations = validation.violations;
    if (violations.length > 0) {
      console.log(`  ⚠️  Canon violations detected: ${violations.length}`);
    }
  }

  // Step 4: Generate chapter summary using LLM
  console.log('  Generating chapter summary...');
  const chapterSummary = await generateHolisticChapterSummary(
    writerOutput.content,
    scenePlan,
    bible,
    chapterNumber
  );

  // Step 5: Create chapter summary
  const summary: ChapterSummary = {
    chapterNumber,
    summary: chapterSummary,
    keyEvents: [] as string[],
    characterChanges: {} as Record<string, string>
  };

  const chapter: Chapter = {
    id: generateId(),
    storyId: bible.id,
    number: chapterNumber,
    title: writerOutput.title,
    content: writerOutput.content,
    summary: summary.summary,
    wordCount: writerOutput.wordCount,
    generatedAt: new Date(),
  };

  console.log(`  Generated: ${writerOutput.wordCount} words (${scenePlan.scenes.length} scenes framework)`);

  return { 
    chapter, 
    summary, 
    violations, 
    memoriesExtracted: 1 // One chapter = one memory
  };
}

/**
 * Legacy chapter-level generation (pre-Phase 12)
 */
async function generateChapterLegacy(
  context: GenerationContext,
  options: GenerateChapterOptions
): Promise<GenerateChapterResult> {
  const { bible, state, chapterNumber } = context;
  const { canon, vectorStore, validateCanon = true, maxContinuationAttempts = 3, retrieveMemories = true } = options;

  // Initialize memory retriever if vector store provided
  let memoryRetriever: MemoryRetriever | undefined;
  if (vectorStore && retrieveMemories) {
    await vectorStore.initialize();
    memoryRetriever = createMemoryRetriever(vectorStore);
  }

  let output = await writer.write(context, canon, memoryRetriever);
  let attempts = 0;

  while (attempts < maxContinuationAttempts) {
    const check = await completenessChecker.check(output.content);
    
    if (check.isComplete) {
      break;
    }

    console.log(`  Chapter incomplete, continuing... (attempt ${attempts + 1})`);
    output.content = await writer.continue(output.content, context);
    output.wordCount = output.content.split(/\s+/).length;
    attempts++;
  }

  let violations: string[] = [];
  if (validateCanon && canon) {
    console.log('  Validating canon...');
    const validation = await canonValidator.validate(output.content, canon);
    violations = validation.violations;
    if (violations.length > 0) {
      console.log(`  ⚠️  Canon violations detected: ${violations.length}`);
    }
  }

  const summary = await summarizer.summarize(output.content, chapterNumber);

  const chapter: Chapter = {
    id: generateId(),
    storyId: bible.id,
    number: chapterNumber,
    title: output.title,
    content: output.content,
    summary: summary.summary,
    wordCount: output.wordCount,
    generatedAt: new Date(),
  };

  // Extract and store memories
  let memoriesExtracted = 0;
  if (vectorStore) {
    console.log('  Extracting memories...');
    const extracted = await memoryExtractor.extract(chapter, bible);
    
    for (const memory of extracted) {
      await vectorStore.addMemory({
        storyId: bible.id,
        chapterNumber,
        content: memory.content,
        category: memory.category,
        timestamp: new Date(),
      });
      memoriesExtracted++;
    }
    console.log(`  Stored ${memoriesExtracted} memories`);
  }

  console.log(`  Generated: ${output.wordCount} words`);

  return { chapter, summary, violations, memoriesExtracted };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

import { getLLM } from '../llm/client.js';

/**
 * Generate a natural chapter summary using LLM
 * This creates a cohesive summary from all scene summaries
 */
async function generateNaturalChapterSummary(
  sceneOutputs: SceneOutput[],
  scenePlan: ScenePlan,
  bible: StoryBible,
  chapterNumber: number
): Promise<string> {
  const llm = getLLM();
  
  const languageName = bible.language === 'zh' ? 'Chinese' : bible.language === 'ja' ? 'Japanese' : bible.language === 'ko' ? 'Korean' : bible.language === 'ar' ? 'Arabic' : bible.language === 'ru' ? 'Russian' : bible.language === 'es' ? 'Spanish' : bible.language === 'fr' ? 'French' : bible.language === 'de' ? 'German' : 'English';
  
  // Collect all scene summaries
  const sceneSummaries = sceneOutputs
    .map((s, i) => `Scene ${i + 1}: ${s.summary}`)
    .join('\n');
  
  const prompt = `You are a professional editor writing a chapter summary.

Story: ${bible.title}
Chapter ${chapterNumber}: ${scenePlan.chapterTitle || 'Untitled'}
Language: ${languageName}

Scene Summaries:
${sceneSummaries}

Write a natural, flowing summary of this chapter in ${languageName}.
- 2-4 sentences
- Capture the main events and character developments
- Do NOT use phrases like "Then" or "Next" to connect events
- Write as a cohesive narrative, not a list
- Focus on what happened and why it matters

Return ONLY the summary text, no JSON formatting.`;

  try {
    const response = await llm.complete(prompt, {
      temperature: 0.7,
      maxTokens: 300
    });
    
    return response.trim();
  } catch (error) {
    console.warn('  Failed to generate natural summary, using fallback');
    // Fallback: use first scene summary
    return sceneOutputs[0]?.summary || scenePlan.chapterGoal || 'Chapter completed';
  }
}

/**
 * Generate a natural chapter summary from holistic chapter content
 */
async function generateHolisticChapterSummary(
  chapterContent: string,
  scenePlan: import('../types/index.js').ScenePlan,
  bible: import('../types/index.js').StoryBible,
  chapterNumber: number
): Promise<string> {
  const llm = getLLM();
  
  const languageName = bible.language === 'zh' ? 'Chinese' : bible.language === 'ja' ? 'Japanese' : bible.language === 'ko' ? 'Korean' : bible.language === 'ar' ? 'Arabic' : bible.language === 'ru' ? 'Russian' : bible.language === 'es' ? 'Spanish' : bible.language === 'fr' ? 'French' : bible.language === 'de' ? 'German' : 'English';
  
  // Get first 3000 chars as preview (or full content if shorter)
  const contentPreview = chapterContent.length > 3000 
    ? chapterContent.substring(0, 3000) + '...'
    : chapterContent;
  
  const prompt = `You are a professional editor writing a chapter summary.

Story: ${bible.title}
Chapter ${chapterNumber}: ${scenePlan.chapterTitle || 'Untitled'}
Language: ${languageName}

Chapter Content Preview:
${contentPreview}

Write a natural, flowing summary of this chapter in ${languageName}.
- 2-4 sentences
- Capture the main events and character developments
- Do NOT use phrases like "Then" or "Next" to connect events
- Write as a cohesive narrative, not a list
- Focus on what happened and why it matters

Return ONLY the summary text, no JSON formatting.`;

  try {
    const response = await llm.complete(prompt, {
      temperature: 0.7,
      maxTokens: 300
    });
    
    return response.trim();
  } catch (error) {
    console.warn('  Failed to generate summary, using fallback');
    return scenePlan.chapterGoal || 'Chapter completed';
  }
}
