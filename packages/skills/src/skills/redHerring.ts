import type { Skill } from '../types.js';

export const redHerring: Skill = {
  name: 'red-herring',
  displayName: {
    en: 'Red Herring',
    zh: '误导线索'
  },
  description: 'Plant false clues to mislead readers',
  instructions: `
When writing with the RED-HERRING skill:
- Create suspicious characters who seem guilty but are innocent
- Plant evidence that points to wrong conclusions
- Use coincidences that seem meaningful but aren't
- Let characters misinterpret situations based on limited information
- Create parallel situations that seem connected but aren't
- Make innocent actions appear suspicious
- Balance: red herrings should be plausible but ultimately explained
- The real solution should be equally or more satisfying than the false leads
`,
  priority: 7,
  compatibleGenres: ['mystery', 'thriller', 'suspense'],
  incompatibleWith: [],
  applyWhen: 'always'
};
