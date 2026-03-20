import type { Genre } from '../types.js';

export const urbanFantasy: Genre = {
  name: 'urban-fantasy',
  displayName: {
    en: 'Urban Fantasy',
    zh: '都市奇幻'
  },
  description: 'Urban Fantasy - Magic hidden in modern cities',
  
  requiredPlotPoints: [
    { name: 'hidden-world', description: 'Discover magic in mundane world', required: true, typicalPosition: 15 },
    { name: 'supernatural-conflict', description: 'Magical threat emerges', required: true, typicalPosition: 30 },
    { name: 'double-life', description: 'Balance normal and magical lives', required: true, typicalPosition: 45 },
    { name: 'supernatural-allies', description: 'Meet magical companions', required: true, typicalPosition: 55 },
    { name: 'power-discovery', description: 'Unlock hidden abilities', required: true, typicalPosition: 70 },
    { name: 'sacrifice', description: 'Must give up something important', required: true, typicalPosition: 85 },
    { name: 'integration', description: 'Merge both worlds or choose', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'city-magic', description: 'Magic in urban settings', purpose: 'Wonder in mundanity', typicalLength: 'medium' },
    { name: 'hidden-sanctuary', description: 'Safe magical spaces', purpose: 'World building', typicalLength: 'short' },
    { name: 'supernatural-battle', description: 'Fight magical threats', purpose: 'Action', typicalLength: 'long' },
    { name: 'normal-life', description: 'Maintain mundane facade', purpose: 'Tension', typicalLength: 'short' }
  ],
  
  pacingPattern: [6, 7, 6, 8, 7, 8, 7, 9, 8, 7, 8, 9, 7, 6, 5],
  
  defaultChapterCount: 20,
  
  compatibleSkills: ['worldbuilding', 'atmosphere', 'foreshadowing', 'dialogue-natural'],
  
  defaultSkills: ['worldbuilding', 'atmosphere', 'foreshadowing'],
  
  writingGuidelines: [
    'Magic should feel organic to city setting',
    'Balance supernatural and normal life',
    'Hidden magical societies with rules',
    'Urban locations reimagined with magic',
    'Characters grounded despite fantastical elements',
    'Mystery of hidden world drives plot'
  ]
};
