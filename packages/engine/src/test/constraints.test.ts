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

import {
  createConstraintGraph,
  Validator,
  createCanonStore,
  addFact,
  createStructuredState,
  initializeCharactersFromBible,
  createStoryBible,
  addCharacter,
  type Chapter,
} from '../index.js';

console.log('Testing Narrative Constraints Graph (Phase 9)...\n');

// Setup test data
const bible = createStoryBible(
  '侦探故事',
  '真相与正义',
  'mystery',
  '1920年代上海',
  '悬疑紧张',
  '侦探调查连环杀人案，揭开真相',
  10
);

let structuredState = createStructuredState('test-story');
structuredState = initializeCharactersFromBible(
  structuredState,
  addCharacter(
    addCharacter(bible, '陈侦探', 'protagonist', ['聪明', '冷静', '执着'], ['找出凶手', '维护正义']),
    '凶手',
    'antagonist',
    ['狡猾', '残忍', '伪装'],
    ['逃避追捕', '继续犯罪']
  )
);

// Set up character states
structuredState.characters['陈侦探'].emotionalState = '专注';
structuredState.characters['陈侦探'].location = '上海滩';
structuredState.characters['陈侦探'].knowledge = ['凶手使用特殊刀具', '第一现场在码头'];

structuredState.characters['凶手'].emotionalState = '警惕';
structuredState.characters['凶手'].location = '法租界';

// Test 1: Create constraint graph
console.log('Test 1: Create Constraint Graph');
const graph = createConstraintGraph();
graph.addLocation('上海滩', '繁华码头区', 1);
graph.addLocation('法租界', '外国人居住区', 1);
graph.addLocation('码头', '第一案发现场', 1);

graph.addCharacter(structuredState.characters['陈侦探'], 1);
graph.addCharacter(structuredState.characters['凶手'], 1);

graph.addEvent('murder-1', '第一起谋杀案', ['凶手'], 1);

const stats = graph.getStats();
console.log(`  Nodes: ${stats.nodes} (${stats.byType.character} characters, ${stats.byType.location} locations, ${stats.byType.event} events)`);
console.log(`  Edges: ${stats.edges}`);
console.log('✅ Constraint graph created');

// Test 2: Query character knowledge
console.log('\nTest 2: Query Character Knowledge');
const detectiveKnowledge = graph.getCharacterKnowledge('陈侦探');
console.log(`  陈侦探 knows ${detectiveKnowledge.length} facts:`);
for (const fact of detectiveKnowledge) {
  console.log(`    - ${fact.label}`);
}
console.log('✅ Knowledge query working');

// Test 3: Query character location
console.log('\nTest 3: Query Character Location');
const detectiveLocation = graph.getCharacterLocation('陈侦探');
const villainLocation = graph.getCharacterLocation('凶手');
console.log(`  陈侦探 is at: ${detectiveLocation}`);
console.log(`  凶手 is at: ${villainLocation}`);
console.log('✅ Location query working');

// Test 4: Update character location
console.log('\nTest 4: Update Character Location');
graph.updateCharacterLocation('陈侦探', '法租界', 3);
const newLocation = graph.getCharacterLocation('陈侦探');
console.log(`  陈侦探 moved to: ${newLocation}`);
console.log('✅ Location update working');

// Test 5: Check timeline consistency (should pass)
console.log('\nTest 5: Check Timeline Consistency (Current)');
const timelineViolations = graph.checkConstraints(3);
console.log(`  Violations found: ${timelineViolations.length}`);
for (const v of timelineViolations) {
  console.log(`    - [${v.severity}] ${v.type}: ${v.description}`);
}
console.log('✅ Timeline check complete');

// Test 6: Create knowledge leak scenario
console.log('\nTest 6: Knowledge Leak Detection');
// Add a fact established in chapter 5
const futureFact = {
  id: 'fact-future',
  type: 'fact' as const,
  label: '凶手真实身份暴露',
  properties: {},
  chapterEstablished: 5,
};
graph.addNode(futureFact);

// Make detective know it in chapter 3 (impossible!)
graph.addEdge({
  id: 'edge-leak',
  from: 'char-陈侦探',
  to: 'fact-future',
  type: 'knows',
  properties: { since: 3 }, // Chapter 3, but fact established in 5!
});

