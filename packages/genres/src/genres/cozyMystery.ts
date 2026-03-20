import type { Genre } from '../types.js';

export const cozyMystery: Genre = {
  name: 'cozy-mystery',
  displayName: {
    en: 'Cozy Mystery',
    zh: '温馨推理'
  },
  description: 'Cozy Mystery - Gentle puzzles in charming settings',
  
  requiredPlotPoints: [
    { name: 'idyllic-setting', description: 'Establish charming location', required: true, typicalPosition: 10 },
    { name: 'crime-discovered', description: 'Murder without graphic violence', required: true, typicalPosition: 25 },
    { name: 'amateur-sleuth', description: 'Ordinary person investigates', required: true, typicalPosition: 35 },
    { name: 'community-suspects', description: 'Interview quirky locals', required: true, typicalPosition: 50 },
    { name: 'red-herrings', description: 'False leads and misdirection', required: true, typicalPosition: 65 },
    { name: 'reveal-gathering', description: 'Confront suspects together', required: true, typicalPosition: 85 },
    { name: 'justice-served', description: 'Killer exposed, order restored', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'village-life', description: 'Daily activities in charming setting', purpose: 'Atmosphere', typicalLength: 'short' },
    { name: 'tea-interrogation', description: 'Polite questioning over refreshments', purpose: 'Information gathering', typicalLength: 'medium' },
    { name: 'clue-discovery', description: 'Find important evidence', purpose: 'Plot advancement', typicalLength: 'short' },
    { name: 'reveal-scene', description: 'Explain the solution', purpose: 'Satisfaction', typicalLength: 'medium' }
  ],
  
  pacingPattern: [4, 5, 5, 6, 5, 6, 5, 7, 6, 5, 6, 5, 4, 3, 2],
  
  defaultChapterCount: 12,
  
  compatibleSkills: ['dialogue-natural', 'foreshadowing', 'red-herring', 'character-voice'],
  
  defaultSkills: ['dialogue-natural', 'foreshadowing', 'red-herring'],
  
  writingGuidelines: [
    'No graphic violence or gore',
    'Charming, quirky community setting',
    'Amateur detective uses wit and observation',
    'Puzzles are fair - clues available to reader',
    'Justice prevails, order restored',
    'Comforting, escapist tone'
  ]
};
