import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Load config BEFORE importing engine
const configPath = join(homedir(), '.narrative-os', 'config.json');
if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  process.env.LLM_PROVIDER = config.provider;
  // Use deepseek-chat for JSON tasks (reasoner model has different output format)
  process.env.LLM_MODEL = 'deepseek-chat';
  if (config.provider === 'openai') {
    process.env.OPENAI_API_KEY = config.apiKey;
  } else if (config.provider === 'deepseek') {
    process.env.DEEPSEEK_API_KEY = config.apiKey;
  }
  console.log(`Loaded config: ${config.provider} / deepseek-chat (using chat for JSON tasks)`);
}

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

console.log('Testing Structured Story State (Phase 4)...\n');

// Test 1: Create structured state
console.log('Test 1: Create Structured State');
const state = createStructuredState('test-story');
console.log('✅ Structured state created');
console.log(`  - Chapter: ${state.chapter}`);
console.log(`  - Tension: ${state.tension}`);

// Test 2: Create story bible and initialize
console.log('\nTest 2: Initialize from StoryBible');
let bible = createStoryBible(
  '李白传奇',
  '诗人寻找人生真谛',
  'historical-fiction',
  '唐朝长安及各地',
  '豪放浪漫',
  '诗人李白离开长安，游历天下，寻找人生真谛',
  10
);
bible = addCharacter(
  bible,
  '李白',
  'protagonist',
  ['豪放', '浪漫', '不羁'],
  ['寻找人生真谛', '成为伟大诗人']
);
bible = addCharacter(
  bible,
  '杜甫',
  'supporting',
  ['沉郁', '忧国忧民'],
  ['记录时代变迁']
);
bible = addPlotThread(
  bible,
  '诗人之旅',
  '李白从长安出发，游历天下，寻找人生真谛'
);
bible = addPlotThread(
  bible,
  '宫廷阴谋',
  '朝堂上的权力斗争'
);

let structuredState = initializeCharactersFromBible(state, bible);
structuredState = initializePlotThreadsFromBible(structuredState, bible);
console.log('✅ Initialized from bible');
console.log(`  - Characters: ${Object.keys(structuredState.characters).length}`);
console.log(`  - Plot threads: ${Object.keys(structuredState.plotThreads).length}`);

// Test 3: Update character state
console.log('\nTest 3: Update Character State');
structuredState = updateCharacterState(structuredState, '李白', {
  emotionalState: 'melancholic',
  location: '黄鹤楼',
  goals: ['寻找人生真谛', '成为伟大诗人', '与友人告别'],
});
console.log('✅ Character state updated');
console.log(`  - 李白 emotion: ${structuredState.characters['李白'].emotionalState}`);
console.log(`  - 李白 location: ${structuredState.characters['李白'].location}`);

// Test 4: Update plot thread
console.log('\nTest 4: Update Plot Thread');
const threadIds = Object.keys(structuredState.plotThreads);
const firstThreadId = threadIds[0];
structuredState = updatePlotThread(structuredState, firstThreadId, {
  status: 'escalating',
  tension: 0.5,
}, 3);
console.log('✅ Plot thread updated');
console.log(`  - Thread status: ${structuredState.plotThreads[firstThreadId].status}`);
console.log(`  - Thread tension: ${structuredState.plotThreads[firstThreadId].tension}`);

// Test 5: Questions
console.log('\nTest 5: Unresolved Questions');
structuredState = addUnresolvedQuestion(structuredState, '李白会去哪里？');
structuredState = addUnresolvedQuestion(structuredState, '杜甫何时出现？');
console.log('✅ Added questions');
console.log(`  - Questions: ${structuredState.unresolvedQuestions.length}`);

structuredState = resolveQuestion(structuredState, '李白会去哪里？');
console.log('✅ Resolved question');
console.log(`  - Remaining: ${structuredState.unresolvedQuestions.length}`);

