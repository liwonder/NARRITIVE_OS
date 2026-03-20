import type { Genre } from '../types.js';

export const cyberpunk: Genre = {
  name: 'cyberpunk',
  displayName: {
    en: 'Cyberpunk',
    zh: '赛博朋克'
  },
  description: 'Cyberpunk - High tech, low life, corporate dystopia',
  
  requiredPlotPoints: [
    { name: 'neon-world', description: 'Establish corporate-controlled dystopia', required: true, typicalPosition: 10 },
    { name: 'street-level', description: 'Life in the underbelly', required: true, typicalPosition: 20 },
    { name: 'job-offer', description: 'Illegal opportunity arises', required: true, typicalPosition: 35 },
    { name: 'corporate-intrigue', description: 'Discover corporate conspiracy', required: true, typicalPosition: 50 },
    { name: 'system-fight', description: 'Take on the corporations', required: true, typicalPosition: 70 },
    { name: 'price-paid', description: 'Victory has costs', required: true, typicalPosition: 90 }
  ],
  
  sceneTypes: [
    { name: 'net-run', description: 'Hacking and digital infiltration', purpose: 'Tech showcase', typicalLength: 'medium' },
    { name: 'street-deal', description: 'Underground transactions', purpose: 'Atmosphere', typicalLength: 'short' },
    { name: 'corporate-tower', description: 'Infiltrate high-tech facilities', purpose: 'Contrast', typicalLength: 'long' },
    { name: 'augmentation', description: 'Body modification scenes', purpose: 'Character depth', typicalLength: 'short' }
  ],
  
  pacingPattern: [6, 7, 7, 8, 7, 8, 9, 8, 9, 10, 8, 9, 8, 7, 6],
  
  defaultChapterCount: 16,
  
  compatibleSkills: ['worldbuilding', 'atmosphere', 'theme-exploration', 'pacing-fast'],
  
  defaultSkills: ['worldbuilding', 'atmosphere', 'theme-exploration'],
  
  writingGuidelines: [
    'High technology contrasted with social decay',
    'Corporations control everything',
    'Body modification and transhumanism themes',
    'Neon, rain, and urban density as visuals',
    'Punk attitude - rebellion against the system',
    'Identity and humanity questions'
  ]
};
