import { getLLM } from '../llm/client.js';
import type { ChapterSummary } from '../types/index.js';

const SUMMARIZER_PROMPT = `Summarize the following chapter in under 120 tokens.

Focus on:
- Major events that occurred
- Plot progress made
- Important character changes or revelations

## Chapter Text

{{chapterText}}

## Summary`;

export class ChapterSummarizer {
  private promptTemplate: string;

  constructor() {
    this.promptTemplate = SUMMARIZER_PROMPT;
  }

  async summarize(chapterText: string, chapterNumber: number): Promise<ChapterSummary> {
    const prompt = this.promptTemplate.replace('{{chapterText}}', chapterText);

    const summary = await getLLM().complete(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 200,
    });

    return {
      chapterNumber,
      summary: summary.trim(),
      keyEvents: this.extractKeyEvents(chapterText),
      characterChanges: {},
    };
  }

  private extractKeyEvents(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const events: string[] = [];
    
    for (const sentence of sentences.slice(0, 20)) {
      const lower = sentence.toLowerCase();
      if (
        lower.includes('discovered') ||
        lower.includes('realized') ||
        lower.includes('decided') ||
        lower.includes('arrived') ||
        lower.includes('found') ||
        lower.includes('learned')
      ) {
        events.push(sentence.trim());
      }
      if (events.length >= 3) break;
    }
    
    return events;
  }
}

export const summarizer = new ChapterSummarizer();
