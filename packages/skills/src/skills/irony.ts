import type { Skill } from '../types.js';

export const irony: Skill = {
  name: 'irony',
  displayName: {
    en: 'Irony',
    zh: '反讽技巧'
  },
  description: 'Use dramatic, situational, and verbal irony effectively',
  instructions: `
When writing with the IRONY skill:
- Dramatic irony: let readers know more than characters
- Situational irony: outcomes contradict expectations
- Verbal irony: characters say opposite of what they mean (sarcasm)
- Use irony to create humor, tragedy, or social commentary
- Build tension through gap between expectation and reality
- Let characters pursue goals that are actually self-defeating
- Create tragic irony where character actions bring about opposite of intended result
- Use irony to reveal character flaws and blind spots
`,
  priority: 5,
  compatibleGenres: ['satire', 'comedy', 'tragedy', 'literary', 'drama'],
  incompatibleWith: [],
  applyWhen: 'always'
};
