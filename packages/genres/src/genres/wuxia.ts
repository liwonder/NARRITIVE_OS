import type { Genre } from '../types.js';

export const wuxia: Genre = {
  name: 'wuxia',
  displayName: {
    en: 'Wuxia',
    zh: '武侠江湖'
  },
  description: '武侠 - Martial arts fantasy with chivalric code (江湖世界)',
  
  requiredPlotPoints: [
    { name: 'enter-jianghu', description: '主角踏入江湖世界', required: true, typicalPosition: 10 },
    { name: 'master-disciple', description: '拜师学艺或获得武功秘籍', required: true, typicalPosition: 20 },
    { name: 'first-battle', description: '初试身手，扬名立万', required: true, typicalPosition: 30 },
    { name: 'grudge-origin', description: '恩怨起源，血海深仇', required: true, typicalPosition: 40 },
    { name: 'martial-arts-tournament', description: '武林大会或比武招亲', required: false, typicalPosition: 60 },
    { name: 'betrayal', description: '师门背叛或兄弟反目', required: false, typicalPosition: 70 },
    { name: 'final-duel', description: '巅峰对决，快意恩仇', required: true, typicalPosition: 90 },
    { name: 'jianghu-legend', description: '成为江湖传说或归隐山林', required: true, typicalPosition: 98 }
  ],
  
  sceneTypes: [
    { name: 'martial-arts-training', description: '练功习武，突破境界', purpose: '提升武功', typicalLength: 'medium' },
    { name: 'inn-confrontation', description: '酒楼客栈的冲突', purpose: '展现侠义', typicalLength: 'short' },
    { name: 'midnight-duel', description: '月下决斗或竹林比剑', purpose: '解决恩怨', typicalLength: 'medium' },
    { name: 'sect-gathering', description: '门派集会或武林大会', purpose: '推动剧情', typicalLength: 'long' }
  ],
  
  pacingPattern: [5, 6, 7, 6, 8, 7, 9, 8, 9, 10, 8, 9, 10, 8, 6],
  
  defaultChapterCount: 50, // Wuxia novels are typically long
  
  compatibleSkills: ['wuxia-style', 'dialogue-natural', 'foreshadowing', 'suspense', 'atmosphere'],
  
  defaultSkills: ['wuxia-style', 'dialogue-natural', 'foreshadowing'],
  
  writingGuidelines: [
    '重视江湖道义和师徒传承',
    '描写武功招式要有诗意和画面感',
    '人物性格鲜明：侠义、豪爽、隐忍、狡诈',
    '场景要有古典意境：竹林、古刹、酒楼、悬崖',
    '对话要有古风韵味，适当使用成语典故',
    '情节要有恩怨情仇，快意恩仇',
    '武功分级体系要明确',
    '重视内功心法和武学境界'
  ]
};
