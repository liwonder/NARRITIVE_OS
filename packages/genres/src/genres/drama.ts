import type { Genre } from '../types.js';

export const drama: Genre = {
  name: 'drama',
  displayName: {
    en: 'Drama',
    zh: '情感剧情'
  },
  description: 'Drama - Character-driven emotional stories',
  
  requiredPlotPoints: [
    { name: 'ordinary-life', description: 'Character in their normal world', required: true, typicalPosition: 10 },
    { name: 'inciting-incident', description: 'Event disrupts stability', required: true, typicalPosition: 20 },
    { name: 'rising-conflict', description: 'Relationships become strained', required: true, typicalPosition: 40 },
    { name: 'crisis', description: 'Emotional breaking point', required: true, typicalPosition: 60 },
    { name: 'confrontation', description: 'Characters face the truth', required: true, typicalPosition: 75 },
    { name: 'change', description: 'Characters transform or relationships end', required: true, typicalPosition: 90 }
  ],
  
  sceneTypes: [
    { name: 'intimate-conversation', description: 'Deep emotional dialogue', purpose: 'Character depth', typicalLength: 'medium' },
    { name: 'family-gathering', description: 'Complex family dynamics', purpose: 'Relationship tension', typicalLength: 'medium' },
    { name: 'confrontation', description: 'Direct emotional conflict', purpose: 'Drama peak', typicalLength: 'medium' },
    { name: 'reflection', description: 'Character processes emotions', purpose: 'Internal growth', typicalLength: 'short' }
  ],
  
  pacingPattern: [4, 5, 6, 6, 7, 6, 7, 8, 7, 6, 7, 6, 5, 4, 3],
  
  defaultChapterCount: 20,
  
  compatibleSkills: ['emotional-depth', 'dialogue-natural', 'subtext', 'character-voice'],
  
  defaultSkills: ['emotional-depth', 'dialogue-natural', 'subtext'],
  
  writingGuidelines: [
    'Focus on character relationships and emotional truth',
    'Dialogue should reveal subtext and hidden feelings',
    'Small moments carry large emotional weight',
    'Avoid melodrama - keep emotions grounded',
    'Show character growth through changed behavior',
    'Ending can be bittersweet or ambiguous'
  ]
};
