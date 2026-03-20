import type { Skill } from '../types.js';

export const foreshadowing: Skill = {
  name: 'foreshadowing',
  displayName: {
    en: 'Foreshadowing',
    zh: '伏笔铺垫'
  },
  description: 'Plant subtle hints of future events',
  instructions: `
When writing with the FORESHADOWING skill:
- Drop subtle hints about future events that seem insignificant at first
- Use symbolic objects, phrases, or situations that will become meaningful later
- Create parallels between early scenes and later climactic moments
- Use prophecy, dreams, or omens that hint at future developments
- Plant "Chekhov's guns" - elements that must pay off later
- Balance: hints should be noticeable in retrospect but not obvious initially
- Connect character decisions early to consequences later
`,
  priority: 6,
  compatibleGenres: ['mystery', 'thriller', 'fantasy', 'literary', 'horror'],
  incompatibleWith: [],
  applyWhen: 'always'
};
