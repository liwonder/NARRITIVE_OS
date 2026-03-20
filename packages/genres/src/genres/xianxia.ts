import type { Genre } from '../types.js';

export const xianxia: Genre = {
  name: 'xianxia',
  displayName: {
    en: 'Xianxia',
    zh: '仙侠修仙'
  },
  description: '仙侠 - Immortal cultivation fantasy (修仙世界)',
  
  requiredPlotPoints: [
    { name: 'awakening-spiritual-root', description: '觉醒灵根，踏上修仙路', required: true, typicalPosition: 5 },
    { name: 'join-sect', description: '加入门派，成为外门/内门弟子', required: true, typicalPosition: 15 },
    { name: 'first-breakthrough', description: '首次突破境界', required: true, typicalPosition: 25 },
    { name: 'treasure-acquisition', description: '获得法宝或奇遇', required: true, typicalPosition: 35 },
    { name: 'sect-competition', description: '门派大比或秘境探险', required: true, typicalPosition: 50 },
    { name: 'tribulation', description: '渡天劫或心魔考验', required: true, typicalPosition: 70 },
    { name: 'vengeance', description: '灭门之仇或师尊之仇', required: false, typicalPosition: 75 },
    { name: 'ascension', description: '飞升仙界或成为至尊', required: true, typicalPosition: 95 }
  ],
  
  sceneTypes: [
    { name: 'cultivation', description: '闭关修炼，突破境界', purpose: '提升修为', typicalLength: 'medium' },
    { name: 'pill-refining', description: '炼丹炼器', purpose: '获得资源', typicalLength: 'short' },
    { name: 'secret-realm', description: '探索秘境或古墓', purpose: '获得机缘', typicalLength: 'long' },
    { name: 'sect-battle', description: '门派大战或正邪对决', purpose: '冲突高潮', typicalLength: 'long' }
  ],
  
  pacingPattern: [4, 5, 6, 7, 6, 8, 7, 8, 9, 8, 9, 10, 9, 8, 7],
  
  defaultChapterCount: 100, // Xianxia novels are very long
  
  compatibleSkills: ['xianxia-style', 'worldbuilding', 'foreshadowing', 'suspense', 'atmosphere'],
  
  defaultSkills: ['xianxia-style', 'worldbuilding', 'foreshadowing'],
  
  writingGuidelines: [
    '修仙等级体系：炼气、筑基、金丹、元婴、化神、渡劫、大乘',
    '重视灵根资质和修炼资源',
    '法宝、丹药、灵石、功法系统',
    '门派争斗和正邪对立',
    '天劫、心魔、因果报应',
    '寿命悠长，时间跨度大',
    '重视师徒情谊和道侣关系',
    '场景：洞天福地、上古遗迹、仙山云海'
  ]
};
