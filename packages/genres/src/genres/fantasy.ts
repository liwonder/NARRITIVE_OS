import type { Genre } from '../types.js';

export const fantasy: Genre = {
  name: 'fantasy',
  displayName: {
    en: 'Fantasy',
    zh: '奇幻魔法'
  },
  description: 'Fantasy - Magic, mythical creatures, and epic quests',
  
  requiredPlotPoints: [
    { name: 'ordinary-world', description: 'Hero in normal life before adventure', required: true, typicalPosition: 5 },
    { name: 'call-to-adventure', description: 'Discover magic or receive quest', required: true, typicalPosition: 15 },
    { name: 'mentor-meeting', description: 'Meet wise guide or magical helper', required: true, typicalPosition: 25 },
    { name: 'first-magic', description: 'First use or encounter with magic', required: true, typicalPosition: 35 },
    { name: 'dark-forces', description: 'Encounter antagonist or evil force', required: true, typicalPosition: 50 },
    { name: 'all-is-lost', description: 'Lowest point, magic fails or ally falls', required: true, typicalPosition: 70 },
    { name: 'transformation', description: 'Hero discovers true power', required: true, typicalPosition: 80 },
    { name: 'final-battle', description: 'Defeat dark forces', required: true, typicalPosition: 92 }
  ],
  
  sceneTypes: [
    { name: 'magical-discovery', description: 'Find or learn magic', purpose: 'Wonder and excitement', typicalLength: 'medium' },
    { name: 'creature-encounter', description: 'Meet mythical beings', purpose: 'World depth', typicalLength: 'medium' },
    { name: 'quest-travel', description: 'Journey through fantastical lands', purpose: 'Adventure', typicalLength: 'long' },
    { name: 'magical-duel', description: 'Battle using magic', purpose: 'Conflict', typicalLength: 'long' }
  ],
  
  pacingPattern: [4, 5, 6, 5, 7, 6, 8, 7, 8, 9, 8, 9, 10, 8, 6],
  
  defaultChapterCount: 25,
  
  compatibleSkills: ['worldbuilding', 'foreshadowing', 'atmosphere', 'dialogue-natural'],
  
  defaultSkills: ['worldbuilding', 'foreshadowing', 'atmosphere'],
  
  writingGuidelines: [
    'Establish magic system rules early and follow them',
    'Balance wonder with grounded character emotions',
    'Create distinct magical cultures and societies',
    'Use mythical creatures meaningfully, not just decoration',
    'Make the quest personal, not just epic',
    'Show cost and consequence of using magic'
  ]
};
