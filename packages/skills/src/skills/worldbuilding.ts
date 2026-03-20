import type { Skill } from '../types.js';

export const worldbuilding: Skill = {
  name: 'worldbuilding',
  displayName: {
    en: 'World Building',
    zh: '世界观构建'
  },
  description: 'Create immersive, detailed story worlds',
  instructions: `
When writing with the WORLDBUILDING skill:
- Show the world through character experience, not exposition dumps
- Include sensory details specific to this world (smells, sounds, textures)
- Reveal world rules through consequences, not explanations
- Make the setting feel lived-in (wear, tear, history)
- Use local idioms, slang, and cultural references
- Balance familiar and strange elements
- Every world detail should serve story or character
`,
  priority: 6,
  compatibleGenres: ['sci-fi', 'fantasy', 'historical', 'post-apocalyptic'],
  incompatibleWith: [],
  applyWhen: 'scene-start'
};
