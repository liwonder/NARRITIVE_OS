import type { Genre } from '../types.js';

export const adventure: Genre = {
  name: 'adventure',
  displayName: {
    en: 'Adventure',
    zh: '冒险探险'
  },
  description: 'Adventure - Exciting journeys and daring exploits',
  
  requiredPlotPoints: [
    { name: 'quest-begins', description: 'Hero accepts mission or is thrust into adventure', required: true, typicalPosition: 10 },
    { name: 'first-challenge', description: 'Initial obstacle or danger', required: true, typicalPosition: 25 },
    { name: 'exotic-location', description: 'Arrive at fascinating new place', required: true, typicalPosition: 40 },
    { name: 'setback', description: 'Plan fails, must adapt', required: true, typicalPosition: 55 },
    { name: 'discovery', description: 'Find key object or information', required: true, typicalPosition: 70 },
    { name: 'final-obstacle', description: 'Last major challenge before goal', required: true, typicalPosition: 85 },
    { name: 'return', description: 'Return home transformed', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'travel', description: 'Journey through interesting landscapes', purpose: 'Wonder and excitement', typicalLength: 'medium' },
    { name: 'action', description: 'Physical challenges and dangers', purpose: 'Adrenaline', typicalLength: 'long' },
    { name: 'puzzle', description: 'Solve problems or mysteries', purpose: 'Engagement', typicalLength: 'medium' },
    { name: 'discovery', description: 'Find something amazing', purpose: 'Reward', typicalLength: 'short' }
  ],
  
  pacingPattern: [6, 7, 6, 8, 7, 8, 7, 9, 8, 7, 8, 9, 8, 6, 5],
  
  defaultChapterCount: 18,
  
  compatibleSkills: ['pacing-fast', 'worldbuilding', 'suspense', 'dialogue-natural'],
  
  defaultSkills: ['pacing-fast', 'worldbuilding', 'suspense'],
  
  writingGuidelines: [
    'Keep the pace moving - constant forward momentum',
    'Create vivid, memorable locations',
    'Balance action with character moments',
    'Make obstacles creative and varied',
    'Hero should be proactive, not just reactive',
    'End chapters with hooks that drive to next adventure'
  ]
};
