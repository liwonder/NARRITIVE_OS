import type { Skill } from '../types.js';

export const flashback: Skill = {
  name: 'flashback',
  displayName: {
    en: 'Flashback',
    zh: '闪回'
  },
  description: 'Weave past events into present narrative',
  instructions: `
When writing with the FLASHBACK skill:
- Use sensory triggers to transition into flashbacks (smells, sounds, objects)
- Keep flashbacks brief and focused on emotional relevance
- Distinguish past from present through tense, tone, or detail density
- Reveal character motivation through key past moments
- Connect past wounds to present conflicts
- Use flashbacks to raise stakes, not just provide information
- Return to present with changed perspective
- Avoid flashback-within-flashback confusion
`,
  priority: 6,
  compatibleGenres: ['literary', 'drama', 'thriller', 'historical'],
  incompatibleWith: [],
  applyWhen: 'always'
};
