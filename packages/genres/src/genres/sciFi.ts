import type { Genre } from '../types.js';

export const sciFi: Genre = {
  name: 'sci-fi',
  displayName: {
    en: 'Science Fiction',
    zh: '科幻未来'
  },
  description: 'Science Fiction - Exploring future technology and its impact on humanity',
  
  requiredPlotPoints: [
    { name: 'world-introduction', description: 'Introduce the sci-fi world and its rules', required: true, typicalPosition: 10 },
    { name: 'tech-discovery', description: 'Discover or encounter key technology', required: true, typicalPosition: 25 },
    { name: 'conflict-emerges', description: 'Technology creates or reveals conflict', required: true, typicalPosition: 40 },
    { name: 'moral-dilemma', description: 'Character faces ethical choice about technology', required: true, typicalPosition: 60 },
    { name: 'escalation', description: 'Stakes increase, technology threatens', required: true, typicalPosition: 75 },
    { name: 'resolution', description: 'Resolve through understanding or mastery of tech', required: true, typicalPosition: 90 }
  ],
  
  sceneTypes: [
    { name: 'world-building', description: 'Establish sci-fi setting and technology', purpose: 'Ground reader in world', typicalLength: 'medium' },
    { name: 'tech-demo', description: 'Showcase technology in action', purpose: 'Demonstrate capabilities', typicalLength: 'short' },
    { name: 'ethical-debate', description: 'Characters debate implications', purpose: 'Explore themes', typicalLength: 'medium' },
    { name: 'action-sequence', description: 'Technology-driven action', purpose: 'Excitement', typicalLength: 'long' }
  ],
  
  pacingPattern: [5, 6, 6, 7, 6, 8, 7, 8, 9, 8, 7, 8, 9, 7, 6],
  
  defaultChapterCount: 20,
  
  compatibleSkills: ['worldbuilding', 'theme-exploration', 'foreshadowing', 'dialogue-natural'],
  
  defaultSkills: ['worldbuilding', 'theme-exploration', 'dialogue-natural'],
  
  writingGuidelines: [
    'Establish clear rules for technology and stick to them',
    'Focus on human impact of technology, not just tech itself',
    'Avoid excessive exposition - show tech in action',
    'Create believable future societies',
    'Balance scientific accuracy with storytelling',
    'Use tech to amplify human conflicts'
  ]
};
