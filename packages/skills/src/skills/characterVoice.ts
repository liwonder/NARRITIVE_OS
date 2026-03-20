import type { Skill } from '../types.js';

export const characterVoice: Skill = {
  name: 'character-voice',
  displayName: {
    en: 'Character Voice',
    zh: '人物声音'
  },
  description: 'Give each character a distinct, consistent voice',
  instructions: `
When writing with the CHARACTER-VOICE skill:
- Each character should have unique vocabulary, sentence length, and rhythm
- Consider education level, background, and personality in speech patterns
- Use verbal tics, catchphrases, or habitual expressions
- Some characters speak in questions, others in commands, others in observations
- Match dialogue to character's emotional state and situation
- Use dialect and accent sparingly and respectfully
- Characters should sound different enough that readers know who's speaking without tags
- Internal monologue should match external voice
`,
  priority: 7,
  compatibleGenres: [], // Universal skill
  incompatibleWith: [],
  applyWhen: 'always'
};
