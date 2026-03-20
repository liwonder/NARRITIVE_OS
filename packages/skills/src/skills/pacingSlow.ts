import type { Skill } from '../types.js';

export const pacingSlow: Skill = {
  name: 'pacing-slow',
  displayName: {
    en: 'Slow Pacing',
    zh: '慢节奏'
  },
  description: 'Allow moments of reflection and atmosphere',
  instructions: `
When writing with the PACING-SLOW skill:
- Take time to describe settings with rich sensory detail
- Explore character thoughts and reflections
- Use longer, more complex sentences
- Create contemplative moments between action
- Build atmosphere through environmental description
- Let scenes breathe with meaningful pauses
- Develop subplots and secondary characters
- Use foreshadowing that requires time to develop
- Balance action with moments of quiet tension
`,
  priority: 5,
  compatibleGenres: ['literary', 'romance', 'historical', 'drama'],
  incompatibleWith: ['pacing-fast'],
  applyWhen: 'low-tension'
};
