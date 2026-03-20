import type { Skill } from '../types.js';

export const suspense: Skill = {
  name: 'suspense',
  displayName: {
    en: 'Suspense',
    zh: '悬念制造'
  },
  description: 'Build anticipation and keep readers on edge',
  instructions: `
When writing with the SUSPENSE skill:
- Delay revealing important information to create anticipation
- Use time pressure (deadlines, countdowns, impending danger)
- Cut between parallel actions to heighten tension
- End scenes with unresolved questions or threats
- Use sensory details that suggest danger or uncertainty
- Let the reader know something the character doesn't (dramatic irony)
`,
  priority: 7,
  compatibleGenres: ['thriller', 'horror', 'mystery', 'suspense'],
  incompatibleWith: ['light-hearted'],
  applyWhen: 'high-tension'
};
