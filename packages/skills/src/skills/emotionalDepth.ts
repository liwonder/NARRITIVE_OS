import type { Skill } from '../types.js';

export const emotionalDepth: Skill = {
  name: 'emotional-depth',
  displayName: {
    en: 'Emotional Depth',
    zh: '情感深度'
  },
  description: 'Create profound emotional resonance and character interiority',
  instructions: `
When writing with the EMOTIONAL-DEPTH skill:
- Show emotions through physical sensations, not just naming feelings
- Use subtext: what characters don't say reveals more than what they do
- Explore conflicting emotions simultaneously (joy and sadness, love and fear)
- Connect present emotions to past experiences and wounds
- Show emotional growth through changed reactions to similar situations
- Use metaphor and imagery to convey complex feelings
- Give characters private thoughts that contrast with public faces
- Let silence and pauses carry emotional weight
`,
  priority: 7,
  compatibleGenres: ['romance', 'literary', 'drama', 'historical'],
  incompatibleWith: [],
  applyWhen: 'always'
};
