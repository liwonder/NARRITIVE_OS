import type { Skill } from '../types.js';

export const comicTiming: Skill = {
  name: 'comic-timing',
  displayName: {
    en: 'Comic Timing',
    zh: '喜剧节奏'
  },
  description: 'Create humor through timing, juxtaposition, and wit',
  instructions: `
When writing with the COMIC-TIMING skill:
- Use the rule of three: two setups, one unexpected payoff
- Create humor through unexpected juxtapositions
- Use callbacks: reference earlier jokes for layered comedy
- Timing: pause before punchlines, quicken during banter
- Use irony and understatement for dry humor
- Physical comedy: describe actions with precise timing
- Let characters be funny without trying to be funny
- Use wit and wordplay appropriate to character voices
- Comedy often comes from characters taking themselves too seriously
`,
  priority: 6,
  compatibleGenres: ['comedy', 'romance', 'adventure'],
  incompatibleWith: ['horror', 'tragedy'],
  applyWhen: 'low-tension'
};
