import { writer } from '../agents/writer.js';
import { completenessChecker } from '../agents/completeness.js';
import { summarizer } from '../agents/summarizer.js';
import { canonValidator } from '../agents/canonValidator.js';
import { memoryExtractor } from '../agents/memoryExtractor.js';
import { planScenes } from '../agents/scenePlanner.js';
import { writeScene } from '../agents/sceneWriter.js';
import { validateScene } from '../agents/sceneValidator.js';
import { assembleChapter } from '../scene/sceneAssembler.js';
import { extractSceneOutcome, mergeSceneOutcomes } from '../scene/sceneOutcomeExtractor.js';
import { storyDirector, type DirectorOutput } from '../agents/storyDirector.js';
import { generateTensionGuidance, analyzeTension } from '../agents/tensionController.js';
import { createStructuredState } from '../story/structuredState.js';
import { CharacterAgentSystem, type CharacterDecision } from '../world/characterAgent.js';
import type { GenerationContext, Chapter, ChapterSummary, SceneOutput, SceneOutcome } from '../types/index.js';
import type { CanonStore } from '../memory/canonStore.js';
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
    targetSceneCount = 4
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
    targetSceneCount = 4
  } = options;

  console.log(`  Using scene-level generation (${targetSceneCount} scenes)...`);

  // Initialize memory retriever if vector store provided
  let memoryRetriever: MemoryRetriever | undefined;
  if (vectorStore) {
    await vectorStore.initialize();
    memoryRetriever = createMemoryRetriever(vectorStore);
  }

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
    targetSceneCount
    // TODO: Pass directorOutput to scene planner once interface is updated
  });
  console.log(`  Planned ${scenePlan.scenes.length} scenes`);

  // Step 2: Character Agents - Decide character actions for each scene
  console.log('  Character Agents deciding actions...');
  const characterSystem = new CharacterAgentSystem();
  const characterDecisions: Map<number, CharacterDecision[]> = new Map();
  let previousSceneForCharacters: string | undefined = previousSummary;
  
  for (const scene of scenePlan.scenes) {
    const decisions: CharacterDecision[] = [];
    
    // Get decisions from each character in the scene
    for (const characterName of scene.characters) {
      const character = bible.characters.find(c => c.name === characterName);
      if (!character) continue;
      
      // Create agent from character data
      const agent = characterSystem.createAgent(
        {
          name: character.name,
          goals: character.goals,
          location: scene.location,
          knowledge: [],
          relationships: {},
          emotionalState: 'neutral',
          development: []
        },
        character.personality
      );
      
      // Get other characters in scene
      const otherAgents = scene.characters
        .filter(name => name !== characterName)
        .map(name => bible.characters.find(c => c.name === name))
        .filter(Boolean)
        .map(c => characterSystem.createAgent(
          {
            name: c!.name,
            goals: c!.goals,
            location: scene.location,
            knowledge: [],
            relationships: {},
            emotionalState: 'neutral',
            development: []
          },
          c!.personality
        ));
      
      try {
        const decision = await characterSystem.getDecision({
          character: agent,
          otherCharacters: otherAgents,
          worldEvents: previousSceneForCharacters ? [previousSceneForCharacters] : [],
          currentChapter: chapterNumber,
          storyContext: directorOutput.overallGoal
        });
        decisions.push(decision);
        console.log(`    ${characterName}: ${decision.action}`);
      } catch (e) {
        // Fallback to simple decision
        const simpleDecision = characterSystem.getSimpleDecision({
          character: agent,
          otherCharacters: otherAgents,
          worldEvents: previousSceneForCharacters ? [previousSceneForCharacters] : [],
          currentChapter: chapterNumber,
          storyContext: directorOutput.overallGoal
        });
        decisions.push(simpleDecision);
        console.log(`    ${characterName}: ${simpleDecision.action} (fallback)`);
      }
    }
    
    characterDecisions.set(scene.id, decisions);
  }

  // Step 3: Generate each scene with character decisions
  const sceneOutputs: SceneOutput[] = [];
  const sceneOutcomes: SceneOutcome[] = [];
  let previousSceneSummary: string | undefined;

  for (const scene of scenePlan.scenes) {
    console.log(`  Generating scene ${scene.id}/${scenePlan.scenes.length}...`);

    // Get canon facts for validation
    const canonFacts = canon ? canon.facts.map((f: { subject: string; attribute: string; value: string }) => `${f.subject} ${f.attribute}: ${f.value}`) : [];

    // Get relevant memories
    let relevantMemories: string[] = [];
    if (memoryRetriever && vectorStore) {
      const results = await vectorStore.searchSimilar(scene.purpose, 5);
      relevantMemories = results.map((r: { memory: { content: string } }) => r.memory.content);
    }
    
    // Get character decisions for this scene
    const decisions = characterDecisions.get(scene.id) || [];
    const characterActions = decisions.map(d => `${d.character}: ${d.action}`).join('\n');

    // Generate the scene with character guidance
    let sceneOutput = await writeScene({
      scene,
      bible,
      state,
      chapterNumber,
      previousSceneSummary,
      canonFacts,
      relevantMemories,
      activeSkills: [`Character Actions:\n${characterActions}`] // Pass character decisions
    });

    // Validate the scene
    if (validateCanon && canon) {
      const validation = await validateScene({
        scene,
        sceneOutput,
        bible,
        canonFacts
      });

      if (!validation.isValid) {
        console.log(`    ⚠️  Scene validation issues: ${validation.violations.join(', ')}`);
      }
    }

    // Extract outcomes from scene
    const outcome = await extractSceneOutcome({
      scene,
      sceneOutput,
      bible
    });
    sceneOutcomes.push(outcome);

    // Store scene memory
    if (vectorStore) {
      await vectorStore.addMemory({
        storyId: bible.id,
        chapterNumber,
        content: `Scene ${scene.id}: ${sceneOutput.summary}`,
        category: 'plot',
        timestamp: new Date(),
      });
    }

    sceneOutputs.push(sceneOutput);
    previousSceneSummary = sceneOutput.summary;
  }

  // Step 3: Assemble scenes into chapter
  console.log('  Assembling chapter...');
  const assembled = assembleChapter(sceneOutputs, scenePlan, chapterNumber);

  // Step 4: Validate full chapter
  let violations: string[] = [];
  if (validateCanon && canon) {
    console.log('  Validating chapter...');
    const validation = await canonValidator.validate(assembled.content, canon);
    violations = validation.violations;
    if (violations.length > 0) {
      console.log(`  ⚠️  Canon violations detected: ${violations.length}`);
    }
  }

  // Step 5: Create chapter summary from merged outcomes
  const mergedOutcome = mergeSceneOutcomes(sceneOutcomes);
  const summary: ChapterSummary = {
    chapterNumber,
    summary: assembled.summary,
    keyEvents: mergedOutcome.events.slice(0, 5),
    characterChanges: mergedOutcome.characterChanges
  };

  const chapter: Chapter = {
    id: generateId(),
    storyId: bible.id,
    number: chapterNumber,
    title: assembled.title,
    content: assembled.content,
    summary: summary.summary,
    wordCount: assembled.wordCount,
    generatedAt: new Date(),
  };

  console.log(`  Generated: ${assembled.wordCount} words (${assembled.sceneCount} scenes)`);

  return { 
    chapter, 
    summary, 
    violations, 
    memoriesExtracted: sceneOutputs.length 
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
