import type { Genre } from '../types.js';

export const postApocalyptic: Genre = {
  name: 'post-apocalyptic',
  displayName: {
    en: 'Post-Apocalyptic',
    zh: '末日废土'
  },
  description: 'Post-Apocalyptic - Survival after civilization\'s collapse',
  
  requiredPlotPoints: [
    { name: 'world-state', description: 'Establish the ruined world', required: true, typicalPosition: 10 },
    { name: 'survival-daily', description: 'Daily struggle for necessities', required: true, typicalPosition: 25 },
    { name: 'threat-emerges', description: 'New danger appears', required: true, typicalPosition: 40 },
    { name: 'community-found', description: 'Find or lose group', required: true, typicalPosition: 55 },
    { name: 'moral-test', description: 'Choice between survival and humanity', required: true, typicalPosition: 70 },
    { name: 'hope-or-despair', description: 'Find hope or accept darkness', required: true, typicalPosition: 90 }
  ],
  
  sceneTypes: [
    { name: 'scavenging', description: 'Search for supplies', purpose: 'Survival tension', typicalLength: 'medium' },
    { name: 'ruins-exploration', description: 'Explore destroyed locations', purpose: 'World building', typicalLength: 'long' },
    { name: 'threat-encounter', description: 'Face raiders or creatures', purpose: 'Action', typicalLength: 'long' },
    { name: 'campfire', description: 'Rest and reflect', purpose: 'Character bonding', typicalLength: 'short' }
  ],
  
  pacingPattern: [6, 7, 6, 8, 7, 6, 8, 7, 8, 9, 7, 8, 7, 6, 5],
  
  defaultChapterCount: 18,
  
  compatibleSkills: ['worldbuilding', 'atmosphere', 'emotional-depth', 'restraint'],
  
  defaultSkills: ['worldbuilding', 'atmosphere', 'emotional-depth'],
  
  writingGuidelines: [
    'Focus on scarcity and resource management',
    'Explore what humanity means when society collapses',
    'Create memorable ruined landscapes',
    'Moral choices have life-or-death stakes',
    'Balance hope and despair',
    'Show adaptation to new world'
  ]
};
