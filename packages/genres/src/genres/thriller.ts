import type { Genre } from '../types.js';

export const thriller: Genre = {
  name: 'thriller',
  displayName: {
    en: 'Thriller',
    zh: '惊悚紧张'
  },
  description: 'High stakes, fast pace, constant tension',
  
  requiredPlotPoints: [
    { name: 'hook', description: 'Immediate danger or stakes', required: true, typicalPosition: 5 },
    { name: 'escalation', description: 'Threat increases', required: true, typicalPosition: 25 },
    { name: 'twist', description: 'Unexpected complication', required: false, typicalPosition: 50 },
    { name: 'all-is-lost', description: 'Lowest point for protagonist', required: true, typicalPosition: 75 },
    { name: 'climax', description: 'Final confrontation', required: true, typicalPosition: 90 },
    { name: 'aftermath', description: 'Resolution and recovery', required: true, typicalPosition: 98 }
  ],
  
  sceneTypes: [
    { name: 'action', description: 'Physical conflict or chase', purpose: 'Raise adrenaline', typicalLength: 'short' },
    { name: 'tension', description: 'Building suspense without action', purpose: 'Create anxiety', typicalLength: 'medium' },
    { name: 'escape', description: 'Fleeing from danger', purpose: 'Show stakes', typicalLength: 'short' },
    { name: 'planning', description: 'Preparing for confrontation', purpose: 'Character agency', typicalLength: 'medium' }
  ],
  
  pacingPattern: [7, 8, 7, 9, 8, 9, 10, 9, 10, 8, 9, 10, 9, 8, 6],
  
  defaultChapterCount: 12,
  
  compatibleSkills: ['suspense', 'cliffhanger', 'pacing-fast', 'tension-building'],
  
  defaultSkills: ['suspense', 'cliffhanger'],
  
  writingGuidelines: [
    'Start with action or immediate threat',
    'Keep chapters short and punchy',
    'End chapters with cliffhangers',
    'Maintain high stakes throughout',
    'Time pressure is essential (countdowns, deadlines)',
    'Protagonist must be active, not reactive'
  ]
};
