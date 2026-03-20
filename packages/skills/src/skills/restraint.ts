import type { Skill } from '../types.js';

export const restraint: Skill = {
  name: 'restraint',
  displayName: {
    en: 'Restraint',
    zh: '克制留白'
  },
  description: 'Less is more - imply rather than explain',
  instructions: `
When writing with the RESTRAINT skill:
- Understate emotional moments for greater impact
- Leave horror to imagination rather than graphic description
- End scenes early, let readers fill gaps
- Use implication over exposition
- Trust readers to understand without hand-holding
- Silence speaks louder than words
- Suggest violence rather than show it
- Emotional restraint creates tension
`,
  priority: 6,
  compatibleGenres: ['literary', 'horror', 'noir', 'drama'],
  incompatibleWith: [],
  applyWhen: 'always'
};
