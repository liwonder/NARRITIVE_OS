import type { Genre } from '../types.js';

export const steampunk: Genre = {
  name: 'steampunk',
  displayName: {
    en: 'Steampunk',
    zh: '蒸汽朋克'
  },
  description: 'Steampunk - Victorian aesthetics with steam-powered technology',
  
  requiredPlotPoints: [
    { name: 'alternate-history', description: 'Establish Victorian-inspired world', required: true, typicalPosition: 10 },
    { name: 'invention', description: 'Key steam technology introduced', required: true, typicalPosition: 25 },
    { name: 'social-tension', description: 'Class conflict or industrial strife', required: true, typicalPosition: 40 },
    { name: 'adventure-begins', description: 'Journey or mission starts', required: true, typicalPosition: 55 },
    { name: 'sabotage', description: 'Technology or plans threatened', required: true, typicalPosition: 70 },
    { name: 'brilliant-solution', description: 'Ingenious mechanical fix', required: true, typicalPosition: 85 },
    { name: 'new-era', description: 'World changed by invention', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'workshop', description: 'Inventor\'s laboratory', purpose: 'Character depth', typicalLength: 'medium' },
    { name: 'airship', description: 'Travel by steam-powered flight', purpose: 'Adventure', typicalLength: 'long' },
    { name: 'society-ball', description: 'Victorian social events', purpose: 'Intrigue', typicalLength: 'medium' },
    { name: 'mecha-battle', description: 'Steam-powered combat', purpose: 'Action', typicalLength: 'long' }
  ],
  
  pacingPattern: [5, 6, 6, 7, 6, 8, 7, 8, 7, 8, 7, 8, 7, 6, 5],
  
  defaultChapterCount: 18,
  
  compatibleSkills: ['worldbuilding', 'atmosphere', 'dialogue-natural', 'theme-exploration'],
  
  defaultSkills: ['worldbuilding', 'atmosphere', 'dialogue-natural'],
  
  writingGuidelines: [
    'Brass, steam, gears, and clockwork aesthetics',
    'Victorian social structures and manners',
    'Adventure and exploration spirit',
    'Technology that looks beautiful and functional',
    'Class struggle and industrial themes',
    'Optimistic about human ingenuity'
  ]
};
