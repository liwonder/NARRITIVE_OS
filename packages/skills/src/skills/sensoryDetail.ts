import type { Skill } from '../types.js';

export const sensoryDetail: Skill = {
  name: 'sensory-detail',
  displayName: {
    en: 'Sensory Detail',
    zh: '感官细节'
  },
  description: 'Engage all five senses for immersive scenes',
  instructions: `
When writing with the SENSORY-DETAIL skill:
- Go beyond sight: include sounds, smells, textures, tastes
- Use sensory details to reveal character (what they notice)
- Create mood through sensory filtering (fear sharpens some senses, dulls others)
- Use unexpected sensory combinations (the taste of fear, the sound of color)
- Ground abstract emotions in physical sensations
- Vary which sense dominates per scene
- Use sensory details for transitions between scenes
- Make sensory details active, not static descriptions
`,
  priority: 7,
  compatibleGenres: [], // Universal
  incompatibleWith: [],
  applyWhen: 'always'
};
