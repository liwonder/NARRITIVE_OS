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
  createCanonStore,
  addFact,
  formatCanonForPrompt,
  extractCanonFromBible,
  createStoryBible,
  addCharacter,
  addPlotThread,
  canonValidator,
} from '../index.js';
import type { CanonStore, StoryBible } from '../index.js';

async function testCanonMemory() {
  console.log('Testing Canon Memory System (Phase 2)...\n');

  // Test 1: Canon Store Creation
  console.log('Test 1: Canon Store Creation');
  const canon = createCanonStore('test-story-123');
  console.log('✅ Canon store created');

  // Test 2: Adding Facts
  console.log('\nTest 2: Adding Facts');
  let canonWithFacts = addFact(canon, { category: 'character', subject: '李白', attribute: '职业', value: '诗人', chapterEstablished: 1 });
  canonWithFacts = addFact(canonWithFacts, { category: 'character', subject: '李白', attribute: '朝代', value: '唐朝', chapterEstablished: 1 });
  canonWithFacts = addFact(canonWithFacts, { category: 'world', subject: '长安', attribute: '地位', value: '唐朝都城', chapterEstablished: 1 });
  canonWithFacts = addFact(canonWithFacts, { category: 'plot', subject: '主线', attribute: '目标', value: '寻找人生真谛', chapterEstablished: 1 });
  console.log(`✅ Added ${canonWithFacts.facts.length} facts`);
  
  // Use the updated canon for subsequent tests
  Object.assign(canon, canonWithFacts);

  // Test 3: Format Canon for Prompt
  console.log('\nTest 3: Format Canon for Prompt');
  const formatted = formatCanonForPrompt(canon);
  console.log('Formatted canon:');
  console.log(formatted);
  console.log('✅ Canon formatted successfully');

  // Test 4: Extract Canon from Bible
  console.log('\nTest 4: Extract Canon from StoryBible');
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
  console.log(`✅ Extracted ${extractedCanon.facts.length} facts from bible`);
  console.log('Extracted facts:');
  extractedCanon.facts.forEach(f => {
    console.log(`  - ${f.category}: ${f.subject} / ${f.attribute} = ${f.value}`);
  });

  // Test 5: Canon Validation
  console.log('\nTest 5: Canon Validation');
  const testContent = `
杜甫是唐朝著名的诗人，被称为"诗圣"。
他生活在安史之乱时期，目睹了唐朝的衰落。
杜甫非常关心百姓疾苦，写下了许多反映社会现实的诗篇。
`;

  const validation = await canonValidator.validate(testContent, extractedCanon);
  console.log(`✅ Validation complete`);
  console.log(`Violations found: ${validation.violations.length}`);
  if (validation.violations.length > 0) {
    console.log('Violations:');
    validation.violations.forEach(v => console.log(`  - ${v}`));
  }

  // Test 6: Canon Serialization
  console.log('\nTest 6: Canon Serialization');
  const serialized = JSON.stringify(canon, null, 2);
  const deserialized: CanonStore = JSON.parse(serialized);
  console.log(`✅ Serialization round-trip successful`);
  console.log(`Original facts: ${canon.facts.length}, Deserialized: ${deserialized.facts.length}`);

  console.log('\n✅ All Canon Memory tests passed!');
}

// Test 7: Detect Contradiction
async function testContradictionDetection() {
  console.log('\n--- Testing Contradiction Detection ---\n');

  let canon = createCanonStore('contradiction-test');
  canon = addFact(canon, { category: 'character', subject: '李白', attribute: '状态', value: '活着', chapterEstablished: 1 });
  canon = addFact(canon, { category: 'world', subject: '唐朝', attribute: '时期', value: '盛世', chapterEstablished: 1 });

  // Content that contradicts canon
  const contradictingContent = `
李白已经去世多年，他的诗歌流传千古。
唐朝正处于战乱之中，百姓流离失所。
`;

  console.log('Canon facts:');
  canon.facts.forEach(f => console.log(`  - ${f.subject}: ${f.attribute} = ${f.value}`));

  console.log('\nContent to validate:');
  console.log(contradictingContent);

  const validation = await canonValidator.validate(contradictingContent, canon);
  console.log(`\nViolations detected: ${validation.violations.length}`);
  validation.violations.forEach(v => console.log(`  ⚠️  ${v}`));
}

testCanonMemory()
  .then(() => testContradictionDetection())
  .then(() => {
    console.log('\n🎉 Phase 2 (Canon Memory) tests complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
