import type { Genre } from '../types.js';

export const literary: Genre = {
  name: 'literary',
  displayName: {
    en: 'Literary Fiction',
    zh: '文学小说'
  },
  description: 'Literary Fiction - Character-focused, experimental, and thematic',
  
  requiredPlotPoints: [
    { name: 'character-introduction', description: 'Deep dive into protagonist\'s inner life', required: true, typicalPosition: 10 },
    { name: 'subtle-shift', description: 'Small event triggers reflection', required: true, typicalPosition: 25 },
    { name: 'relationship-complexity', description: 'Interpersonal dynamics explored', required: true, typicalPosition: 40 },
    { name: 'internal-crisis', description: 'Character questions beliefs or identity', required: true, typicalPosition: 60 },
    { name: 'epiphany', description: 'Moment of realization or understanding', required: true, typicalPosition: 80 },
    { name: 'ambiguous-resolution', description: 'Open-ended conclusion', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'introspection', description: 'Deep internal reflection', purpose: 'Character depth', typicalLength: 'medium' },
    { name: 'quiet-moment', description: 'Everyday scenes with meaning', purpose: 'Theme development', typicalLength: 'short' },
    { name: 'symbolic-event', description: 'Actions with deeper meaning', purpose: 'Literary resonance', typicalLength: 'medium' },
    { name: 'conversation', description: 'Dialogue heavy with subtext', purpose: 'Relationship exploration', typicalLength: 'medium' }
  ],
  
  pacingPattern: [3, 4, 5, 4, 6, 5, 6, 5, 6, 5, 4, 5, 4, 3, 2],
  
  defaultChapterCount: 12,
  
  compatibleSkills: ['show-dont-tell', 'theme-exploration', 'emotional-depth', 'symbolism', 'subtext'],
  
  defaultSkills: ['show-dont-tell', 'theme-exploration', 'emotional-depth'],
  
  writingGuidelines: [
    'Focus on internal character journey over external plot',
    'Every sentence should serve multiple purposes',
    'Use symbolism and metaphor liberally',
    'Explore complex themes through character experience',
    'Embrace ambiguity and nuance',
    'Language itself is a character - craft carefully'
  ]
};
