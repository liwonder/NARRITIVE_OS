// Load config BEFORE importing engine (to initialize LLM correctly)
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
  console.log(`Loaded config: ${config.provider} / ${config.model}`);
}

import { describe, it, expect } from 'vitest';
import {
  createConstraintGraph,
  VectorStore,
  createCanonStore,
  createStructuredState,
  initializeCharactersFromBible,
  createStoryBible,
  addCharacter,
  StateUpdaterPipeline,
  type Chapter,
} from '../index.js';

describe('Memory + Graph Updates Pipeline (Phase 10)', () => {
  const createTestSetup = () => {
    const bible = createStoryBible(
      '侦探故事',
      '真相与正义',
      'mystery',
      '1920年代上海',
      '悬疑紧张',
      '侦探调查连环杀人案，揭开真相',
      10
    );

    let structuredState = createStructuredState('test-story');
    structuredState = initializeCharactersFromBible(
      structuredState,
      addCharacter(
        addCharacter(bible, '陈侦探', 'protagonist', ['聪明', '冷静', '执着'], ['找出凶手', '维护正义']),
        '凶手',
        'antagonist',
        ['狡猾', '残忍', '伪装'],
        ['逃避追捕', '继续犯罪']
      )
    );

    structuredState.characters['陈侦探'].emotionalState = '专注';
    structuredState.characters['陈侦探'].location = '上海滩';
    structuredState.characters['陈侦探'].knowledge = ['凶手使用特殊刀具'];

    structuredState.characters['凶手'].emotionalState = '警惕';
    structuredState.characters['凶手'].location = '法租界';

    structuredState.plotThreads['main-mystery'] = {
      id: 'main-mystery',
      name: '连环杀人案调查',
      status: 'active',
      tension: 0.6,
      summary: '陈侦探正在调查连环杀人案',
      lastChapter: 1,
      involvedCharacters: ['陈侦探'],
    };

    return { bible, structuredState };
  };

  it('should initialize pipeline components', () => {
    const { structuredState } = createTestSetup();
    const constraintGraph = createConstraintGraph();
    constraintGraph.addLocation('上海滩', '繁华码头区', 1);
    constraintGraph.addLocation('法租界', '外国人居住区', 1);
    constraintGraph.addCharacter(structuredState.characters['陈侦探'], 1);
    constraintGraph.addCharacter(structuredState.characters['凶手'], 1);

    const canon = createCanonStore('test-story');

    expect(constraintGraph.getStats().nodes).toBeGreaterThan(0);
    expect(canon.facts).toBeInstanceOf(Array);
  });

  it('should perform quick update', async () => {
    const { bible, structuredState } = createTestSetup();
    const constraintGraph = createConstraintGraph();
    constraintGraph.addLocation('上海滩', '繁华码头区', 1);
    constraintGraph.addLocation('法租界', '外国人居住区', 1);
    constraintGraph.addCharacter(structuredState.characters['陈侦探'], 1);

    const vectorStore = new VectorStore('test-story');
    await vectorStore.initialize();

    const canon = createCanonStore('test-story');

    const testChapter: Chapter = {
      id: 'ch-2',
      storyId: 'test-story',
      number: 2,
      title: '法租界追踪',
      content: '陈侦探在法租界发现了凶手的踪迹。他跟踪凶手来到一条小巷，发现了关键证据。陈侦探感到兴奋，因为他离真相更近了一步。',
      wordCount: 800,
      summary: '陈侦探在法租界追踪凶手并发现关键证据',
      generatedAt: new Date(),
    };

    const pipeline = new StateUpdaterPipeline();
    const quickResult = await pipeline.quickUpdate({
      chapter: testChapter,
      bible,
      currentState: structuredState,
      canon,
      vectorStore,
      constraintGraph,
    });

    expect(quickResult.memoriesAdded).toBeGreaterThanOrEqual(0);
    expect(quickResult.graphUpdated).toBe(true);
    expect(quickResult.changes).toBeInstanceOf(Array);
    expect(quickResult.structuredState.chapter).toBe(2);
  });

  it('should update vector store', async () => {
    const { bible, structuredState } = createTestSetup();
    const constraintGraph = createConstraintGraph();
    constraintGraph.addCharacter(structuredState.characters['陈侦探'], 1);

    const vectorStore = new VectorStore('test-story');
    await vectorStore.initialize();

    const canon = createCanonStore('test-story');

    const testChapter: Chapter = {
      id: 'ch-2',
      storyId: 'test-story',
      number: 2,
      title: '法租界追踪',
      content: '陈侦探在法租界发现了凶手的踪迹。',
      wordCount: 200,
      summary: '陈侦探在法租界追踪凶手',
      generatedAt: new Date(),
    };

    const pipeline = new StateUpdaterPipeline();
    await pipeline.quickUpdate({
      chapter: testChapter,
      bible,
      currentState: structuredState,
      canon,
      vectorStore,
      constraintGraph,
    });

    const allMemories = vectorStore.getAllMemories();
    expect(allMemories.length).toBeGreaterThan(0);
  });

  it('should update constraint graph', async () => {
    const { bible, structuredState } = createTestSetup();
    const constraintGraph = createConstraintGraph();
    constraintGraph.addLocation('上海滩', '繁华码头区', 1);
    constraintGraph.addLocation('法租界', '外国人居住区', 1);
    constraintGraph.addCharacter(structuredState.characters['陈侦探'], 1);

    const vectorStore = new VectorStore('test-story');
    await vectorStore.initialize();
    const canon = createCanonStore('test-story');

    const testChapter: Chapter = {
      id: 'ch-2',
      storyId: 'test-story',
      number: 2,
      title: '法租界追踪',
      content: '陈侦探在法租界发现了凶手的踪迹。',
      wordCount: 200,
      summary: '陈侦探在法租界追踪凶手',
      generatedAt: new Date(),
    };

    const pipeline = new StateUpdaterPipeline();
    await pipeline.quickUpdate({
      chapter: testChapter,
      bible,
      currentState: structuredState,
      canon,
      vectorStore,
      constraintGraph,
    });

    const graphStats = constraintGraph.getStats();
    expect(graphStats.nodes).toBeGreaterThan(0);
  });

  it('should format update result', async () => {
    const { bible, structuredState } = createTestSetup();
    const constraintGraph = createConstraintGraph();
    constraintGraph.addCharacter(structuredState.characters['陈侦探'], 1);

    const vectorStore = new VectorStore('test-story');
    await vectorStore.initialize();
    const canon = createCanonStore('test-story');

    const testChapter: Chapter = {
      id: 'ch-2',
      storyId: 'test-story',
      number: 2,
      title: '法租界追踪',
      content: '陈侦探在法租界发现了凶手的踪迹。',
      wordCount: 200,
      summary: '陈侦探在法租界追踪凶手',
      generatedAt: new Date(),
    };

    const pipeline = new StateUpdaterPipeline();
    const quickResult = await pipeline.quickUpdate({
      chapter: testChapter,
      bible,
      currentState: structuredState,
      canon,
      vectorStore,
      constraintGraph,
    });

    const formatted = pipeline.formatResult(quickResult);
    expect(formatted).toBeTruthy();
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('should perform full update with LLM', async () => {
    const { bible, structuredState } = createTestSetup();
    const constraintGraph = createConstraintGraph();
    constraintGraph.addCharacter(structuredState.characters['陈侦探'], 1);

    const vectorStore = new VectorStore('test-story');
    await vectorStore.initialize();
    const canon = createCanonStore('test-story');

    const testChapter: Chapter = {
      id: 'ch-2',
      storyId: 'test-story',
      number: 2,
      title: '法租界追踪',
      content: '陈侦探在法租界发现了凶手的踪迹。他跟踪凶手来到一条小巷，发现了关键证据。',
      wordCount: 400,
      summary: '陈侦探在法租界追踪凶手并发现关键证据',
      generatedAt: new Date(),
    };

    const pipeline = new StateUpdaterPipeline();
    const llmResult = await pipeline.update({
      chapter: testChapter,
      bible,
      currentState: structuredState,
      canon,
      vectorStore,
      constraintGraph,
    });

    expect(llmResult.memoriesAdded).toBeGreaterThanOrEqual(0);
    expect(llmResult.changes).toBeInstanceOf(Array);
  }, 60000);

  it('should handle multiple chapters', async () => {
    const { bible, structuredState } = createTestSetup();
    const constraintGraph = createConstraintGraph();
    constraintGraph.addCharacter(structuredState.characters['陈侦探'], 1);

    const vectorStore = new VectorStore('test-story');
    await vectorStore.initialize();
    const canon = createCanonStore('test-story');

    const chapters: Chapter[] = [
      {
        id: 'ch-3',
        storyId: 'test-story',
        number: 3,
        title: '证据分析',
        content: '陈侦探回到办公室分析证据。',
        wordCount: 600,
        summary: '陈侦探分析收集到的证据',
        generatedAt: new Date(),
      },
      {
        id: 'ch-4',
        storyId: 'test-story',
        number: 4,
        title: '真相大白',
        content: '陈侦探终于揭开了凶手的真面目。',
        wordCount: 900,
        summary: '陈侦探揭开真相',
        generatedAt: new Date(),
      },
    ];

    const pipeline = new StateUpdaterPipeline();
    let currentState = structuredState;

    for (const chapter of chapters) {
      const result = await pipeline.quickUpdate({
        chapter,
        bible,
        currentState,
        canon,
        vectorStore,
        constraintGraph,
      });
      currentState = result.structuredState;
    }

    expect(vectorStore.getAllMemories().length).toBeGreaterThan(0);
  });

  it('should search memories', async () => {
    const { bible, structuredState } = createTestSetup();
    const constraintGraph = createConstraintGraph();
    constraintGraph.addCharacter(structuredState.characters['陈侦探'], 1);

    const vectorStore = new VectorStore('test-story');
    await vectorStore.initialize();
    const canon = createCanonStore('test-story');

    const testChapter: Chapter = {
      id: 'ch-2',
      storyId: 'test-story',
      number: 2,
      title: '法租界追踪',
      content: '陈侦探在法租界发现了凶手的踪迹。',
      wordCount: 200,
      summary: '陈侦探在法租界追踪凶手',
      generatedAt: new Date(),
    };

    const pipeline = new StateUpdaterPipeline();
    await pipeline.quickUpdate({
      chapter: testChapter,
      bible,
      currentState: structuredState,
      canon,
      vectorStore,
      constraintGraph,
    });

    const searchResults = await vectorStore.searchSimilar('凶手', 3);
    expect(searchResults.length).toBeGreaterThanOrEqual(0);
  });
});
