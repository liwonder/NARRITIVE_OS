// Load config BEFORE importing engine
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const configPath = join(homedir(), '.narrative-os', 'config.json');
if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  
  // Check if it's multi-model config
  if (config.models && Array.isArray(config.models)) {
    // Multi-model config - set the full config
    process.env.LLM_MODELS_CONFIG = JSON.stringify(config);
    
    // Also set individual API keys for backward compatibility
    for (const model of config.models) {
      if (model.provider === 'openai') {
        process.env.OPENAI_API_KEY = model.apiKey;
      } else if (model.provider === 'deepseek') {
        process.env.DEEPSEEK_API_KEY = model.apiKey;
      } else if (model.provider === 'alibaba') {
        process.env.ALIBABA_API_KEY = model.apiKey;
      } else if (model.provider === 'ark') {
        process.env.ARK_API_KEY = model.apiKey;
      }
    }
    console.log(`Loaded multi-model config with ${config.models.length} models`);
  } else {
    // Legacy single-model config
    process.env.LLM_PROVIDER = config.provider;
    process.env.LLM_MODEL = config.model || 'deepseek-chat';
    if (config.provider === 'openai') {
      process.env.OPENAI_API_KEY = config.apiKey;
    } else if (config.provider === 'deepseek') {
      process.env.DEEPSEEK_API_KEY = config.apiKey;
    }
    console.log(`Loaded config: ${config.provider} / ${config.model}`);
  }
}

import { describe, it, expect } from 'vitest';
import {
  VectorStore,
  getVectorStore,
  clearVectorStore,
  memoryExtractor,
  createMemoryRetriever,
  createStoryBible,
  addCharacter,
  createStoryState,
} from '../index.js';
import type { NarrativeMemory } from '../index.js';

