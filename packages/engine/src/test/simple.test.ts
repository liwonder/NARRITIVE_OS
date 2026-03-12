// Load config BEFORE importing engine (to initialize LLM correctly)
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const configPath = join(homedir(), '.narrative-os', 'config.json');
if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  process.env.LLM_PROVIDER = config.provider;
  // Use deepseek-chat (reasoner may not be available for all API keys)
  process.env.LLM_MODEL = 'deepseek-chat';
  if (config.provider === 'openai') {
    process.env.OPENAI_API_KEY = config.apiKey;
  } else if (config.provider === 'deepseek') {
    process.env.DEEPSEEK_API_KEY = config.apiKey;
  }
  console.log(`Loaded config: ${config.provider} / ${config.model}`);
}

import { describe, it, expect } from 'vitest';
import { generateChapter, createStoryBible, addCharacter, createStoryState, extractCanonFromBible } from '../index.js';
import type { GenerationContext } from '../index.js';

describe('Simple Chapter Generation', () => {
  it('should generate a chapter with scene-level generation', async () => {
    const bible = createStoryBible(
      '古诗集',
      '自然与人生',
      '古典诗歌',
      '唐朝',
      '优雅，含蓄',
      '一位诗人游历山水，写下对自然和人生的感悟',
      3
    );

    const bibleWithChar = addCharacter(
      bible,
      '李白',
      'protagonist',
      ['豪放', '浪漫', '才华横溢'],
      ['游历名山大川', '留下千古诗篇']
    );

    const state = createStoryState(bibleWithChar.id, 3);
    const canon = extractCanonFromBible(bibleWithChar);

    const context: GenerationContext = {
      bible: bibleWithChar,
      state,
      chapterNumber: 1,
      targetWordCount: 500,
    };

    const result = await generateChapter(context, { canon });
    
    expect(result.chapter).toBeDefined();
    expect(result.chapter.title).toBeTruthy();
    expect(result.chapter.content).toBeTruthy();
    expect(result.chapter.wordCount).toBeGreaterThan(100);
    expect(result.summary).toBeDefined();
    expect(result.violations).toBeInstanceOf(Array);
  }, 120000);
});