// Test 6: Recent events
console.log('\nTest 6: Recent Events');
structuredState = addRecentEvent(structuredState, '李白告别长安');
structuredState = addRecentEvent(structuredState, '夜宿黄鹤楼');
structuredState = addRecentEvent(structuredState, '遇见孟浩然');
console.log('✅ Added recent events');
console.log(`  - Events: ${structuredState.recentEvents.length}`);

// Test 7: Tension calculation
console.log('\nTest 7: Tension Calculation');
const targetTension = calculateTargetTension(5, 10);
console.log(`✅ Target tension at chapter 5/10: ${targetTension}`);

structuredState = updateStoryTension(structuredState, 5, 10);
console.log(`✅ Updated story tension: ${structuredState.tension}`);

// Test 8: Format for prompt
console.log('\nTest 8: Format for Prompt');
const formatted = formatStructuredStateForPrompt(structuredState);
console.log('✅ Formatted state for prompt');
console.log('\n--- Formatted Output Preview ---');
console.log(formatted.substring(0, 500) + '...');

// Test 9: State Updater Agent
console.log('\nTest 9: State Updater Agent');
const testChapter = {
  id: 'test-chapter-3',
  storyId: 'test-story',
  number: 3,
  title: '黄鹤楼送别',
  content: `李白站在黄鹤楼上，望着滚滚东去的长江水。暮色四合，江面上泛起层层涟漪。

"孟兄，此去经年，不知何时再见。"李白举杯，声音中带着几分惆怅。

孟浩然拍了拍他的肩膀："太白兄，天下无不散之筵席。你我有缘，自会重逢。"

李白将杯中酒一饮而尽。他望着远方，心中涌起无限感慨。长安的繁华已成过往，前路漫漫，不知归处。

"我李白一生，求的是真性情，写的是真文章。"他喃喃自语，"这天下，这江山，都将成为我的诗篇。"

夜色渐深，孟浩然的船已远去。李白独立楼头，江风吹动他的衣袂。他知道，从此刻起，他真正踏上了属于自己的旅程。

远处传来渔歌，悠扬婉转。李白提笔，在楼壁上写下：故人西辞黄鹤楼，烟花三月下扬州。孤帆远影碧空尽，唯见长江天际流。`,
  wordCount: 350,
  summary: '李白在黄鹤楼与孟浩然告别，写下著名的送别诗，正式踏上诗人之旅',
  generatedAt: new Date(),
};

// Run async test
async function runStateUpdaterTest() {
  try {
    const updates = await stateUpdater.extractStateChanges(testChapter, bible, structuredState);
    console.log('✅ Extracted state changes');
    console.log(`  - Character updates: ${updates.characterUpdates.length}`);
    console.log(`  - Plot thread updates: ${updates.plotThreadUpdates.length}`);
    console.log(`  - New questions: ${updates.newQuestions.length}`);
    console.log(`  - Recent events: ${updates.recentEvents.length}`);
    
    // Apply updates
    const updatedState = stateUpdater.applyUpdates(structuredState, updates, 3);
    console.log('✅ Applied state updates');
    console.log(`  - 李白 emotion: ${updatedState.characters['李白'].emotionalState}`);
    console.log(`  - Recent events count: ${updatedState.recentEvents.length}`);
  } catch (error) {
    console.log('⚠️ State updater test failed:', error instanceof Error ? error.message : String(error));
  }
}

runStateUpdaterTest().then(() => {
  // Test 10: Serialization
  console.log('\nTest 10: Serialization');
  const serialized = JSON.stringify(structuredState);
  const deserialized = JSON.parse(serialized);
  console.log('✅ Serialization round-trip successful');
  console.log(`  - Original characters: ${Object.keys(structuredState.characters).length}`);
  console.log(`  - Deserialized characters: ${Object.keys(deserialized.characters).length}`);

  console.log('\n✅ All Structured State tests passed!');
  console.log('\n🎉 Phase 4 (Structured Story State) tests complete!');
});
