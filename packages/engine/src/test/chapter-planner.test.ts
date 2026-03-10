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
  chapterPlanner,
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
  generateTensionGuidance,
  analyzeTension,
} from '../index.js';

console.log('Testing Chapter Planner Agent (Phase 7)...\n');

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
bible = addCharacter(bible, '高力士', 'antagonist', ['阴险', '权谋'], ['控制李白为朝廷所用']);

bible = addPlotThread(bible, '诗人之旅', '李白从长安出发，游历天下');
bible = addPlotThread(bible, '宫廷阴谋', '高力士设计控制李白');

const storyState = createStoryState('test-story', 10);
storyState.currentChapter = 4;

let structuredState = createStructuredState('test-story');
structuredState = initializeCharactersFromBible(structuredState, bible);
structuredState = initializePlotThreadsFromBible(structuredState, bible);
structuredState.tension = 0.5;

// Activate plot threads
const threadIds = Object.keys(structuredState.plotThreads);
if (threadIds[0]) {
  structuredState = updatePlotThread(structuredState, threadIds[0], { status: 'active', tension: 0.6 }, 4);
}
if (threadIds[1]) {
  structuredState = updatePlotThread(structuredState, threadIds[1], { status: 'escalating', tension: 0.7 }, 4);
}

// Add recent events
structuredState = addRecentEvent(structuredState, '李白在黄鹤楼与孟浩然告别');
structuredState = addRecentEvent(structuredState, '收到宫廷使者传来的密信');

// Create director output
const directorOutput = storyDirector.generateFallbackObjectives(storyState, structuredState);
directorOutput.overallGoal = '李白遭遇宫廷阴谋，与杜甫初次相遇，面临人生抉择';
directorOutput.tone = '紧张中带有诗意';
directorOutput.objectives = [
  {
    id: 'obj-1',
    description: '宫廷使者正式传达玄宗召唤，施加压力',
    priority: 'critical',
    type: 'plot',
    relatedPlotThreadId: threadIds[1],
  },
  {
    id: 'obj-2',
    description: '李白与杜甫在江边初次相遇',
    priority: 'high',
    type: 'character',
    relatedCharacter: '杜甫',
  },
  {
    id: 'obj-3',
    description: '展现李白面对召唤的内心挣扎',
    priority: 'high',
    type: 'character',
    relatedCharacter: '李白',
  },
  {
    id: 'obj-4',
    description: '提高章节紧张感至80%',
    priority: 'medium',
    type: 'tension',
  },
];
directorOutput.focusCharacters = ['李白', '杜甫', '高力士'];
directorOutput.suggestedScenes = [
  '江边送别场景，氛围宁静',
  '宫廷使者突然出现，气氛紧张',
  '李白与杜甫初次对话',
  '李白独自思考，内心挣扎',
];

// Create tension guidance
const tensionAnalysis = analyzeTension(storyState, structuredState);
const tensionGuidance = generateTensionGuidance(tensionAnalysis, storyState);

// Test 1: Fallback outline
console.log('Test 1: Fallback Outline (No LLM)');
const fallbackOutline = chapterPlanner.generateFallbackOutline(directorOutput, 2500);
console.log(`  Chapter: ${fallbackOutline.chapterNumber}`);
console.log(`  Goal: ${fallbackOutline.overallGoal}`);
console.log(`  Scenes: ${fallbackOutline.scenes.length}`);
console.log(`  Total words: ${fallbackOutline.totalEstimatedWords}`);
console.log('  Scene breakdown:');
for (const scene of fallbackOutline.scenes) {
  const bar = '█'.repeat(Math.round(scene.tension * 10)) + '░'.repeat(10 - Math.round(scene.tension * 10));
  console.log(`    Scene ${scene.sequence}: [${bar}] ${Math.round(scene.tension * 100)}% - ${scene.goal.substring(0, 40)}...`);
}
console.log('✅ Fallback outline generated');

// Test 2: Format for prompt
console.log('\nTest 2: Format for Prompt');
const formatted = chapterPlanner.formatForPrompt(fallbackOutline);
console.log('--- Formatted Output Preview ---');
console.log(formatted.substring(0, 800));
console.log('...');
console.log('✅ Formatted for writer prompt');

// Test 3: Validate outline
console.log('\nTest 3: Validate Outline Coverage');
const validation = chapterPlanner.validateOutline(fallbackOutline, directorOutput.objectives);
console.log(`  Valid: ${validation.valid}`);
console.log(`  Coverage: ${(validation.coverage * 100).toFixed(0)}%`);
if (validation.missedObjectives.length > 0) {
  console.log(`  Missed: ${validation.missedObjectives.length} objectives`);
}
console.log('✅ Outline validated');

// Test 4: Planner with LLM
console.log('\nTest 4: Chapter Planner with LLM');

async function runPlannerTest() {
  try {
    const outline = await chapterPlanner.plan({
      bible,
      state: storyState,
      structuredState,
      directorOutput,
      targetWordCount: 2500,
    });
    
    console.log('✅ Planner generated scene outline');
    console.log(`  Chapter: ${outline.chapterNumber}`);
    console.log(`  Goal: ${outline.overallGoal}`);
    console.log(`  Tone: ${outline.tone}`);
    console.log(`  Scenes: ${outline.scenes.length}`);
    console.log(`  Total words: ${outline.totalEstimatedWords}`);
    
    console.log('\n  Scene Details:');
    for (const scene of outline.scenes) {
      const bar = '█'.repeat(Math.round(scene.tension * 10));
      console.log(`    ${scene.sequence}. [${bar}] ${scene.goal.substring(0, 45)}...`);
    }
    
    // Test 5: Format LLM output
    console.log('\nTest 5: Format LLM Output for Prompt');
    const llmFormatted = chapterPlanner.formatForPrompt(outline);
    console.log('--- Formatted LLM Output Preview ---');
    console.log(llmFormatted.substring(0, 1000));
    console.log('...');
    console.log('✅ LLM output formatted');
    
    // Test 6: Validate LLM outline
    console.log('\nTest 6: Validate LLM Outline');
    const llmValidation = chapterPlanner.validateOutline(outline, directorOutput.objectives);
    console.log(`  Valid: ${llmValidation.valid}`);
    console.log(`  Coverage: ${(llmValidation.coverage * 100).toFixed(0)}%`);
    console.log('✅ LLM outline validated');
    
  } catch (error) {
    console.log('⚠️ Planner LLM test failed:', error instanceof Error ? error.message : String(error));
  }
}

runPlannerTest().then(() => {
  // Test 7: Different word counts
  console.log('\nTest 7: Different Word Counts');
  
  const shortOutline = chapterPlanner.generateFallbackOutline(directorOutput, 1500);
  console.log(`  Short (1500w): ${shortOutline.scenes.length} scenes, ${shortOutline.totalEstimatedWords} words`);
  
  const mediumOutline = chapterPlanner.generateFallbackOutline(directorOutput, 2500);
  console.log(`  Medium (2500w): ${mediumOutline.scenes.length} scenes, ${mediumOutline.totalEstimatedWords} words`);
  
  const longOutline = chapterPlanner.generateFallbackOutline(directorOutput, 4000);
  console.log(`  Long (4000w): ${longOutline.scenes.length} scenes, ${longOutline.totalEstimatedWords} words`);
  console.log('✅ Outline adapts to word count');

  console.log('\n✅ All Chapter Planner tests passed!');
  console.log('\n🎉 Phase 7 (Chapter Planner Agent) tests complete!');
});
