import type { Genre } from '../types.js';

export const spaceOpera: Genre = {
  name: 'space-opera',
  displayName: {
    en: 'Space Opera',
    zh: '太空歌剧'
  },
  description: 'Space Opera - Epic galaxy-spanning adventures',
  
  requiredPlotPoints: [
    { name: 'galaxy-introduction', description: 'Establish vast space setting', required: true, typicalPosition: 10 },
    { name: 'galactic-threat', description: 'Empire or danger emerges', required: true, typicalPosition: 25 },
    { name: 'unlikely-hero', description: 'Ordinary person in extraordinary situation', required: true, typicalPosition: 35 },
    { name: 'crew-assembly', description: 'Gather diverse allies', required: true, typicalPosition: 50 },
    { name: 'ancient-mystery', description: 'Discover lost technology or secret', required: true, typicalPosition: 65 },
    { name: 'betrayal', description: 'Ally turns or is revealed', required: true, typicalPosition: 78 },
    { name: 'final-stand', description: 'Battle for galaxy\'s fate', required: true, typicalPosition: 92 }
  ],
  
  sceneTypes: [
    { name: 'space-travel', description: 'Journey between worlds', purpose: 'Scale and wonder', typicalLength: 'medium' },
    { name: 'alien-encounter', description: 'Meet diverse species', purpose: 'World building', typicalLength: 'medium' },
    { name: 'space-battle', description: 'Epic fleet combat', purpose: 'Action', typicalLength: 'long' },
    { name: 'diplomacy', description: 'Political negotiations', purpose: 'Plot advancement', typicalLength: 'medium' }
  ],
  
  pacingPattern: [6, 7, 7, 8, 7, 9, 8, 9, 10, 9, 8, 9, 10, 8, 6],
  
  defaultChapterCount: 25,
  
  compatibleSkills: ['worldbuilding', 'pacing-fast', 'theme-exploration', 'dialogue-natural'],
  
  defaultSkills: ['worldbuilding', 'pacing-fast', 'theme-exploration'],
  
  writingGuidelines: [
    'Think big - planets, empires, ancient civilizations',
    'Diverse alien cultures with depth',
    'Mix of high-tech and personal stakes',
    'Found family among crew members',
    'Epic scope but relatable characters',
    'Adventure and wonder over hard science'
  ]
};
