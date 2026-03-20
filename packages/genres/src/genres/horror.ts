import type { Genre } from '../types.js';

export const horror: Genre = {
  name: 'horror',
  displayName: {
    en: 'Horror',
    zh: '恐怖惊悚'
  },
  description: 'Horror - Fear, dread, and the unknown',
  
  requiredPlotPoints: [
    { name: 'unsettling-beginning', description: 'Subtle hints something is wrong', required: true, typicalPosition: 10 },
    { name: 'first-encounter', description: 'Initial contact with threat', required: true, typicalPosition: 25 },
    { name: 'disbelief', description: 'Characters doubt or rationalize', required: true, typicalPosition: 35 },
    { name: 'escalation', description: 'Threat becomes undeniable', required: true, typicalPosition: 50 },
    { name: 'isolation', description: 'Characters cut off from safety', required: true, typicalPosition: 65 },
    { name: 'revelation', description: 'True nature of horror revealed', required: true, typicalPosition: 78 },
    { name: 'survival', description: 'Final confrontation or escape', required: true, typicalPosition: 90 }
  ],
  
  sceneTypes: [
    { name: 'atmosphere-building', description: 'Create dread through setting', purpose: 'Establish mood', typicalLength: 'short' },
    { name: 'jump-scare', description: 'Sudden frightening moment', purpose: 'Startle reader', typicalLength: 'short' },
    { name: 'psychological-dread', description: 'Mental and emotional terror', purpose: 'Deep fear', typicalLength: 'medium' },
    { name: 'chase-escape', description: 'Fleeing from threat', purpose: 'Adrenaline', typicalLength: 'long' }
  ],
  
  pacingPattern: [4, 5, 6, 7, 6, 8, 7, 9, 8, 9, 10, 9, 8, 7, 5],
  
  defaultChapterCount: 15,
  
  compatibleSkills: ['suspense', 'atmosphere', 'restraint', 'foreshadowing'],
  
  defaultSkills: ['suspense', 'atmosphere', 'restraint'],
  
  writingGuidelines: [
    'Less is more - imply horror rather than show everything',
    'Build dread gradually before revealing the threat',
    'Use isolation to heighten vulnerability',
    'Make the horror reflect human fears and anxieties',
    'Avoid clichés and predictable scares',
    'Endings can be ambiguous - not all evil is defeated'
  ]
};
