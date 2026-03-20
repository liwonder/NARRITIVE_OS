import type { Skill } from '../types.js';

export const themeExploration: Skill = {
  name: 'theme-exploration',
  displayName: {
    en: 'Theme Exploration',
    zh: '主题探索'
  },
  description: 'Develop central ideas through story events and character arcs',
  instructions: `
When writing with THEME-EXPLORATION skill:
- Theme emerges from story, not imposed on it
- Use character arcs to embody thematic questions
- Create situations that force characters to confront theme
- Use symbols and motifs that reinforce theme
- Let opposing characters represent different views of theme
- Avoid preaching: show complexity and nuance
- Return to theme through different angles and situations
- The ending should comment on theme through resolution
`,
  priority: 6,
  compatibleGenres: ['literary', 'drama', 'sci-fi', 'historical'],
  incompatibleWith: [],
  applyWhen: 'always'
};
