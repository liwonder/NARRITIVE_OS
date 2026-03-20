import type { Genre } from '../types.js';

export const historical: Genre = {
  name: 'historical',
  displayName: {
    en: 'Historical Fiction',
    zh: '历史小说'
  },
  description: 'Historical Fiction - Past eras with authentic detail',
  
  requiredPlotPoints: [
    { name: 'era-establishment', description: 'Establish time period and setting', required: true, typicalPosition: 10 },
    { name: 'historical-context', description: 'Introduce real historical events', required: true, typicalPosition: 20 },
    { name: 'personal-conflict', description: 'Character goals clash with history', required: true, typicalPosition: 35 },
    { name: 'historical-event', description: 'Major historical moment impacts story', required: true, typicalPosition: 55 },
    { name: 'moral-choice', description: 'Character chooses between personal and historical duty', required: true, typicalPosition: 70 },
    { name: 'resolution', description: 'Personal arc resolves within historical context', required: true, typicalPosition: 90 }
  ],
  
  sceneTypes: [
    { name: 'period-detail', description: 'Showcase historical setting', purpose: 'Authenticity', typicalLength: 'medium' },
    { name: 'historical-event', description: 'Witness or participate in history', purpose: 'Ground in reality', typicalLength: 'long' },
    { name: 'social-gathering', description: 'Period-appropriate social scenes', purpose: 'Character relationships', typicalLength: 'medium' },
    { name: 'conflict', description: 'Personal or political conflict', purpose: 'Drama', typicalLength: 'medium' }
  ],
  
  pacingPattern: [4, 5, 5, 6, 6, 7, 6, 7, 8, 7, 6, 7, 6, 5, 4],
  
  defaultChapterCount: 30,
  
  compatibleSkills: ['worldbuilding', 'dialogue-natural', 'emotional-depth', 'theme-exploration'],
  
  defaultSkills: ['worldbuilding', 'dialogue-natural', 'emotional-depth'],
  
  writingGuidelines: [
    'Research thoroughly - accuracy matters',
    'Avoid anachronisms in language and technology',
    'Balance historical facts with compelling fiction',
    'Show social norms and constraints of the era',
    'Use real historical figures sparingly and respectfully',
    'Let characters have modern emotions in historical contexts'
  ]
};
