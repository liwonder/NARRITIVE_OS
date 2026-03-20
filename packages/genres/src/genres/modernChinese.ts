import type { Genre } from '../types.js';

export const modernChinese: Genre = {
  name: 'modern-chinese',
  displayName: {
    en: 'Modern Chinese',
    zh: '现代都市'
  },
  description: '现代都市 - Modern urban Chinese fiction',
  
  requiredPlotPoints: [
    { name: 'workplace-entry', description: '职场新人或创业开始', required: true, typicalPosition: 10 },
    { name: 'first-success', description: '首次成功或升职', required: true, typicalPosition: 25 },
    { name: 'relationship-begins', description: '恋情开始或婚姻危机', required: true, typicalPosition: 35 },
    { name: 'career-crisis', description: '职场危机或创业失败', required: true, typicalPosition: 55 },
    { name: 'family-conflict', description: '原生家庭矛盾或催婚压力', required: false, typicalPosition: 65 },
    { name: 'self-discovery', description: '自我认知和成长', required: true, typicalPosition: 75 },
    { name: 'comeback', description: '东山再起或事业突破', required: true, typicalPosition: 85 },
    { name: 'balance', description: '事业与生活的平衡', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'office', description: '办公室日常或职场斗争', purpose: '展现职场', typicalLength: 'medium' },
    { name: 'social-gathering', description: '同学聚会或朋友聚餐', purpose: '社交关系', typicalLength: 'medium' },
    { name: 'family-dinner', description: '家庭聚餐或催婚场景', purpose: '家庭矛盾', typicalLength: 'medium' },
    { name: 'city-night', description: '城市夜景中的独处或约会', purpose: '情感表达', typicalLength: 'short' }
  ],
  
  pacingPattern: [4, 5, 5, 6, 5, 7, 6, 7, 6, 7, 8, 7, 6, 5, 4],
  
  defaultChapterCount: 30,
  
  compatibleSkills: ['modern-chinese', 'dialogue-natural', 'emotional-depth', 'subtext'],
  
  defaultSkills: ['modern-chinese', 'dialogue-natural', 'emotional-depth'],
  
  writingGuidelines: [
    '语言口语化、网络化，贴近生活',
    '场景：北上广深、写字楼、咖啡厅、地铁',
    '职场压力、房价、催婚等现实话题',
    '人物关系：同事、闺蜜、原生家庭',
    '情感细腻，心理描写丰富',
    '社会阶层、贫富差距的反思',
    '使用当下流行语和网络用语',
    '重视个人成长和自我实现'
  ]
};
