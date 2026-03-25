import { getLLM } from '../llm/client.js';
import type { GenerationContext, WriterOutput, ScenePlan, Scene } from '../types/index.js';
import type { CanonStore } from '../memory/canonStore.js';
import { formatCanonForPrompt } from '../memory/canonStore.js';
import type { MemoryRetriever } from '../memory/memoryRetriever.js';
import type { DirectorOutput } from './storyDirector.js';
import { calculateWordCount } from '../utils/text.js';

const WRITER_PROMPT = `You are a professional novelist writing immersive narrative prose.

Write Chapter {{chapterNumber}} of the novel.

## Story Bible

**Title:** {{title}}
**Theme:** {{theme}}
**Genre:** {{genre}}
**Setting:** {{setting}}
**Tone:** {{tone}}
**Language:** {{language}}

**Premise:**
{{premise}}

## Characters

{{characters}}

## Story Canon

{{canon}}

## Relevant Memories

{{memories}}

## Recent Chapter Summaries

{{recentSummaries}}

## Chapter Goal

{{chapterGoal}}

## Writing Guidelines

- Write in {{language}} language
- Write in third person limited perspective
- Show, don't tell
- Maintain consistent character voices
- Build toward the chapter goal naturally
- End at a natural stopping point (not mid-scene)
- Reference relevant past memories naturally when appropriate
- Target length: {{targetWordCount}} words

## Format

Start your response with a chapter title on the first line, formatted as:
# Chapter Title Here

Then write the chapter content.

Write the full chapter now.`;

export class ChapterWriter {
  private promptTemplate: string;

  constructor() {
    this.promptTemplate = WRITER_PROMPT;
  }

  async write(context: GenerationContext, canon?: CanonStore, memoryRetriever?: MemoryRetriever): Promise<WriterOutput> {
    const { bible, state, chapterNumber, targetWordCount = 2000 } = context;
    
    const canonSection = canon ? formatCanonForPrompt(canon) : '';

    // Retrieve relevant memories
    let memoriesSection = 'No relevant memories yet.';
    if (memoryRetriever && chapterNumber > 1) {
      const memories = await memoryRetriever.retrieveForChapter({
        bible,
        state,
        currentChapter: chapterNumber,
      });
      memoriesSection = memoryRetriever.formatMemoriesForPrompt(memories) || 'No highly relevant memories for this chapter.';
    }

    const recentSummaries = state.chapterSummaries
      .slice(-3)
      .map(s => `Chapter ${s.chapterNumber}: ${s.summary}`)
      .join('\n\n') || 'This is the first chapter.';

    const characters = bible.characters
      .map(c => `- ${c.name} (${c.role}): ${c.personality.join(', ')}. Goals: ${c.goals.join(', ')}`)
      .join('\n');

    const chapterGoal = this.inferChapterGoal(bible, state, chapterNumber);

    const prompt = this.promptTemplate
      .replace('{{chapterNumber}}', chapterNumber.toString())
      .replace('{{title}}', bible.title)
      .replace('{{theme}}', bible.theme)
      .replace('{{genre}}', bible.genre)
      .replace('{{setting}}', bible.setting)
      .replace('{{tone}}', bible.tone)
      .replace('{{language}}', bible.language === 'zh' ? 'Chinese' : bible.language === 'ja' ? 'Japanese' : bible.language === 'ko' ? 'Korean' : bible.language === 'ar' ? 'Arabic' : bible.language === 'ru' ? 'Russian' : bible.language === 'es' ? 'Spanish' : bible.language === 'fr' ? 'French' : bible.language === 'de' ? 'German' : 'English')
      .replace('{{premise}}', bible.premise)
      .replace('{{characters}}', characters)
      .replace('{{memories}}', memoriesSection)
      .replace('{{recentSummaries}}', recentSummaries)
      .replace('{{chapterGoal}}', chapterGoal)
      .replace('{{targetWordCount}}', targetWordCount.toString())
      .replace('{{canon}}', canonSection);

    const content = await getLLM().complete(prompt, {
      temperature: 0.8,
      maxTokens: 4000,
      task: 'generation',
    });

    const title = this.extractTitle(content) || `Chapter ${chapterNumber}`;
    const wordCount = calculateWordCount(content);

    return { content, title, wordCount };
  }

  async continue(existingContent: string, context: GenerationContext): Promise<string> {
    const prompt = `Continue the following chapter from where it left off. Do not repeat what has already been written. Write the continuation only.

## Story Context

${context.bible.premise}

## Existing Chapter Content

${existingContent}

## Continuation

Continue naturally from the last sentence:`;

    const continuation = await getLLM().complete(prompt, {
      temperature: 0.8,
      maxTokens: 2000,
      task: 'generation',
    });

    return existingContent + '\n\n' + continuation;
  }

