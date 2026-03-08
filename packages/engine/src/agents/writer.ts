import { getLLM } from '../llm/client.js';
import type { GenerationContext, WriterOutput } from '../types/index.js';
import type { CanonStore } from '../memory/canonStore.js';
import { formatCanonForPrompt } from '../memory/canonStore.js';

const WRITER_PROMPT = `You are a professional novelist writing immersive narrative prose.

Write Chapter {{chapterNumber}} of the novel.

## Story Bible

**Title:** {{title}}
**Theme:** {{theme}}
**Genre:** {{genre}}
**Setting:** {{setting}}
**Tone:** {{tone}}

**Premise:**
{{premise}}

## Characters

{{characters}}

## Story Canon

{{canon}}

## Recent Chapter Summaries

{{recentSummaries}}

## Chapter Goal

{{chapterGoal}}

## Writing Guidelines

- Write in third person limited perspective
- Show, don't tell
- Maintain consistent character voices
- Build toward the chapter goal naturally
- End at a natural stopping point (not mid-scene)
- Target length: {{targetWordCount}} words

Write the full chapter now.`;

export class ChapterWriter {
  private promptTemplate: string;

  constructor() {
    this.promptTemplate = WRITER_PROMPT;
  }

  async write(context: GenerationContext, canon?: CanonStore): Promise<WriterOutput> {
    const { bible, state, chapterNumber, targetWordCount = 2000 } = context;
    
    const canonSection = canon ? formatCanonForPrompt(canon) : '';

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
      .replace('{{premise}}', bible.premise)
      .replace('{{characters}}', characters)
      .replace('{{recentSummaries}}', recentSummaries)
      .replace('{{chapterGoal}}', chapterGoal)
      .replace('{{targetWordCount}}', targetWordCount.toString())
      .replace('{{canon}}', canonSection);

    const content = await getLLM().complete(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 4000,
    });

    const title = this.extractTitle(content) || `Chapter ${chapterNumber}`;
    const wordCount = content.split(/\s+/).length;

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
      model: 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 2000,
    });

    return existingContent + '\n\n' + continuation;
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
}

export const writer = new ChapterWriter();
