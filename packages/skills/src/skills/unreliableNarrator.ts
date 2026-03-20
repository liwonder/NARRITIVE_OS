import type { Skill } from '../types.js';

export const unreliableNarrator: Skill = {
  name: 'unreliable-narrator',
  displayName: {
    en: 'Unreliable Narrator',
    zh: '不可靠叙述者'
  },
  description: 'Create a narrator whose account cannot be fully trusted',
  instructions: `
When writing with the UNRELIABLE-NARRATOR skill:
- Show gaps between what narrator says and what actually happens
- Let narrator's biases color descriptions and judgments
- Create contradictions between narrator's account and other characters' versions
- Use selective memory: narrator remembers conveniently
- Show narrator's self-deception and rationalizations
- Let readers gradually realize narrator is untrustworthy
- Maintain consistency in how narrator is unreliable
- The revelation of unreliability should be meaningful to story
`,
  priority: 7,
  compatibleGenres: ['mystery', 'psychological', 'literary', 'noir'],
  incompatibleWith: [],
  applyWhen: 'always'
};
