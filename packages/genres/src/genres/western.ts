import type { Genre } from '../types.js';

export const western: Genre = {
  name: 'western',
  displayName: {
    en: 'Western',
    zh: '西部牛仔'
  },
  description: 'Western - Frontier justice, outlaws, and the untamed wilderness',
  
  requiredPlotPoints: [
    { name: 'frontier-arrival', description: 'Enter the wild territory', required: true, typicalPosition: 10 },
    { name: 'lawlessness', description: 'Experience lack of civilization', required: true, typicalPosition: 25 },
    { name: 'conflict-town', description: 'Town or settlement in trouble', required: true, typicalPosition: 40 },
    { name: 'outlaw-threat', description: 'Bandits or antagonists appear', required: true, typicalPosition: 55 },
    { name: 'stand-ground', description: 'Must fight for what\'s right', required: true, typicalPosition: 75 },
    { name: 'showdown', description: 'Final confrontation at high noon', required: true, typicalPosition: 90 }
  ],
  
  sceneTypes: [
    { name: 'trail-ride', description: 'Journey through wilderness', purpose: 'Atmosphere', typicalLength: 'medium' },
    { name: 'saloon', description: 'Tension in frontier bar', purpose: 'Character introduction', typicalLength: 'medium' },
    { name: 'campfire', description: 'Night stories and bonding', purpose: 'Character depth', typicalLength: 'short' },
    { name: 'gunfight', description: 'Shootout or chase', purpose: 'Action', typicalLength: 'long' }
  ],
  
  pacingPattern: [5, 6, 5, 7, 6, 7, 6, 8, 7, 6, 7, 8, 6, 5, 4],
  
  defaultChapterCount: 14,
  
  compatibleSkills: ['atmosphere', 'dialogue-natural', 'restraint', 'theme-exploration'],
  
  defaultSkills: ['atmosphere', 'dialogue-natural', 'restraint'],
  
  writingGuidelines: [
    'Wide open spaces and harsh landscapes',
    'Code of honor vs. lawlessness tension',
    'Spare, direct dialogue',
    'Man vs. nature and man vs. man themes',
    'Moral clarity in ambiguous situations',
    'End of frontier, changing world nostalgia'
  ]
};