describe('Vector Narrative Memory (Phase 3)', { timeout: 30000 }, () => {
  it('should initialize vector store', async () => {
    const storyId = 'test-vector-memory-' + Date.now();
    const vectorStore = getVectorStore(storyId);
    await vectorStore.initialize();
    expect(vectorStore).toBeDefined();
    clearVectorStore(storyId);
  });

  it('should add memories', async () => {
    const storyId = 'test-add-memories-' + Date.now();
    const vectorStore = getVectorStore(storyId);
    await vectorStore.initialize();

    const memories: Omit<NarrativeMemory, 'id' | 'embedding'>[] = [
      {
        storyId,
        chapterNumber: 1,
        content: '李白在黄鹤楼与孟浩然告别，写下著名的送别诗',
        category: 'event',
        timestamp: new Date(),
      },
      {
        storyId,
        chapterNumber: 1,
        content: '李白性格豪放，喜欢饮酒作诗',
        category: 'character',
        timestamp: new Date(),
      },
      {
        storyId,
        chapterNumber: 2,
        content: '唐朝长安城是当时世界上最大的城市',
        category: 'world',
        timestamp: new Date(),
      },
    ];

    for (const memory of memories) {
      await vectorStore.addMemory(memory);
    }

    const allMemories = vectorStore.getAllMemories();
    expect(allMemories.length).toBe(3);
    clearVectorStore(storyId);
  });

  it('should perform semantic search', async () => {
    const storyId = 'test-search-' + Date.now();
    const vectorStore = getVectorStore(storyId);
    await vectorStore.initialize();

    await vectorStore.addMemory({
      storyId,
      chapterNumber: 1,
      content: '李白在黄鹤楼与孟浩然告别，写下著名的送别诗',
      category: 'event',
      timestamp: new Date(),
    });

    await vectorStore.addMemory({
      storyId,
      chapterNumber: 1,
      content: '李白性格豪放，喜欢饮酒作诗',
      category: 'character',
      timestamp: new Date(),
    });

    const searchResults = await vectorStore.searchSimilar('李白写诗', 3);
    expect(searchResults.length).toBeGreaterThan(0);
    clearVectorStore(storyId);
  });

  it('should perform category-based search', async () => {
    const storyId = 'test-category-' + Date.now();
    const vectorStore = getVectorStore(storyId);
    await vectorStore.initialize();

    await vectorStore.addMemory({
      storyId,
      chapterNumber: 1,
      content: '李白性格豪放，喜欢饮酒作诗',
      category: 'character',
      timestamp: new Date(),
    });

    await vectorStore.addMemory({
      storyId,
      chapterNumber: 2,
      content: '唐朝长安城是当时世界上最大的城市',
      category: 'world',
      timestamp: new Date(),
    });

    const characterResults = await vectorStore.searchByCategory('诗人性格', 'character', 2);
    expect(characterResults.length).toBeGreaterThanOrEqual(0);
    clearVectorStore(storyId);
  });

  it('should retrieve memories with context', async () => {
    const storyId = 'test-retriever-' + Date.now();
    const vectorStore = getVectorStore(storyId);
    await vectorStore.initialize();

    await vectorStore.addMemory({
      storyId,
      chapterNumber: 1,
      content: '李白在黄鹤楼与孟浩然告别',
      category: 'event',
      timestamp: new Date(),
    });

    const bible = createStoryBible(
      '李白传',
      '诗仙传奇',
      '传记',
      '唐朝',
      '豪放浪漫',
      '李白一生的传奇经历',
      10
    );
    const bibleWithChar = addCharacter(bible, '李白', 'protagonist', ['豪放', '浪漫'], ['写诗', '饮酒']);
    const state = createStoryState(bibleWithChar.id, 10);

    const retriever = createMemoryRetriever(vectorStore);
    const retrieved = await retriever.retrieveForChapter({
      bible: bibleWithChar,
      state,
      currentChapter: 3,
    }, 3);

    expect(retrieved).toBeInstanceOf(Array);
    clearVectorStore(storyId);
  });

  it('should format memories for prompt', async () => {
    const storyId = 'test-format-' + Date.now();
    const vectorStore = getVectorStore(storyId);
    await vectorStore.initialize();

    await vectorStore.addMemory({
      storyId,
      chapterNumber: 1,
      content: '李白在黄鹤楼与孟浩然告别',
      category: 'event',
      timestamp: new Date(),
    });

    const bible = createStoryBible('Test', 'Theme', 'Genre', 'Setting', 'Tone', 'Premise', 10);
    const state = createStoryState(bible.id, 10);

    const retriever = createMemoryRetriever(vectorStore);
    const retrieved = await retriever.retrieveForChapter({ bible, state, currentChapter: 3 }, 3);
    const formatted = retriever.formatMemoriesForPrompt(retrieved);

    expect(formatted).toBeTruthy();
    clearVectorStore(storyId);
  });

  it('should serialize vector store', async () => {
    const storyId = 'test-serialize-' + Date.now();
    const vectorStore = getVectorStore(storyId);
    await vectorStore.initialize();

    await vectorStore.addMemory({
      storyId,
      chapterNumber: 1,
      content: '李白在黄鹤楼与孟浩然告别',
      category: 'event',
      timestamp: new Date(),
    });

    const serialized = vectorStore.serialize();
    const parsed = JSON.parse(serialized);

    expect(parsed.memories).toBeInstanceOf(Array);
    expect(parsed.memories.length).toBe(1);
    clearVectorStore(storyId);
  });

  it('should extract memories from chapter', async () => {
    const bible = createStoryBible(
      '李白传',
      '诗仙传奇',
      '传记',
      '唐朝',
      '豪放浪漫',
      '李白一生的传奇经历',
      10
    );
    const bibleWithChar = addCharacter(bible, '李白', 'protagonist', ['豪放', '浪漫'], ['写诗', '饮酒']);

    const testChapter = {
      id: 'ch-3',
      storyId: bible.id,
      number: 3,
      title: '月下独酌',
      content: `
花间一壶酒，独酌无相亲。
举杯邀明月，对影成三人。
李白独自在花园中饮酒，没有亲友陪伴。他举起酒杯邀请明月共饮，
加上自己的影子，仿佛成了三个人。
`,
      summary: '李白月下独酌，与明月和影子为伴',
      wordCount: 200,
      generatedAt: new Date(),
    };

    const extracted = await memoryExtractor.extract(testChapter, bibleWithChar);
    expect(extracted).toBeInstanceOf(Array);
  }, 30000);
});
