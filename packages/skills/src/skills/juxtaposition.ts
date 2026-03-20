import type { Skill } from '../types.js';

export const juxtaposition: Skill = {
  name: 'juxtaposition',
  displayName: {
    en: 'Juxtaposition',
    zh: '对比并置'
  },
  description: 'Create meaning through contrast and parallel',
  instructions: `
When writing with the JUXTAPOSITION skill:
- Place opposing elements side by side for impact
- Cut between parallel scenes to create resonance
- Contrast character reactions to same event
- Show before/after through scene pairing
- Use setting-character contrast (cheerful room, sad character)
- Create irony through expectation vs reality
- Parallel structure in prose creates rhythm
- Contrast elevates both elements
`,
  priority: 5,
  compatibleGenres: ['literary', 'satire', 'drama', 'comedy'],
  incompatibleWith: [],
  applyWhen: 'always'
};
