import type { Skill } from '../types.js';

export const subtext: Skill = {
  name: 'subtext',
  displayName: {
    en: 'Subtext',
    zh: '潜台词'
  },
  description: 'Convey meaning beneath the surface of dialogue and action',
  instructions: `
When writing with the SUBTEXT skill:
- Characters say one thing but mean another
- Use pauses, hesitations, and interruptions to convey tension
- Show power dynamics through who speaks, who listens, who interrupts
- Let body language contradict spoken words
- Create layers: what characters say, what they think, what they feel
- Use cultural references with hidden meanings
- Silence and what's NOT said carries weight
- Readers should understand more than characters do
`,
  priority: 7,
  compatibleGenres: ['drama', 'romance', 'literary', 'noir'],
  incompatibleWith: [],
  applyWhen: 'always'
};
