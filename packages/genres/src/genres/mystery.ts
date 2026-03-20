import type { Genre } from '../types.js';

export const mystery: Genre = {
  name: 'mystery',
  displayName: {
    en: 'Mystery',
    zh: '悬疑推理'
  },
  description: 'Detective solves crimes through clues and deduction',
  
  requiredPlotPoints: [
    { name: 'crime', description: 'A crime is committed', required: true, typicalPosition: 5 },
    { name: 'discovery', description: 'The crime is discovered', required: true, typicalPosition: 10 },
    { name: 'investigation', description: 'Detective begins investigation', required: true, typicalPosition: 15 },
    { name: 'false-lead', description: 'Wrong suspect or theory', required: false, typicalPosition: 40 },
    { name: 'breakthrough', description: 'Key clue discovered', required: true, typicalPosition: 70 },
    { name: 'revelation', description: 'Truth is revealed', required: true, typicalPosition: 85 },
    { name: 'resolution', description: 'Justice is served', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'investigation', description: 'Examining crime scene or evidence', purpose: 'Discover clues', typicalLength: 'medium' },
    { name: 'interrogation', description: 'Questioning suspects or witnesses', purpose: 'Gather information', typicalLength: 'medium' },
    { name: 'discovery', description: 'Finding new evidence', purpose: 'Advance plot', typicalLength: 'short' },
    { name: 'deduction', description: 'Detective analyzes clues', purpose: 'Reveal reasoning', typicalLength: 'short' }
  ],
  
  pacingPattern: [3, 4, 5, 6, 5, 7, 6, 8, 9, 7, 8, 9, 10, 8, 6],
  
  defaultChapterCount: 15,
  
  compatibleSkills: ['suspense', 'clue-planting', 'foreshadowing', 'dialogue-natural'],
  
  defaultSkills: ['suspense', 'dialogue-natural'],
  
  writingGuidelines: [
    'Plant clues early that seem insignificant but become important',
    'Introduce multiple suspects with motives and opportunities',
    'Balance investigation scenes with character moments',
    'Reveal information gradually - not all at once',
    'The solution should be surprising but fair (clues were there)'
  ]
};
