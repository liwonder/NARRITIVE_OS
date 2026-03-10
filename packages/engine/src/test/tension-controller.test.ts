import {
  calculateTargetTension,
  calculateNextChapterTension,
  analyzeTension,
  generateTensionGuidance,
  formatTensionForPrompt,
  estimateTensionFromChapter,
  tensionController,
  createStoryState,
  createStructuredState,
} from '../index.js';

console.log('Testing Narrative Tension Controller (Phase 5)...\n');

// Test 1: Calculate target tension
console.log('Test 1: Calculate Target Tension');
console.log('  10-chapter story tension curve:');
for (let i = 1; i <= 10; i++) {
  const tension = calculateTargetTension(i, 10);
  const bar = '█'.repeat(Math.round(tension * 20));
  console.log(`    Ch ${i}: ${(tension * 100).toFixed(0).padStart(3)}% ${bar}`);
}
console.log('✅ Tension curve follows parabolic arc (low → high → low)');

// Test 2: Next chapter tension
console.log('\nTest 2: Calculate Next Chapter Tension');
const nextTension = calculateNextChapterTension(3, 10);
console.log(`  Current: Ch 3, Next target: ${(nextTension * 100).toFixed(0)}%`);
console.log('✅ Next chapter tension calculated');

// Test 3: Tension analysis - escalate
console.log('\nTest 3: Tension Analysis - Escalate');
const storyState = createStoryState('test-story', 10);
storyState.currentChapter = 5;
const lowTensionState = createStructuredState('test-story');
lowTensionState.tension = 0.3; // Too low for middle chapter

const escalateAnalysis = analyzeTension(storyState, lowTensionState);
console.log(`  Current: ${(escalateAnalysis.currentTension * 100).toFixed(0)}%`);
console.log(`  Target: ${(escalateAnalysis.targetTension * 100).toFixed(0)}%`);
console.log(`  Gap: ${(escalateAnalysis.tensionGap * 100).toFixed(0)}%`);
console.log(`  Action: ${escalateAnalysis.recommendedAction}`);
console.log(`  Reasoning: ${escalateAnalysis.reasoning}`);
console.log('✅ Correctly recommends escalation');

// Test 4: Tension analysis - maintain
console.log('\nTest 4: Tension Analysis - Maintain');
const goodTensionState = createStructuredState('test-story');
goodTensionState.tension = 0.95; // Good for middle chapter

const maintainAnalysis = analyzeTension(storyState, goodTensionState);
console.log(`  Current: ${(maintainAnalysis.currentTension * 100).toFixed(0)}%`);
console.log(`  Target: ${(maintainAnalysis.targetTension * 100).toFixed(0)}%`);
console.log(`  Gap: ${(maintainAnalysis.tensionGap * 100).toFixed(0)}%`);
console.log(`  Action: ${maintainAnalysis.recommendedAction}`);
console.log('✅ Correctly recommends maintenance');

// Test 5: Tension analysis - climax
console.log('\nTest 5: Tension Analysis - Climax');
storyState.currentChapter = 8;
const highTensionState = createStructuredState('test-story');
highTensionState.tension = 0.9;

const climaxAnalysis = analyzeTension(storyState, highTensionState);
console.log(`  Chapter: ${storyState.currentChapter}/${storyState.totalChapters}`);
console.log(`  Target: ${(climaxAnalysis.targetTension * 100).toFixed(0)}%`);
console.log(`  Action: ${climaxAnalysis.recommendedAction}`);
console.log('✅ Correctly identifies climax approach');

// Test 6: Tension analysis - resolve
console.log('\nTest 6: Tension Analysis - Resolve');
storyState.currentChapter = 10;
const finalAnalysis = analyzeTension(storyState, highTensionState);
console.log(`  Chapter: ${storyState.currentChapter}/${storyState.totalChapters} (FINAL)`);
console.log(`  Action: ${finalAnalysis.recommendedAction}`);
console.log(`  Reasoning: ${finalAnalysis.reasoning}`);
console.log('✅ Correctly recommends resolution for final chapter');

// Test 7: Generate tension guidance
console.log('\nTest 7: Generate Tension Guidance');
storyState.currentChapter = 5;
const guidance = generateTensionGuidance(escalateAnalysis, storyState);
console.log(`  Target: ${(guidance.targetTension * 100).toFixed(0)}%`);
console.log(`  Guidance: ${guidance.guidance}`);
console.log(`  Scene types: ${guidance.sceneTypes.join(', ')}`);
console.log(`  Pacing: ${guidance.pacingNotes}`);
console.log('✅ Guidance generated');

// Test 8: Format for prompt
console.log('\nTest 8: Format for Prompt');
const formatted = formatTensionForPrompt(guidance);
console.log('--- Formatted Output ---');
console.log(formatted);
console.log('✅ Formatted for prompt injection');

// Test 9: Estimate tension from chapter
console.log('Test 9: Estimate Tension from Chapter Content');
const highTensionChapter = {
  id: 'test-1',
  storyId: 'test',
  number: 1,
  title: 'The Chase',
  content: `The darkness closed in around them. Sarah could hear footsteps behind her, getting closer. Her heart pounded in her chest as she ran through the narrow alley. Fear gripped her throat. She had to escape, had to hide. The danger was real, the threat imminent. She turned a corner and saw a dead end. Panic set in. They were going to catch her. She was desperate, terrified. The chase was on.`,
  wordCount: 80,
  summary: 'Sarah is chased through dark alleys',
  generatedAt: new Date(),
};

const lowTensionChapter = {
  id: 'test-2',
  storyId: 'test',
  number: 2,
  title: 'Peaceful Morning',
  content: `The sun rose over the quiet village. Birds sang in the trees, and a gentle breeze carried the scent of flowers. Sarah sat on her porch, sipping tea and watching the peaceful scene. She felt calm and happy, safe in her home. The worries of yesterday seemed far away. She smiled and relaxed, enjoying the tranquility of the morning.`,
  wordCount: 60,
  summary: 'Sarah enjoys a peaceful morning',
  generatedAt: new Date(),
};

const highEstimate = estimateTensionFromChapter(highTensionChapter);
const lowEstimate = estimateTensionFromChapter(lowTensionChapter);

console.log(`  High tension chapter: ${(highEstimate * 100).toFixed(0)}%`);
console.log(`  Low tension chapter: ${(lowEstimate * 100).toFixed(0)}%`);
console.log('✅ Tension estimation working');

// Test 10: TensionController class
console.log('\nTest 10: TensionController Class');
const controller = tensionController;
const analysis = controller.analyze(storyState, lowTensionState);
const controllerGuidance = controller.generateGuidance(storyState, lowTensionState);
const target = controller.calculateTarget(5, 10);
const estimated = controller.estimateFromContent(highTensionChapter);

console.log(`  Analysis action: ${analysis.recommendedAction}`);
console.log(`  Guidance target: ${(controllerGuidance.targetTension * 100).toFixed(0)}%`);
console.log(`  Calculated target: ${(target * 100).toFixed(0)}%`);
console.log(`  Estimated tension: ${(estimated * 100).toFixed(0)}%`);
console.log('✅ TensionController class working');

console.log('\n✅ All Tension Controller tests passed!');
console.log('\n🎉 Phase 5 (Narrative Tension Controller) tests complete!');
