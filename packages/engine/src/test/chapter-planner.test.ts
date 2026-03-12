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
  chapterPlanner,
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
  generateTensionGuidance,
  analyzeTension,
} from '../index.js';

describe('Chapter Planner Agent (Phase 7)', () => {
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
    bible = addCharacter(bible, '高力士', 'antagonist', ['阴险', '权谋'], ['控制李白为朝廷所用']);

    bible = addPlotThread(bible, '诗人之旅', '李白从长安出发，游历天下');
    bible = addPlotThread(bible, '宫廷阴谋', '高力士设计控制李白');

    const storyState = createStoryState('test-story', 10);
    storyState.currentChapter = 4;

    let structuredState = createStructuredState('test-story');
    structuredState = initializeCharactersFromBible(structuredState, bible);
    structuredState = initializePlotThreadsFromBible(structuredState, bible);
    structuredState.tension = 0.5;

    const threadIds = Object.keys(structuredState.plotThreads);
    if (threadIds[0]) {
      structuredState = updatePlotThread(structuredState, threadIds[0], { status: 'active', tension: 0.6 }, 4);
    }
    if (threadIds[1]) {
      structuredState = updatePlotThread(structuredState, threadIds[1], { status: 'escalating', tension: 0.7 }, 4);
    }

    structuredState = addRecentEvent(structuredState, '李白在黄鹤楼与孟浩然告别');
    structuredState = addRecentEvent(structuredState, '收到宫廷使者传来的密信');

    const directorOutput = storyDirector.generateFallbackObjectives(storyState, structuredState);
    directorOutput.overallGoal = '李白遭遇宫廷阴谋，与杜甫初次相遇，面临人生抉择';
    directorOutput.tone = '紧张中带有诗意';
    directorOutput.objectives = [
      { id: 'obj-1', description: '宫廷使者正式传达玄宗召唤，施加压力', priority: 'critical', type: 'plot', relatedPlotThreadId: threadIds[1] },
      { id: 'obj-2', description: '李白与杜甫在江边初次相遇', priority: 'high', type: 'character', relatedCharacter: '杜甫' },
      { id: 'obj-3', description: '展现李白面对召唤的内心挣扎', priority: 'high', type: 'character', relatedCharacter: '李白' },
      { id: 'obj-4', description: '提高章节紧张感至80%', priority: 'medium', type: 'tension' },
    ];
    directorOutput.focusCharacters = ['李白', '杜甫', '高力士'];
    directorOutput.suggestedScenes = ['江边送别场景', '宫廷使者突然出现', '李白与杜甫初次对话', '李白独自思考'];

    return { bible, storyState, structuredState, directorOutput };
  };

  it('should generate fallback outline', () => {
    const { directorOutput } = createTestSetup();
    const fallbackOutline = chapterPlanner.generateFallbackOutline(directorOutput, 2500);

    expect(fallbackOutline.chapterNumber).toBe(4);
    expect(fallbackOutline.overallGoal).toBeTruthy();
    expect(fallbackOutline.scenes.length).toBeGreaterThan(0);
    expect(fallbackOutline.totalEstimatedWords).toBeGreaterThan(0);
  });

  it('should format outline for prompt', () => {
    const { directorOutput } = createTestSetup();
    const fallbackOutline = chapterPlanner.generateFallbackOutline(directorOutput, 2500);
    const formatted = chapterPlanner.formatForPrompt(fallbackOutline);

    expect(formatted).toContain('Chapter');
    expect(formatted).toContain('Scene');
  });

  it('should validate outline coverage', () => {
    const { directorOutput } = createTestSetup();
    const fallbackOutline = chapterPlanner.generateFallbackOutline(directorOutput, 2500);
    const validation = chapterPlanner.validateOutline(fallbackOutline, directorOutput.objectives);

    expect(validation.valid).toBeDefined();
    expect(validation.coverage).toBeGreaterThanOrEqual(0);
    expect(validation.missedObjectives).toBeInstanceOf(Array);
  });

  it('should generate outline with LLM', async () => {
    const { bible, storyState, structuredState, directorOutput } = createTestSetup();
    const tensionAnalysis = analyzeTension(storyState, structuredState);
    const tensionGuidance = generateTensionGuidance(tensionAnalysis, storyState);

    const outline = await chapterPlanner.plan({
      bible,
      state: storyState,
      structuredState,
      directorOutput,
      targetWordCount: 2500,
    });

    expect(outline.chapterNumber).toBe(4);
    expect(outline.overallGoal).toBeTruthy();
    expect(outline.tone).toBeTruthy();
    expect(outline.scenes.length).toBeGreaterThan(0);
    expect(outline.totalEstimatedWords).toBeGreaterThan(0);
  }, 60000);

  it('should adapt outline to different word counts', () => {
    const { directorOutput } = createTestSetup();

    const shortOutline = chapterPlanner.generateFallbackOutline(directorOutput, 1500);
    const mediumOutline = chapterPlanner.generateFallbackOutline(directorOutput, 2500);
    const longOutline = chapterPlanner.generateFallbackOutline(directorOutput, 4000);

    expect(shortOutline.scenes.length).toBeLessThanOrEqual(mediumOutline.scenes.length);
    expect(mediumOutline.scenes.length).toBeLessThanOrEqual(longOutline.scenes.length);
  });
});
