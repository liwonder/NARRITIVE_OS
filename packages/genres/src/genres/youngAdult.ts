import type { Genre } from '../types.js';

export const youngAdult: Genre = {
  name: 'young-adult',
  displayName: {
    en: 'Young Adult',
    zh: '青春成长'
  },
  description: 'Young Adult - Coming of age stories for teens',
  
  requiredPlotPoints: [
    { name: 'ordinary-teen-life', description: 'Establish teen protagonist\'s world', required: true, typicalPosition: 10 },
    { name: 'identity-questioning', description: 'Begin questioning who they are', required: true, typicalPosition: 25 },
    { name: 'first-love', description: 'Romantic interest or friendship deepens', required: true, typicalPosition: 40 },
    { name: 'conflict-with-authority', description: 'Clash with parents or rules', required: true, typicalPosition: 55 },
    { name: 'major-failure', description: 'Mistake with real consequences', required: true, typicalPosition: 70 },
    { name: 'self-acceptance', description: 'Embrace true self', required: true, typicalPosition: 85 },
    { name: 'new-beginning', description: 'Step into adulthood', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'school-setting', description: 'Classroom or school social dynamics', purpose: 'Relatable setting', typicalLength: 'medium' },
    { name: 'friend-hangout', description: 'Bonding with peers', purpose: 'Character relationships', typicalLength: 'short' },
    { name: 'family-conflict', description: 'Tension at home', purpose: 'Growth catalyst', typicalLength: 'medium' },
    { name: 'first-experience', description: 'New milestone moment', purpose: 'Coming of age', typicalLength: 'medium' }
  ],
  
  pacingPattern: [5, 6, 6, 7, 6, 7, 8, 7, 8, 7, 6, 7, 6, 5, 4],
  
  defaultChapterCount: 22,
  
  compatibleSkills: ['emotional-depth', 'dialogue-natural', 'character-voice', 'theme-exploration'],
  
  defaultSkills: ['emotional-depth', 'dialogue-natural', 'character-voice'],
  
  writingGuidelines: [
    'Authentic teen voice - avoid talking down',
    'High emotional stakes feel life-or-death to teens',
    'Friendship is as important as romance',
    'Identity and belonging are central themes',
    'Parents can be obstacles but not villains',
    'Hopeful endings with realistic growth'
  ]
};
