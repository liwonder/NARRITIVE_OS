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
  console.log(`Loaded config: ${config.provider} / ${config.model}`);
}

import { describe, it, expect } from 'vitest';
import {
  createCanonStore,
  addFact,
  formatCanonForPrompt,
  extractCanonFromBible,
  createStoryBible,
  addCharacter,
  addPlotThread,
  canonValidator,
} from '../index.js';
import type { CanonStore } from '../index.js';

describe('Canon Memory System (Phase 2)', () => {
  it('should create a canon store', () => {
    const canon = createCanonStore('test-story-123');
    expect(canon).toBeDefined();
    expect(canon.storyId).toBe('test-story-123');
    expect(canon.facts).toBeInstanceOf(Array);
  });

  it('should add facts to canon store', () => {
    let canon = createCanonStore('test-story');
    canon = addFact(canon, { category: 'character', subject: '李白', attribute: '职业', value: '诗人', chapterEstablished: 1 });
    canon = addFact(canon, { category: 'character', subject: '李白', attribute: '朝代', value: '唐朝', chapterEstablished: 1 });
    canon = addFact(canon, { category: 'world', subject: '长安', attribute: '地位', value: '唐朝都城', chapterEstablished: 1 });
    
    expect(canon.facts.length).toBe(3);
    expect(canon.facts[0].subject).toBe('李白');
    expect(canon.facts[1].value).toBe('唐朝');
  });

  it('should format canon for prompt', () => {
    let canon = createCanonStore('test-story');
    canon = addFact(canon, { category: 'character', subject: '李白', attribute: '职业', value: '诗人', chapterEstablished: 1 });
    canon = addFact(canon, { category: 'world', subject: '长安', attribute: '地位', value: '唐朝都城', chapterEstablished: 1 });
    
    const formatted = formatCanonForPrompt(canon);
    expect(formatted).toContain('李白');
    expect(formatted).toContain('长安');
    expect(formatted).toContain('唐朝都城');
  });

  it('should extract canon from StoryBible', () => {
    const bible = createStoryBible(
      '测试故事',
      '测试主题',
      '测试类型',
      '测试背景',
      '测试基调',
      '测试前提',
      5
    );

    const bibleWithChar = addCharacter(
      bible,
      '杜甫',
      'protagonist',
      ['忧国忧民', '诗圣'],
      ['记录时代', '关怀百姓']
    );

    const bibleWithPlot = addPlotThread(
      bibleWithChar,
      '安史之乱',
      '唐朝由盛转衰的转折点'
    );

    const extractedCanon = extractCanonFromBible(bibleWithPlot);
    expect(extractedCanon.facts.length).toBeGreaterThan(0);
    expect(extractedCanon.facts.some(f => f.subject === '杜甫')).toBe(true);
  });

  it('should validate content against canon', async () => {
    const bible = createStoryBible('测试', '主题', '类型', '背景', '基调', '前提', 5);
    const bibleWithChar = addCharacter(bible, '杜甫', 'protagonist', ['忧国忧民'], ['记录时代']);
    const canon = extractCanonFromBible(bibleWithChar);

    const testContent = `杜甫是唐朝著名的诗人，被称为"诗圣"。他生活在安史之乱时期。`;

    const validation = await canonValidator.validate(testContent, canon);
    expect(validation).toBeDefined();
    expect(validation.violations).toBeInstanceOf(Array);
  }, 30000);

  it('should serialize and deserialize canon', () => {
    let canon = createCanonStore('test-story');
    canon = addFact(canon, { category: 'character', subject: '李白', attribute: '职业', value: '诗人', chapterEstablished: 1 });
    
    const serialized = JSON.stringify(canon);
    const deserialized: CanonStore = JSON.parse(serialized);
    
    expect(deserialized.storyId).toBe(canon.storyId);
    expect(deserialized.facts.length).toBe(canon.facts.length);
  });

  it('should detect contradictions in content', async () => {
    let canon = createCanonStore('contradiction-test');
    canon = addFact(canon, { category: 'character', subject: '李白', attribute: '状态', value: '活着', chapterEstablished: 1 });

    const contradictingContent = `李白已经去世多年，他的诗歌流传千古。`;

    const validation = await canonValidator.validate(contradictingContent, canon);
    expect(validation.violations.length).toBeGreaterThan(0);
  }, 30000);
});
