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
  createStoryBible,
  addCharacter,
  addPlotThread,
  createStructuredState,
  initializeCharactersFromBible,
  initializePlotThreadsFromBible,
  updateCharacterState,
  updatePlotThread,
  addUnresolvedQuestion,
  resolveQuestion,
  addRecentEvent,
  calculateTargetTension,
  updateStoryTension,
  formatStructuredStateForPrompt,
  stateUpdater,
} from '../index.js';

describe('Structured Story State (Phase 4)', () => {
  it('should create structured state', () => {
    const state = createStructuredState('test-story');
    expect(state.storyId).toBe('test-story');
    expect(state.chapter).toBe(0);
    expect(state.tension).toBeGreaterThanOrEqual(0);
    expect(state.characters).toEqual({});
    expect(state.plotThreads).toEqual({});
  });

  it('should initialize from StoryBible', () => {
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
    bible = addPlotThread(bible, '诗人之旅', '李白从长安出发，游历天下');
    bible = addPlotThread(bible, '宫廷阴谋', '朝堂上的权力斗争');

    let state = createStructuredState('test-story');
    state = initializeCharactersFromBible(state, bible);
    state = initializePlotThreadsFromBible(state, bible);

    expect(Object.keys(state.characters).length).toBe(2);
    expect(Object.keys(state.plotThreads).length).toBe(2);
    expect(state.characters['李白']).toBeDefined();
    expect(state.characters['杜甫']).toBeDefined();
  });

  it('should update character state', () => {
    let bible = createStoryBible('Test', 'Theme', 'Genre', 'Setting', 'Tone', 'Premise', 10);
    bible = addCharacter(bible, '李白', 'protagonist', ['豪放'], ['寻找']);

    let state = createStructuredState('test-story');
    state = initializeCharactersFromBible(state, bible);

    state = updateCharacterState(state, '李白', {
      emotionalState: 'melancholic',
      location: '黄鹤楼',
      goals: ['寻找人生真谛', '成为伟大诗人', '与友人告别'],
    });

    expect(state.characters['李白'].emotionalState).toBe('melancholic');
    expect(state.characters['李白'].location).toBe('黄鹤楼');
    expect(state.characters['李白'].goals.length).toBe(3);
  });

  it('should update plot thread', () => {
    let bible = createStoryBible('Test', 'Theme', 'Genre', 'Setting', 'Tone', 'Premise', 10);
    bible = addPlotThread(bible, '诗人之旅', '李白从长安出发');

    let state = createStructuredState('test-story');
    state = initializePlotThreadsFromBible(state, bible);

    const threadId = Object.keys(state.plotThreads)[0];
    state = updatePlotThread(state, threadId, { status: 'escalating', tension: 0.5 }, 3);

    expect(state.plotThreads[threadId].status).toBe('escalating');
    expect(state.plotThreads[threadId].tension).toBe(0.5);
  });

  it('should manage unresolved questions', () => {
    let state = createStructuredState('test-story');
    state = addUnresolvedQuestion(state, '李白会去哪里？');
    state = addUnresolvedQuestion(state, '杜甫何时出现？');

    expect(state.unresolvedQuestions.length).toBe(2);

    state = resolveQuestion(state, '李白会去哪里？');

    expect(state.unresolvedQuestions.length).toBe(1);
    expect(state.unresolvedQuestions[0]).toBe('杜甫何时出现？');
  });

  it('should add recent events', () => {
    let state = createStructuredState('test-story');
    state = addRecentEvent(state, '李白告别长安');
    state = addRecentEvent(state, '夜宿黄鹤楼');
    state = addRecentEvent(state, '遇见孟浩然');

    expect(state.recentEvents.length).toBe(3);
    expect(state.recentEvents[0]).toBe('李白告别长安');
  });

  it('should calculate and update tension', () => {
    const targetTension = calculateTargetTension(5, 10);
    expect(targetTension).toBeGreaterThan(0);
    expect(targetTension).toBeLessThanOrEqual(1);

    let state = createStructuredState('test-story');
    state = updateStoryTension(state, 5, 10);

    expect(state.tension).toBeGreaterThan(0);
  });

  it('should format for prompt', () => {
    let bible = createStoryBible('Test', 'Theme', 'Genre', 'Setting', 'Tone', 'Premise', 10);
    bible = addCharacter(bible, '李白', 'protagonist', ['豪放'], ['寻找']);

    let state = createStructuredState('test-story');
    state = initializeCharactersFromBible(state, bible);
    state = updateCharacterState(state, '李白', { emotionalState: 'happy', location: '长安' });

    const formatted = formatStructuredStateForPrompt(state);

    expect(formatted).toContain('Character');
    expect(formatted).toContain('李白');
  });

  it('should extract and apply state changes', async () => {
    let bible = createStoryBible('Test', 'Theme', 'Genre', 'Setting', 'Tone', 'Premise', 10);
    bible = addCharacter(bible, '李白', 'protagonist', ['豪放'], ['寻找']);

    let state = createStructuredState('test-story');
    state = initializeCharactersFromBible(state, bible);

    const testChapter = {
      id: 'test-chapter-3',
      storyId: 'test-story',
      number: 3,
      title: '黄鹤楼送别',
      content: `李白站在黄鹤楼上，望着滚滚东去的长江水。暮色四合，江面上泛起层层涟漪。

"孟兄，此去经年，不知何时再见。"李白举杯，声音中带着几分惆怅。

孟浩然拍了拍他的肩膀："太白兄，天下无不散之筵席。"

李白将杯中酒一饮而尽。他知道，从此刻起，他真正踏上了属于自己的旅程。`,
      wordCount: 200,
      summary: '李白在黄鹤楼与孟浩然告别',
      generatedAt: new Date(),
    };

    const updates = await stateUpdater.extractStateChanges(testChapter, bible, state);

    expect(updates).toBeDefined();
    expect(updates.characterUpdates).toBeInstanceOf(Array);
    expect(updates.plotThreadUpdates).toBeInstanceOf(Array);

    const updatedState = stateUpdater.applyUpdates(state, updates, 3);
    expect(updatedState.chapter).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('should serialize and deserialize', () => {
    let bible = createStoryBible('Test', 'Theme', 'Genre', 'Setting', 'Tone', 'Premise', 10);
    bible = addCharacter(bible, '李白', 'protagonist', ['豪放'], ['寻找']);

    let state = createStructuredState('test-story');
    state = initializeCharactersFromBible(state, bible);

    const serialized = JSON.stringify(state);
    const deserialized = JSON.parse(serialized);

    expect(Object.keys(deserialized.characters).length).toBe(Object.keys(state.characters).length);
    expect(deserialized.storyId).toBe(state.storyId);
  });
});
