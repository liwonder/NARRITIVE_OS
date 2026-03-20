import type { Skill } from '../types.js';

export const callback: Skill = {
  name: 'callback',
  displayName: {
    en: 'Callback',
    zh: '前后呼应'
  },
  description: 'Reference earlier moments for resonance and payoff',
  instructions: `
When writing with the CALLBACK skill:
- Return to earlier phrases, images, or situations
- Callbacks create satisfying circularity
- Early setup, later payoff
- Characters reference their own past words or actions
- Objects from early scenes return with new meaning
- Callbacks show character growth (same situation, different reaction)
- Use for both emotional and comedic effect
- Callbacks reward attentive readers
`,
  priority: 5,
  compatibleGenres: [], // Universal
  incompatibleWith: [],
  applyWhen: 'always'
};
