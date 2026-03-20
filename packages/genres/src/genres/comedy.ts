import type { Genre } from '../types.js';

export const comedy: Genre = {
  name: 'comedy',
  displayName: {
    en: 'Comedy',
    zh: '喜剧幽默'
  },
  description: 'Comedy - Humor, wit, and lighthearted entertainment',
  
  requiredPlotPoints: [
    { name: 'comic-setup', description: 'Establish comedic premise and characters', required: true, typicalPosition: 10 },
    { name: 'escalating-situations', description: 'Problems get funnier and more complicated', required: true, typicalPosition: 30 },
    { name: 'misunderstanding', description: 'Classic comedic confusion', required: true, typicalPosition: 45 },
    { name: 'crisis-point', description: 'Everything goes wrong at once', required: true, typicalPosition: 65 },
    { name: 'climax-chaos', description: 'Peak absurdity and confusion', required: true, typicalPosition: 80 },
    { name: 'resolution', description: 'Happy ending with lessons learned', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'banter', description: 'Witty dialogue and wordplay', purpose: 'Entertainment', typicalLength: 'short' },
    { name: 'physical-comedy', description: 'Slapstick or situational humor', purpose: 'Visual laughs', typicalLength: 'short' },
    { name: 'awkward-situation', description: 'Cringe-worthy social moments', purpose: 'Relatable humor', typicalLength: 'medium' },
    { name: 'ensemble-scene', description: 'Group interactions and misunderstandings', purpose: 'Character dynamics', typicalLength: 'medium' }
  ],
  
  pacingPattern: [5, 6, 7, 6, 8, 7, 8, 7, 6, 7, 8, 6, 5, 4, 3],
  
  defaultChapterCount: 15,
  
  compatibleSkills: ['comic-timing', 'irony', 'dialogue-natural', 'character-voice'],
  
  defaultSkills: ['comic-timing', 'irony', 'dialogue-natural'],
  
  writingGuidelines: [
    'Timing is everything - pace jokes carefully',
    'Characters should have distinct comedic voices',
    'Escalate absurdity gradually',
    'Use irony and subverted expectations',
    'Balance humor with genuine character moments',
    'End on a high note with emotional payoff'
  ]
};
