import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Load config BEFORE importing engine (to initialize LLM correctly)
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

// Now import engine
import { generateChapter, createStoryBible, addCharacter, createStoryState, extractCanonFromBible } from '../index.js';
import type { GenerationContext } from '../index.js';

async function testGeneration() {
  console.log('Testing chapter generation...\n');

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

  try {
    const result = await generateChapter(context, { canon });
    
    console.log('✅ Generation successful!\n');
    console.log(`Title: ${result.chapter.title}`);
    console.log(`Words: ${result.chapter.wordCount}`);
    console.log(`Violations: ${result.violations.length}`);
    console.log('\n--- Content Preview ---');
    console.log(result.chapter.content.substring(0, 500) + '...');
    console.log('\n--- Summary ---');
    console.log(result.summary.summary);
    
  } catch (error) {
    console.error('❌ Generation failed:', error);
  }
}

testGeneration();
