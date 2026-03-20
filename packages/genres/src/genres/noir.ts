import type { Genre } from '../types.js';

export const noir: Genre = {
  name: 'noir',
  displayName: {
    en: 'Noir',
    zh: '黑色电影'
  },
  description: 'Noir - Dark, cynical crime stories with moral ambiguity',
  
  requiredPlotPoints: [
    { name: 'client-arrives', description: 'Detective meets client with problem', required: true, typicalPosition: 10 },
    { name: 'investigation-begins', description: 'Start digging into mystery', required: true, typicalPosition: 25 },
    { name: 'corruption-revealed', description: 'Discover systemic corruption', required: true, typicalPosition: 45 },
    { name: 'betrayal', description: 'Someone trusted is involved', required: true, typicalPosition: 60 },
    { name: 'moral-compromise', description: 'Detective must cross lines', required: true, typicalPosition: 75 },
    { name: 'bitter-resolution', description: 'Case solved but at cost', required: true, typicalPosition: 92 }
  ],
  
  sceneTypes: [
    { name: 'rainy-streets', description: 'Atmospheric urban exploration', purpose: 'Mood setting', typicalLength: 'short' },
    { name: 'interrogation', description: 'Questioning suspects', purpose: 'Information gathering', typicalLength: 'medium' },
    { name: 'nightclub', description: 'Seedy underworld locations', purpose: 'Atmosphere', typicalLength: 'medium' },
    { name: 'confrontation', description: 'Violent or tense showdown', purpose: 'Conflict', typicalLength: 'long' }
  ],
  
  pacingPattern: [5, 6, 7, 6, 7, 8, 7, 8, 7, 6, 7, 6, 5, 4, 3],
  
  defaultChapterCount: 15,
  
  compatibleSkills: ['atmosphere', 'dialogue-natural', 'subtext', 'irony', 'restraint'],
  
  defaultSkills: ['atmosphere', 'dialogue-natural', 'subtext'],
  
  writingGuidelines: [
    'Moral ambiguity - no clear heroes or villains',
    'Cynical, world-weary protagonist voice',
    'Rain, shadows, and urban decay as motifs',
    'Femme fatale or morally complex women',
    'Everyone has secrets and hidden agendas',
    'Justice is imperfect or unattainable'
  ]
};
