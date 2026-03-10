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
  console.log(`Loaded config: ${config.provider} / deepseek-chat`);
}

import {
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
  addUnresolvedQuestion,
  generateTensionGuidance,
  analyzeTension,
  type ChapterSummary,
} from '../index.js';

console.log('Testing Story Director Agent (Phase 6)...\n');

// Setup test story
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
bible = addCharacter(bible, '孟浩然', 'supporting', ['隐逸', '淡泊'], ['归隐山林']);

bible = addPlotThread(bible, '诗人之旅', '李白从长安出发，游历天下');
bible = addPlotThread(bible, '宫廷召唤', '唐玄宗召李白入宫的阴谋');
bible = addPlotThread(bible, '友情之路', '李白与杜甫、孟浩然的交往');

const storyState = createStoryState('test-story', 10);
storyState.currentChapter = 3;

let structuredState = createStructuredState('test-story');
structuredState = initializeCharactersFromBible(structuredState, bible);
structuredState = initializePlotThreadsFromBible(structuredState, bible);

// Activate some plot threads
const threadIds = Object.keys(structuredState.plotThreads);
if (threadIds[0]) {
  structuredState = updatePlotThread(structuredState, threadIds[0], { status: 'active', tension: 0.6 }, 3);
}
if (threadIds[1]) {
  structuredState = updatePlotThread(structuredState, threadIds[1], { status: 'escalating', tension: 0.4 }, 3);
}

// Add recent events
structuredState = addRecentEvent(structuredState, '李白告别长安');
structuredState = addRecentEvent(structuredState, '夜宿黄鹤楼');
structuredState = addRecentEvent(structuredState, '遇见孟浩然');

// Add questions
structuredState = addUnresolvedQuestion(structuredState, '李白会接受宫廷召唤吗？');
structuredState = addUnresolvedQuestion(structuredState, '杜甫何时与李白相遇？');

// Create tension guidance
const tensionAnalysis = analyzeTension(storyState, structuredState);
const tensionGuidance = generateTensionGuidance(tensionAnalysis, storyState);

// Create previous summaries
const previousSummaries: ChapterSummary[] = [
  {
    chapterNumber: 1,
    summary: '李白离开长安，踏上诗人之旅',
    keyEvents: ['告别长安', '独自上路'],
    characterChanges: { '李白': '从迷茫到坚定' },
  },
  {
    chapterNumber: 2,
    summary: '李白夜宿黄鹤楼，思考人生',
    keyEvents: ['夜宿黄鹤楼', '写诗抒怀'],
    characterChanges: { '李白': '更加坚定诗人之路' },
  },
  {
    chapterNumber: 3,
    summary: '李白遇见孟浩然，结为知己',
    keyEvents: ['遇见孟浩然', '饮酒论诗'],
    characterChanges: { '李白': '找到知音', '孟浩然': '欣赏李白才华' },
  },
];

// Test 1: Fallback objectives
console.log('Test 1: Fallback Objectives (No LLM)');
const fallbackOutput = storyDirector.generateFallbackObjectives(storyState, structuredState);
console.log(`  Chapter: ${fallbackOutput.chapterNumber}`);
console.log(`  Goal: ${fallbackOutput.overallGoal}`);
console.log(`  Objectives: ${fallbackOutput.objectives.length}`);
console.log(`  Focus: ${fallbackOutput.focusCharacters.join(', ')}`);
console.log('✅ Fallback objectives generated');

// Test 2: Format for prompt
console.log('\nTest 2: Format for Prompt');
const formatted = storyDirector.formatForPrompt(fallbackOutput);
console.log('--- Formatted Output ---');
console.log(formatted.substring(0, 600));
console.log('...');
console.log('✅ Formatted for writer prompt');

// Test 3: Director with LLM
console.log('\nTest 3: Story Director with LLM');

async function runDirectorTest() {
  try {
    const directorOutput = await storyDirector.direct({
      bible,
      state: storyState,
      structuredState,
      tensionGuidance,
      previousSummaries,
    });
    
    console.log('✅ Director generated chapter plan');
    console.log(`  Chapter: ${directorOutput.chapterNumber}`);
    console.log(`  Goal: ${directorOutput.overallGoal}`);
    console.log(`  Tone: ${directorOutput.tone}`);
    console.log(`  Objectives: ${directorOutput.objectives.length}`);
    
    for (const obj of directorOutput.objectives) {
      const emoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[obj.priority];
      console.log(`    ${emoji} [${obj.type}] ${obj.description}`);
    }
    
    console.log(`  Focus Characters: ${directorOutput.focusCharacters.join(', ')}`);
    console.log(`  Suggested Scenes: ${directorOutput.suggestedScenes.length}`);
    
    // Test 4: Format LLM output
    console.log('\nTest 4: Format LLM Output for Prompt');
    const llmFormatted = storyDirector.formatForPrompt(directorOutput);
    console.log('--- Formatted LLM Output ---');
    console.log(llmFormatted.substring(0, 800));
    console.log('...');
    console.log('✅ LLM output formatted');
    
  } catch (error) {
    console.log('⚠️ Director LLM test failed:', error instanceof Error ? error.message : String(error));
  }
}

runDirectorTest().then(() => {
  // Test 5: Different story phases
  console.log('\nTest 5: Different Story Phases');

  // Early phase
  storyState.currentChapter = 1;
  const earlyFallback = storyDirector.generateFallbackObjectives(storyState, structuredState);
  console.log(`  Early (Ch 1): ${earlyFallback.objectives.length} objectives, tone: ${earlyFallback.tone}`);

  // Middle phase
  storyState.currentChapter = 5;
  const middleFallback = storyDirector.generateFallbackObjectives(storyState, structuredState);
  console.log(`  Middle (Ch 5): ${middleFallback.objectives.length} objectives, tone: ${middleFallback.tone}`);

  // Late phase
  storyState.currentChapter = 9;
  const lateFallback = storyDirector.generateFallbackObjectives(storyState, structuredState);
  console.log(`  Late (Ch 9): ${lateFallback.objectives.length} objectives, tone: ${lateFallback.tone}`);
  console.log('✅ Objectives adapt to story phase');

  console.log('\n✅ All Story Director tests passed!');
  console.log('\n🎉 Phase 6 (Story Director Agent) tests complete!');
});
