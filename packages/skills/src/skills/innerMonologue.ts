import type { Skill } from '../types.js';

export const innerMonologue: Skill = {
  name: 'inner-monologue',
  displayName: {
    en: 'Inner Monologue',
    zh: '内心独白'
  },
  description: 'Reveal character thoughts and internal conflict',
  instructions: `
When writing with the INNER-MONOLOGUE skill:
- Show thought process, not just conclusions
- Use stream of consciousness for emotional intensity
- Contrast internal thoughts with external speech
- Reveal doubts, fears, and secret desires
- Show decision-making process and internal debate
- Use formatting (italics, tags) consistently
- Keep thoughts in character's voice
- Balance internal and external action
`,
  priority: 6,
  compatibleGenres: ['literary', 'romance', 'psychological', 'drama'],
  incompatibleWith: [],
  applyWhen: 'always'
};
