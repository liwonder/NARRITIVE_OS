import type { Genre } from '../types.js';

export const romance: Genre = {
  name: 'romance',
  displayName: {
    en: 'Romance',
    zh: '浪漫爱情'
  },
  description: 'Characters fall in love despite obstacles',
  
  requiredPlotPoints: [
    { name: 'meet', description: 'Love interests meet', required: true, typicalPosition: 10 },
    { name: 'attraction', description: 'Initial romantic interest', required: true, typicalPosition: 20 },
    { name: 'conflict', description: 'Obstacles to relationship', required: true, typicalPosition: 40 },
    { name: 'crisis', description: 'Relationship at risk', required: true, typicalPosition: 70 },
    { name: 'commitment', description: 'Choosing each other', required: true, typicalPosition: 90 },
    { name: 'happy-ending', description: 'Together despite odds', required: true, typicalPosition: 98 }
  ],
  
  sceneTypes: [
    { name: 'romantic', description: 'Intimate moments between couple', purpose: 'Build connection', typicalLength: 'medium' },
    { name: 'conflict', description: 'Arguments or misunderstandings', purpose: 'Create tension', typicalLength: 'medium' },
    { name: 'reflection', description: 'Character thinks about feelings', purpose: 'Emotional depth', typicalLength: 'short' },
    { name: 'social', description: 'Interactions with friends/family', purpose: 'External perspective', typicalLength: 'medium' }
  ],
  
  pacingPattern: [4, 5, 6, 5, 7, 6, 8, 7, 6, 8, 9, 7, 8, 9, 5],
  
  defaultChapterCount: 15,
  
  compatibleSkills: ['emotional-depth', 'dialogue-natural', 'character-development'],
  
  defaultSkills: ['dialogue-natural'],
  
  writingGuidelines: [
    'Focus on emotional journey, not just plot',
    'Build chemistry through dialogue and small gestures',
    'Obstacles should be genuine, not contrived',
    'Both characters must have agency and growth',
    'The romance arc is the main plot, not subplot',
    'Ending must be emotionally satisfying'
  ]
};
