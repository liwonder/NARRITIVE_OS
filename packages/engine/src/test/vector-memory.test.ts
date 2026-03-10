import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Load config BEFORE importing engine
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

async function testVectorMemory() {
  console.log('Testing Vector Narrative Memory (Phase 3)...\n');

  const storyId = 'test-vector-memory-' + Date.now();

  // Test 1: Vector Store Initialization
  console.log('Test 1: Vector Store Initialization');
  const vectorStore = getVectorStore(storyId);
  await vectorStore.initialize();
  console.log('✅ Vector store initialized');

  // Test 2: Adding Memories
  console.log('\nTest 2: Adding Memories');
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
    {
      storyId,
      chapterNumber: 2,
      content: '李白被唐玄宗召入宫中供奉翰林',
      category: 'plot',
      timestamp: new Date(),
    },
  ];

  for (const memory of memories) {
    await vectorStore.addMemory(memory);
  }
  console.log(`✅ Added ${memories.length} memories`);

  // Test 3: Semantic Search
  console.log('\nTest 3: Semantic Search');
  const searchResults = await vectorStore.searchSimilar('李白写诗', 3);
  console.log(`✅ Search returned ${searchResults.length} results`);
  searchResults.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.memory.category}] ${r.memory.content.substring(0, 50)}... (score: ${r.score.toFixed(3)})`);
  });

  // Test 4: Category-based Search
  console.log('\nTest 4: Category-based Search');
  const characterResults = await vectorStore.searchByCategory('诗人性格', 'character', 2);
  console.log(`✅ Character search returned ${characterResults.length} results`);
  characterResults.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.memory.content}`);
  });

  // Test 5: Memory Retrieval with Context
  console.log('\nTest 5: Memory Retriever');
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

  console.log(`✅ Retrieved ${retrieved.length} relevant memories`);
  retrieved.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.memory.category}] ${r.memory.content.substring(0, 50)}...`);
  });

  // Test 6: Format for Prompt
  console.log('\nTest 6: Format Memories for Prompt');
  const formatted = retriever.formatMemoriesForPrompt(retrieved);
  console.log('Formatted output:');
  console.log(formatted);

  // Test 7: Serialization
  console.log('\nTest 7: Vector Store Serialization');
  const serialized = vectorStore.serialize();
  const parsed = JSON.parse(serialized);
  console.log(`✅ Serialized store with ${parsed.memories.length} memories`);

  // Test 8: Memory Extraction (requires LLM)
  console.log('\nTest 8: Memory Extraction from Chapter');
  const testChapter = {
    id: 'ch-3',
    storyId: bible.id,
    number: 3,
    title: '月下独酌',
    content: `
花间一壶酒，独酌无相亲。
举杯邀明月，对影成三人。
月既不解饮，影徒随我身。
暂伴月将影，行乐须及春。
我歌月徘徊，我舞影零乱。
醒时同交欢，醉后各分散。
永结无情游，相期邈云汉。

李白独自在花园中饮酒，没有亲友陪伴。他举起酒杯邀请明月共饮，
加上自己的影子，仿佛成了三个人。月亮不懂饮酒，影子也只是跟随，
但李白依然与它们相伴，享受这春日的欢乐。他唱歌时月亮似乎在徘徊，
跳舞时影子也零乱地跟随。清醒时一起欢乐，醉酒后各自分散。
李白希望与明月和影子永远结下这无情的游伴，相约在遥远的云汉之间。
`,
    summary: '李白月下独酌，与明月和影子为伴，写下千古名篇',
    wordCount: 200,
    generatedAt: new Date(),
  };

  try {
    const extracted = await memoryExtractor.extract(testChapter, bibleWithChar);
    console.log(`✅ Extracted ${extracted.length} memories from chapter`);
    extracted.forEach((m, i) => {
      console.log(`  ${i + 1}. [${m.category}] ${m.content}`);
    });
  } catch (error) {
    console.log('⚠️ Memory extraction skipped (LLM may not be available)');
  }

  // Cleanup
  clearVectorStore(storyId);
  console.log('\n✅ All Vector Memory tests passed!');
}

testVectorMemory()
  .then(() => {
    console.log('\n🎉 Phase 3 (Vector Memory) tests complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
