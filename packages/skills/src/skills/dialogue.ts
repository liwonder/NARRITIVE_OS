import type { Skill } from '../types.js';

export const dialogueNatural: Skill = {
  name: 'dialogue-natural',
  displayName: {
    en: 'Natural Dialogue',
    zh: '自然对话'
  },
  description: 'Create realistic, character-revealing conversations',
  instructions: `
When writing with the DIALOGUE-NATURAL skill:
- Each character should have a distinct voice (vocabulary, rhythm, sentence length)
- Use dialogue to reveal character, not just convey information
- Include subtext - what characters don't say is as important as what they do
- Break up dialogue with action beats
- Use interruptions, hesitations, and unfinished thoughts
- Avoid "on the nose" dialogue - people rarely say exactly what they mean
- Read dialogue aloud to check if it sounds natural
`,
  priority: 6,
  compatibleGenres: [], // Works for all genres
  incompatibleWith: [],
  applyWhen: 'always'
};
