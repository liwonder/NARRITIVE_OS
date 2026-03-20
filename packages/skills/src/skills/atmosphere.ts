import type { Skill } from '../types.js';

export const atmosphere: Skill = {
  name: 'atmosphere',
  displayName: {
    en: 'Atmosphere',
    zh: '氛围营造'
  },
  description: 'Create immersive mood and environmental tone',
  instructions: `
When writing with the ATMOSPHERE skill:
- Use weather, lighting, and environment to mirror emotional tone
- Create sensory details specific to the setting (sounds, smells, textures)
- Use pathetic fallacy: nature reflects emotional states
- Build mood through word choice and sentence rhythm
- Create contrast between setting and character emotions
- Use setting as obstacle or ally to character goals
- Establish time of day, season, and weather to ground scenes
- Make the environment feel alive and responsive
`,
  priority: 6,
  compatibleGenres: ['horror', 'gothic', 'noir', 'fantasy', 'literary'],
  incompatibleWith: [],
  applyWhen: 'scene-start'
};
