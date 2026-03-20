import type { Genre } from '../types.js';

export const gothic: Genre = {
  name: 'gothic',
  displayName: {
    en: 'Gothic',
    zh: '哥特黑暗'
  },
  description: 'Gothic - Dark romance, haunted settings, and psychological terror',
  
  requiredPlotPoints: [
    { name: 'isolated-setting', description: 'Arrive at remote, atmospheric location', required: true, typicalPosition: 10 },
    { name: 'family-secrets', description: 'Discover dark ancestral history', required: true, typicalPosition: 25 },
    { name: 'supernatural-hints', description: 'Uncanny events suggest haunting', required: true, typicalPosition: 40 },
    { name: 'forbidden-attraction', description: 'Dangerous romantic interest', required: true, typicalPosition: 55 },
    { name: 'madness-or-ghosts', description: 'Question reality', required: true, typicalPosition: 70 },
    { name: 'confrontation', description: 'Face the truth, escape or succumb', required: true, typicalPosition: 88 }
  ],
  
  sceneTypes: [
    { name: 'exploration', description: 'Discover hidden passages or rooms', purpose: 'Atmosphere', typicalLength: 'medium' },
    { name: 'stormy-night', description: 'Weather heightens tension', purpose: 'Mood', typicalLength: 'short' },
    { name: 'intense-dialogue', description: 'Passionate or threatening exchanges', purpose: 'Character dynamics', typicalLength: 'medium' },
    { name: 'supernatural-event', description: 'Ghostly or uncanny occurrence', purpose: 'Horror', typicalLength: 'short' }
  ],
  
  pacingPattern: [4, 5, 6, 5, 7, 6, 7, 8, 7, 6, 7, 6, 5, 4, 3],
  
  defaultChapterCount: 14,
  
  compatibleSkills: ['atmosphere', 'foreshadowing', 'emotional-depth', 'restraint'],
  
  defaultSkills: ['atmosphere', 'foreshadowing', 'emotional-depth'],
  
  writingGuidelines: [
    'Atmosphere is paramount - weather, architecture, decay',
    'Romance intertwined with danger',
    'Isolated, crumbling settings',
    'Family curses and ancestral sins',
    'Ambiguity between supernatural and psychological',
    'Heightened, passionate emotions'
  ]
};
