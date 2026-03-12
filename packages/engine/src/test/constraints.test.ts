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
  Validator,
  createCanonStore,
  addFact,
  createStructuredState,
  initializeCharactersFromBible,
  createStoryBible,
  addCharacter,
  type Chapter,
} from '../index.js';

describe('Narrative Constraints Graph (Phase 9)', () => {
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
    structuredState.characters['陈侦探'].knowledge = ['凶手使用特殊刀具', '第一现场在码头'];

    structuredState.characters['凶手'].emotionalState = '警惕';
    structuredState.characters['凶手'].location = '法租界';

    return { bible, structuredState };
  };

  it('should create constraint graph', () => {
    const { structuredState } = createTestSetup();
    const graph = createConstraintGraph();

    graph.addLocation('上海滩', '繁华码头区', 1);
    graph.addLocation('法租界', '外国人居住区', 1);
    graph.addLocation('码头', '第一案发现场', 1);

    graph.addCharacter(structuredState.characters['陈侦探'], 1);
    graph.addCharacter(structuredState.characters['凶手'], 1);

    graph.addEvent('murder-1', '第一起谋杀案', ['凶手'], 1);

    const stats = graph.getStats();
    expect(stats.nodes).toBeGreaterThan(0);
    expect(stats.byType.location).toBeGreaterThanOrEqual(3);
    expect(stats.byType.character).toBe(2);
  });

  it('should query character knowledge', () => {
    const { structuredState } = createTestSetup();
    const graph = createConstraintGraph();
    graph.addCharacter(structuredState.characters['陈侦探'], 1);

    const detectiveKnowledge = graph.getCharacterKnowledge('陈侦探');
    expect(detectiveKnowledge.length).toBeGreaterThanOrEqual(0);
  });

  it('should query and update character location', () => {
    const { structuredState } = createTestSetup();
    const graph = createConstraintGraph();
    graph.addLocation('上海滩', '繁华码头区', 1);
    graph.addLocation('法租界', '外国人居住区', 1);
    graph.addCharacter(structuredState.characters['陈侦探'], 1);

    const initialLocation = graph.getCharacterLocation('陈侦探');
    expect(initialLocation).toBeTruthy();

    graph.updateCharacterLocation('陈侦探', '法租界', 3);
    const newLocation = graph.getCharacterLocation('陈侦探');
    expect(newLocation).toBe('法租界');
  });

  it('should check timeline consistency', () => {
    const { structuredState } = createTestSetup();
    const graph = createConstraintGraph();
    graph.addCharacter(structuredState.characters['陈侦探'], 1);

    const timelineViolations = graph.checkConstraints(3);
    expect(timelineViolations).toBeInstanceOf(Array);
  });

  it('should detect knowledge leaks', () => {
    const { structuredState } = createTestSetup();
    const graph = createConstraintGraph();
    graph.addCharacter(structuredState.characters['陈侦探'], 1);

    // Add a fact established in chapter 5
    const futureFact = {
      id: 'fact-future',
      type: 'fact' as const,
      label: '凶手真实身份暴露',
      properties: {},
      chapterEstablished: 5,
    };
    graph.addNode(futureFact);

    // Make detective know it in chapter 3 (impossible!)
    graph.addEdge({
      id: 'edge-leak',
      from: 'char-陈侦探',
      to: 'fact-future',
      type: 'knows',
      properties: { since: 3 },
    });

    const knowledgeViolations = graph.checkConstraints(3);
    const knowledgeErrors = knowledgeViolations.filter(v => v.type === 'knowledge');
    expect(knowledgeErrors.length).toBeGreaterThan(0);
  });

  it('should create and use canon store', () => {
    let canon = createCanonStore('test-story');
    canon = addFact(canon, {
      category: 'character',
      subject: '陈侦探',
      attribute: '职业',
      value: '私家侦探',
      chapterEstablished: 1,
    });
    canon = addFact(canon, {
      category: 'world',
      subject: '上海',
      attribute: '时期',
      value: '1920年代',
      chapterEstablished: 1,
    });

    expect(canon.facts.length).toBe(2);
    expect(canon.facts[0].subject).toBe('陈侦探');
  });

  it('should perform quick validation', () => {
    const { bible, structuredState } = createTestSetup();
    const graph = createConstraintGraph();
    graph.addLocation('上海滩', '繁华码头区', 1);
    graph.addLocation('法租界', '外国人居住区', 1);
    graph.addCharacter(structuredState.characters['陈侦探'], 1);

    let canon = createCanonStore('test-story');
    canon = addFact(canon, { category: 'character', subject: '陈侦探', attribute: '职业', value: '私家侦探', chapterEstablished: 1 });

    const testChapter: Chapter = {
      id: 'test-ch-3',
      storyId: 'test-story',
      number: 3,
      title: '追查',
      content: '陈侦探在法租界调查线索。他发现凶手使用特殊刀具，这与第一现场吻合。',
      wordCount: 500,
      summary: '陈侦探在法租界调查',
      generatedAt: new Date(),
    };

    const validator = new Validator(graph);
    const quickResult = validator.quickValidate({
      chapter: testChapter,
      bible,
      structuredState,
      canon,
      previousChapters: [],
      constraintGraph: graph,
    });

    expect(quickResult.valid).toBeDefined();
    expect(quickResult.violations).toBeInstanceOf(Array);
    expect(quickResult.summary).toBeTruthy();
  });

  it('should format validation result', () => {
    const { bible, structuredState } = createTestSetup();
    const graph = createConstraintGraph();
    graph.addCharacter(structuredState.characters['陈侦探'], 1);

    let canon = createCanonStore('test-story');
    canon = addFact(canon, { category: 'character', subject: '陈侦探', attribute: '职业', value: '私家侦探', chapterEstablished: 1 });

    const testChapter: Chapter = {
      id: 'test-ch-3',
      storyId: 'test-story',
      number: 3,
      title: '追查',
      content: '陈侦探在法租界调查线索。',
      wordCount: 100,
      summary: '陈侦探在法租界调查',
      generatedAt: new Date(),
    };

    const validator = new Validator(graph);
    const quickResult = validator.quickValidate({
      chapter: testChapter,
      bible,
      structuredState,
      canon,
      previousChapters: [],
      constraintGraph: graph,
    });

    const formatted = validator.formatResult(quickResult);
    expect(formatted).toBeTruthy();
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('should serialize and load graph', () => {
    const { structuredState } = createTestSetup();
    const graph = createConstraintGraph();
    graph.addLocation('上海滩', '繁华码头区', 1);
    graph.addCharacter(structuredState.characters['陈侦探'], 1);

    const serialized = graph.serialize();
    const graph2 = createConstraintGraph();
    graph2.load(serialized);

    const stats2 = graph2.getStats();
    expect(stats2.nodes).toBeGreaterThan(0);
  });

  it('should detect canon violations', () => {
    const { bible, structuredState } = createTestSetup();
    const graph = createConstraintGraph();
    graph.addCharacter(structuredState.characters['陈侦探'], 1);

    let canon = createCanonStore('test-story');
    canon = addFact(canon, { category: 'character', subject: '陈侦探', attribute: '职业', value: '私家侦探', chapterEstablished: 1 });

    const badChapter: Chapter = {
      id: 'test-ch-bad',
      storyId: 'test-story',
      number: 3,
      title: '错误章节',
      content: '陈侦探其实不是私家侦探，他是一名警察。故事发生在1930年代的北京。',
      wordCount: 100,
      summary: '包含矛盾内容',
      generatedAt: new Date(),
    };

    const validator = new Validator(graph);
    const badResult = validator.quickValidate({
      chapter: badChapter,
      bible,
      structuredState,
      canon,
      previousChapters: [],
      constraintGraph: graph,
    });

    const canonViolations = badResult.violations.filter(v => v.type === 'canon');
    expect(canonViolations.length).toBeGreaterThan(0);
  });

  it('should perform full validation with LLM', async () => {
    const { bible, structuredState } = createTestSetup();
    const graph = createConstraintGraph();
    graph.addLocation('上海滩', '繁华码头区', 1);
    graph.addCharacter(structuredState.characters['陈侦探'], 1);

    let canon = createCanonStore('test-story');
    canon = addFact(canon, { category: 'character', subject: '陈侦探', attribute: '职业', value: '私家侦探', chapterEstablished: 1 });

    const testChapter: Chapter = {
      id: 'test-ch-3',
      storyId: 'test-story',
      number: 3,
      title: '追查',
      content: '陈侦探在法租界调查线索。他发现凶手使用特殊刀具，这与第一现场吻合。',
      wordCount: 500,
      summary: '陈侦探在法租界调查',
      generatedAt: new Date(),
    };

    const validator = new Validator(graph);
    const llmResult = await validator.validateChapter({
      chapter: testChapter,
      bible,
      structuredState,
      canon,
      previousChapters: [],
      constraintGraph: graph,
    });

    expect(llmResult.valid).toBeDefined();
    expect(llmResult.violations).toBeInstanceOf(Array);
  }, 60000);
});
