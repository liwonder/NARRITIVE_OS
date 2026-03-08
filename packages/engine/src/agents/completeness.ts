import { getLLM } from '../llm/client.js';
import type { CompletenessResult } from '../types/index.js';

const COMPLETENESS_PROMPT = `Determine whether the following chapter text ends at a natural stopping point.

A chapter is COMPLETE if:
- It ends at the end of a scene or chapter break
- It does not cut off mid-sentence or mid-paragraph
- It has narrative closure for this segment

A chapter is INCOMPLETE if:
- It cuts off mid-sentence
- It ends abruptly mid-scene
- The narrative clearly continues

## Chapter Text

{{chapterText}}

## Response

Return only one word:

COMPLETE

or

INCOMPLETE`;

export class CompletenessChecker {
  private promptTemplate: string;

  constructor() {
    this.promptTemplate = COMPLETENESS_PROMPT;
  }

  async check(chapterText: string): Promise<CompletenessResult> {
    const prompt = this.promptTemplate.replace('{{chapterText}}', chapterText);

    const response = await getLLM().complete(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 10,
    });

    const normalized = response.trim().toUpperCase();
    const isComplete = normalized.includes('COMPLETE') && !normalized.includes('INCOMPLETE');

    return {
      isComplete,
      reason: isComplete ? undefined : 'Chapter appears to be cut off mid-content',
    };
  }
}

export const completenessChecker = new CompletenessChecker();