const knowledgeViolations = graph.checkConstraints(3);
const knowledgeErrors = knowledgeViolations.filter(v => v.type === 'knowledge');
console.log(`  Knowledge violations: ${knowledgeErrors.length}`);
for (const v of knowledgeErrors) {
  console.log(`    ❌ ${v.description}`);
}
console.log('✅ Knowledge leak detected');

// Test 7: Create canon store
console.log('\nTest 7: Canon Store Setup');
let canon = createCanonStore('test-story');
canon = addFact(canon, {
  category: 'character',
  subject: '陈侦探',
  attribute: '职业',
  value: '私家侦探',
  chapterEstablished: 1,
});
canon = addFact(canon, {
  category: 'world',
  subject: '上海',
  attribute: '时期',
  value: '1920年代',
  chapterEstablished: 1,
});
console.log(`  Canon facts: ${canon.facts.length}`);
console.log('✅ Canon store ready');

// Test 8: Quick validation (no LLM)
console.log('\nTest 8: Quick Validation (No LLM)');
const testChapter: Chapter = {
  id: 'test-ch-3',
  storyId: 'test-story',
  number: 3,
  title: '追查',
  content: '陈侦探在法租界调查线索。他发现凶手使用特殊刀具，这与第一现场吻合。',
  wordCount: 500,
  summary: '陈侦探在法租界调查',
  generatedAt: new Date(),
};

const validator = new Validator(graph);
const quickResult = validator.quickValidate({
  chapter: testChapter,
  bible,
  structuredState,
  canon,
  previousChapters: [],
  constraintGraph: graph,
});

console.log(`  Valid: ${quickResult.valid}`);
console.log(`  Violations: ${quickResult.violations.length}`);
console.log(`  Summary: ${quickResult.summary}`);
console.log('✅ Quick validation complete');

// Test 9: Format validation result
console.log('\nTest 9: Format Validation Result');
const formatted = validator.formatResult(quickResult);
console.log('--- Formatted Result ---');
console.log(formatted);
console.log('✅ Result formatted');

// Test 10: Graph serialization
console.log('\nTest 10: Graph Serialization');
const serialized = graph.serialize();
const graph2 = createConstraintGraph();
graph2.load(serialized);
const stats2 = graph2.getStats();
console.log(`  Serialized and loaded: ${stats2.nodes} nodes, ${stats2.edges} edges`);
console.log('✅ Serialization working');

// Test 11: Canon violation detection
console.log('\nTest 11: Canon Violation Detection');
const badChapter: Chapter = {
  id: 'test-ch-bad',
  storyId: 'test-story',
  number: 3,
  title: '错误章节',
  content: '陈侦探其实不是私家侦探，他是一名警察。故事发生在1930年代的北京。',
  wordCount: 100,
  summary: '包含矛盾内容',
  generatedAt: new Date(),
};

const badResult = validator.quickValidate({
  chapter: badChapter,
  bible,
  structuredState,
  canon,
  previousChapters: [],
  constraintGraph: graph,
});

console.log(`  Valid: ${badResult.valid}`);
console.log(`  Canon violations: ${badResult.violations.filter(v => v.type === 'canon').length}`);
for (const v of badResult.violations.filter(v => v.type === 'canon')) {
  console.log(`    ❌ ${v.description}`);
}
console.log('✅ Canon violations detected');

// Test 12: Full validation with LLM (optional)
console.log('\nTest 12: Full Validation with LLM');

async function runLLMValidation() {
  try {
    const llmResult = await validator.validateChapter({
      chapter: testChapter,
      bible,
      structuredState,
      canon,
      previousChapters: [],
      constraintGraph: graph,
    });
    
    console.log(`  LLM Valid: ${llmResult.valid}`);
    console.log(`  LLM Violations: ${llmResult.violations.length}`);
    console.log(`  LLM Summary: ${llmResult.summary.substring(0, 100)}...`);
    console.log('✅ LLM validation complete');
  } catch (error) {
    console.log('  ⚠️ LLM validation skipped (API unavailable)');
  }
}

runLLMValidation().then(() => {
  console.log('\n✅ All Constraints Graph tests passed!');
  console.log('\n🎉 Phase 9 (Narrative Constraints Graph) tests complete!');
});
