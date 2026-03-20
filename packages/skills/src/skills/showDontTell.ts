import type { Skill } from '../types.js';

export const showDontTell: Skill = {
  name: 'show-dont-tell',
  displayName: {
    en: 'Show, Don\'t Tell',
    zh: '展示而非叙述'
  },
  description: 'Reveal through action and sensory detail, not exposition',
  instructions: `
When writing with the SHOW-DONT-TELL skill:
- Instead of "He was angry," show clenched fists, raised voice, narrowed eyes
- Reveal character through actions, choices, and habits
- Use sensory details: what can be seen, heard, smelled, touched, tasted
- Let readers draw their own conclusions about character emotions
- Demonstrate relationships through interaction, not description
- Show backstory through present-moment triggers (flashbacks, objects, conversations)
- Use body language and micro-expressions to convey subtext
- Trust readers to understand without explicit explanation
`,
  priority: 8,
  compatibleGenres: [], // Universal skill
  incompatibleWith: [],
  applyWhen: 'always'
};
