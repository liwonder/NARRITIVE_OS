// Load config BEFORE importing engine
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const configPath = join(homedir(), '.narrative-os', 'config.json');
if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  process.env.LLM_PROVIDER = config.provider;
  process.env.LLM_MODEL = 'deepseek-chat';
  if (config.provider === 'openai') {
    process.env.OPENAI_API_KEY = config.apiKey;
  } else if (config.provider === 'deepseek') {
    process.env.DEEPSEEK_API_KEY = config.apiKey;
  }
  console.log(`Loaded config: ${config.provider} / deepseek-chat`);
}

import { describe, it, expect } from 'vitest';
import {
  storyDirector,
  createStoryBible,
  addCharacter,
  addPlotThread,
  createStoryState,
  createStructuredState,
  initializeCharactersFromBible,
  initializePlotThreadsFromBible,
  updatePlotThread,
  addRecentEvent,
  addUnresolvedQuestion,
  generateTensionGuidance,
  analyzeTension,
  type ChapterSummary,
} from '../index.js';

describe('Story Director Agent (Phase 6)', () => {
  const createTestSetup = () => {
    let bible = createStoryBible(
      '李白传奇',
      '诗人寻找人生真谛',
      'historical-fiction',
      '唐朝长安及各地',
      '豪放浪漫',
      '诗人李白离开长安，游历天下，寻找人生真谛',
      10
    );

    bible = addCharacter(bible, '李白', 'protagonist', ['豪放', '浪漫', '不羁'], ['寻找人生真谛', '成为伟大诗人']);
    bible = addCharacter(bible, '杜甫', 'supporting', ['沉郁', '忧国忧民'], ['记录时代变迁']);
    bible = addCharacter(bible, '孟浩然', 'supporting', ['隐逸', '淡泊'], ['归隐山林']);

    bible = addPlotThread(bible, '诗人之旅', '李白从长安出发，游历天下');
    bible = addPlotThread(bible, '宫廷召唤', '唐玄宗召李白入宫的阴谋');
    bible = addPlotThread(bible, '友情之路', '李白与杜甫、孟浩然的交往');

    const storyState = createStoryState('test-story', 10);
    storyState.currentChapter = 3;

    let structuredState = createStructuredState('test-story');
    structuredState = initializeCharactersFromBible(structuredState, bible);
    structuredState = initializePlotThreadsFromBible(structuredState, bible);

    const threadIds = Object.keys(structuredState.plotThreads);
    if (threadIds[0]) {
      structuredState = updatePlotThread(structuredState, threadIds[0], { status: 'active', tension: 0.6 }, 3);
    }
    if (threadIds[1]) {
      structuredState = updatePlotThread(structuredState, threadIds[1], { status: 'escalating', tension: 0.4 }, 3);
    }

    structuredState = addRecentEvent(structuredState, '李白告别长安');
    structuredState = addRecentEvent(structuredState, '夜宿黄鹤楼');
    structuredState = addRecentEvent(structuredState, '遇见孟浩然');

    structuredState = addUnresolvedQuestion(structuredState, '李白会接受宫廷召唤吗？');
    structuredState = addUnresolvedQuestion(structuredState, '杜甫何时与李白相遇？');

    const tensionAnalysis = analyzeTension(storyState, structuredState);
    const tensionGuidance = generateTensionGuidance(tensionAnalysis, storyState);

    const previousSummaries: ChapterSummary[] = [
      {
        chapterNumber: 1,
        summary: '李白离开长安，踏上诗人之旅',
        keyEvents: ['告别长安', '独自上路'],
        characterChanges: { '李白': '从迷茫到坚定' },
      },
      {
        chapterNumber: 2,
        summary: '李白夜宿黄鹤楼，思考人生',
        keyEvents: ['夜宿黄鹤楼', '写诗抒怀'],
        characterChanges: { '李白': '更加坚定诗人之路' },
      },
      {
        chapterNumber: 3,
        summary: '李白遇见孟浩然，结为知己',
        keyEvents: ['遇见孟浩然', '饮酒论诗'],
        characterChanges: { '李白': '找到知音', '孟浩然': '欣赏李白才华' },
      },
    ];

    return { bible, storyState, structuredState, tensionGuidance, previousSummaries };
  };

  it('should generate fallback objectives', () => {
    const { storyState, structuredState } = createTestSetup();
    const fallbackOutput = storyDirector.generateFallbackObjectives(storyState, structuredState);

    expect(fallbackOutput.chapterNumber).toBeGreaterThan(0);
    expect(fallbackOutput.overallGoal).toBeTruthy();
    expect(fallbackOutput.objectives.length).toBeGreaterThan(0);
    expect(fallbackOutput.focusCharacters.length).toBeGreaterThan(0);
  });

  it('should format output for prompt', () => {
    const { storyState, structuredState } = createTestSetup();
    const fallbackOutput = storyDirector.generateFallbackObjectives(storyState, structuredState);
    const formatted = storyDirector.formatForPrompt(fallbackOutput);

    expect(formatted).toContain('Chapter');
    expect(formatted).toContain('Objectives');
  });

  it('should generate chapter plan with LLM', async () => {
    const { bible, storyState, structuredState, tensionGuidance, previousSummaries } = createTestSetup();

    const directorOutput = await storyDirector.direct({
      bible,
      state: storyState,
      structuredState,
      tensionGuidance,
      previousSummaries,
    });

    expect(directorOutput.chapterNumber).toBeGreaterThan(0);
    expect(directorOutput.overallGoal).toBeTruthy();
    expect(directorOutput.tone).toBeTruthy();
    expect(directorOutput.objectives.length).toBeGreaterThan(0);
    expect(directorOutput.focusCharacters.length).toBeGreaterThan(0);
    expect(directorOutput.suggestedScenes.length).toBeGreaterThan(0);
  }, 60000);

  it('should adapt objectives to different story phases', () => {
    const { storyState, structuredState } = createTestSetup();

    // Early phase
    storyState.currentChapter = 1;
    const earlyFallback = storyDirector.generateFallbackObjectives(storyState, structuredState);
    expect(earlyFallback.objectives.length).toBeGreaterThan(0);

    // Middle phase
    storyState.currentChapter = 5;
    const middleFallback = storyDirector.generateFallbackObjectives(storyState, structuredState);
    expect(middleFallback.objectives.length).toBeGreaterThan(0);

    // Late phase
    storyState.currentChapter = 9;
    const lateFallback = storyDirector.generateFallbackObjectives(storyState, structuredState);
    expect(lateFallback.objectives.length).toBeGreaterThan(0);
  });
});