  /**
   * Write a full chapter holistically based on scene framework
   * The writer organically weaves scenes together for natural flow
   */
  async writeHolistic(
    context: GenerationContext,
    scenePlan: ScenePlan,
    directorOutput: DirectorOutput,
    canon?: CanonStore,
    memoryRetriever?: MemoryRetriever
  ): Promise<WriterOutput> {
    const { bible, state, chapterNumber } = context;
    
    const canonSection = canon ? formatCanonForPrompt(canon) : '';

    // Retrieve relevant memories
    let memoriesSection = 'No relevant memories yet.';
    if (memoryRetriever && chapterNumber > 1) {
      const memories = await memoryRetriever.retrieveForChapter({
        bible,
        state,
        currentChapter: chapterNumber,
      });
      memoriesSection = memoryRetriever.formatMemoriesForPrompt(memories) || 'No highly relevant memories for this chapter.';
    }

    const recentSummaries = state.chapterSummaries
      .slice(-3)
      .map(s => `Chapter ${s.chapterNumber}: ${s.summary}`)
      .join('\n\n') || 'This is the first chapter.';

    const characters = bible.characters
      .map(c => `- ${c.name} (${c.role}): ${c.personality.join(', ')}. Goals: ${c.goals.join(', ')}`)
      .join('\n');

    // Format scene framework for the writer
    const sceneFramework = scenePlan.scenes.map((s: Scene) => 
      `Scene ${s.id}: [${s.type?.toUpperCase() || 'SCENE'}] Tension ${s.tension}/10 - ${s.purpose}`
    ).join('\n');

    const languageName = bible.language === 'zh' ? 'Chinese' : bible.language === 'ja' ? 'Japanese' : bible.language === 'ko' ? 'Korean' : bible.language === 'ar' ? 'Arabic' : bible.language === 'ru' ? 'Russian' : bible.language === 'es' ? 'Spanish' : bible.language === 'fr' ? 'French' : bible.language === 'de' ? 'German' : 'English';

    const prompt = `You are a professional novelist writing immersive narrative prose.

Write Chapter ${chapterNumber} of the novel holistically. Do not write separate scenes - weave them together into a flowing narrative.

## Story Bible

**Title:** ${bible.title}
**Theme:** ${bible.theme}
**Genre:** ${bible.genre}
**Setting:** ${bible.setting}
**Tone:** ${bible.tone}
**Language:** ${languageName}

**Premise:**
${bible.premise}

## Characters

${characters}

## Story Canon

${canonSection}

## Relevant Memories

${memoriesSection}

## Recent Chapter Summaries

${recentSummaries}

## Chapter Framework (Write as ONE flowing narrative)

**Chapter Goal:** ${scenePlan.chapterGoal}
**Target Tension Arc:** Build toward ${scenePlan.targetTension}/10

**Scene Progression (integrate these organically):**
${sceneFramework}

**Director's Vision:**
${directorOutput.overallGoal}

**Focus Characters:** ${directorOutput.focusCharacters.join(', ')}

## Writing Guidelines

- Write in ${languageName} language
- Write in third person limited perspective
- Show, don't tell
- Maintain consistent character voices
- DO NOT label scenes or use scene breaks
- Let the narrative flow naturally from one moment to the next
- Reference relevant past memories naturally when appropriate
- **CRITICAL: Write ${scenePlan.scenes.length * 1000}-${scenePlan.scenes.length * 1500} words minimum. This is a substantial chapter, not a short scene.**
- Develop each moment fully with description, dialogue, and character thoughts
- End at a natural stopping point

## Format

Start your response with a chapter title on the first line, formatted as:
# ${scenePlan.chapterTitle}

Then write the chapter content as one continuous narrative.

Write the full chapter now.`;

    const content = await getLLM().complete(prompt, {
      temperature: 0.8,
      maxTokens: 8000,
      task: 'generation',
    });

    const title = this.extractTitle(content) || scenePlan.chapterTitle || `Chapter ${chapterNumber}`;
    const wordCount = calculateWordCount(content);

    return { content, title, wordCount };
  }

  private inferChapterGoal(bible: GenerationContext['bible'], state: GenerationContext['state'], chapterNumber: number): string {
    const progress = chapterNumber / bible.targetChapters;
    
    if (progress < 0.2) {
      return 'Establish the setting, introduce the main character, and hint at the central conflict.';
    } else if (progress < 0.5) {
      return 'Develop the conflict, introduce complications, and raise stakes.';
    } else if (progress < 0.8) {
      return 'Escalate tension, reveal important information, and move toward climax.';
    } else {
      return 'Build toward resolution and begin tying up plot threads.';
    }
  }

  private extractTitle(content: string): string | null {
    const lines = content.split('\n');
    for (const line of lines.slice(0, 10)) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ') || trimmed.startsWith('Chapter')) {
        return trimmed.replace(/^#\s*/, '').trim();
      }
    }
    return null;
  }

  /**
   * Calculate word count for both English and Chinese text
   * - English: count words separated by whitespace
   * - Chinese: count characters (each character is a "word")
   */

}

export const writer = new ChapterWriter();
