import type { Skill } from '../types.js';

export const pacingFast: Skill = {
  name: 'pacing-fast',
  displayName: {
    en: 'Fast Pacing',
    zh: '快节奏'
  },
  description: 'Maintain rapid story momentum',
  instructions: `
When writing with the PACING-FAST skill:
- Use short sentences and paragraphs during action
- Cut unnecessary description and exposition
- Start scenes in the middle of action, not with setup
- Use dialogue to convey information quickly
- Eliminate transitions between scenes when possible
- Create cause-and-effect chains: each event triggers the next
- Use cliffhangers at scene and chapter endings
- Compress time: skip over uneventful periods
- Maintain high stakes throughout
`,
  priority: 7,
  compatibleGenres: ['thriller', 'action', 'adventure', 'horror'],
  incompatibleWith: ['pacing-slow', 'reflective'],
  applyWhen: 'always'
};
