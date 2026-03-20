import type { Skill } from '../types.js';

export const symbolism: Skill = {
  name: 'symbolism',
  displayName: {
    en: 'Symbolism',
    zh: '象征手法'
  },
  description: 'Use objects, actions, and images to represent deeper meanings',
  instructions: `
When writing with the SYMBOLISM skill:
- Objects carry emotional or thematic weight beyond their function
- Recurring motifs develop and transform meaning
- Weather and setting mirror internal states
- Character actions symbolize psychological states
- Symbols should feel organic, not forced
- Layer symbols: personal, cultural, universal
- Pay off symbols by end of story
- Let readers discover symbolism, don't explain it
`,
  priority: 5,
  compatibleGenres: ['literary', 'fantasy', 'sci-fi', 'drama'],
  incompatibleWith: [],
  applyWhen: 'always'
};
