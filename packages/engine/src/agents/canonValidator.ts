import { getLLM } from '../llm/client.js';
import type { CanonStore } from '../memory/canonStore.js';

export interface CanonValidationResult {
  valid: boolean;
  violations: string[];
}

const VALIDATOR_PROMPT = `Check the following chapter against the Story Canon. Identify any contradictions.

## Story Canon
{{canon}}

## Chapter Text
{{chapterText}}

## Instructions
List any contradictions between the chapter and the canon facts. A contradiction occurs when:
- A character's status/background is different from canon
- A plot thread status is contradicted
- World rules are violated

Return JSON:
{
  "valid": true/false,
  "violations": ["description of contradiction 1", "description of contradiction 2"]
}

If no contradictions, return {"valid": true, "violations": []}`;

export class CanonValidator {
  async validate(chapterText: string, canon: CanonStore): Promise<CanonValidationResult> {
    if (canon.facts.length === 0) {
      return { valid: true, violations: [] };
    }

    const { formatCanonForPrompt } = await import('../memory/canonStore.js');
    const canonSection = formatCanonForPrompt(canon);

    const prompt = VALIDATOR_PROMPT
      .replace('{{canon}}', canonSection)
      .replace('{{chapterText}}', chapterText.substring(0, 3000));

    const response = await getLLM().complete(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 500,
    });

    try {
      const result = JSON.parse(response) as CanonValidationResult;
      return result;
    } catch {
      return { valid: true, violations: [] };
    }
  }
}

export const canonValidator = new CanonValidator();
