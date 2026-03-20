import type { Skill } from '../types.js';

export const cliffhanger: Skill = {
  name: 'cliffhanger',
  displayName: {
    en: 'Cliffhanger',
    zh: '悬念结尾'
  },
  description: 'End chapters with unresolved tension',
  instructions: `
When writing with the CLIFFHANGER skill:
- End scenes/chapters at moments of maximum tension
- Interrupt action at critical points (someone about to die, secret about to be revealed)
- Create "what happens next?" urgency
- Use sudden revelations or unexpected events
- Leave immediate danger unresolved
- Make the reader desperate to continue reading
`,
  priority: 8,
  compatibleGenres: ['thriller', 'horror', 'mystery', 'adventure', 'suspense'],
  incompatibleWith: ['reflective'],
  applyWhen: 'chapter-end'
};
