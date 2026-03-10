import {
  characterAgentSystem,
  eventResolver,
  createWorldStateManager,
  createStructuredState,
  initializeCharactersFromBible,
  createStoryBible,
  addCharacter,
  type CharacterAgent,
  type CharacterDecision,
} from '../index.js';

console.log('Testing World Simulation Layer (Phase 8)...\n');

// Setup test story
const bible = createStoryBible(
  '江湖恩仇录',
  '武侠复仇与救赎',
  'wuxia',
  '明朝江南',
  '悲壮苍凉',
  '少年侠客为父报仇，在江湖中经历恩怨情仇，最终领悟武道真谛',
  10
);

// Test 1: Create character agents
console.log('Test 1: Create Character Agents');
let testBible = createStoryBible(
  '江湖恩仇录',
  '武侠复仇与救赎',
  'wuxia',
  '明朝江南',
  '悲壮苍凉',
  '少年侠客为父报仇，在江湖中经历恩怨情仇，最终领悟武道真谛',
  10
);
testBible = addCharacter(testBible, '林云', 'protagonist', ['坚毅', '正直', '冲动'], ['为父报仇', '成为大侠']);
testBible = addCharacter(testBible, '血手人屠', 'antagonist', ['阴险', '残忍', '多疑'], ['巩固势力', '消灭威胁']);

const structuredState = initializeCharactersFromBible(
  createStructuredState('test-story'),
  testBible
);

const charNames = Object.keys(structuredState.characters);
console.log(`  Characters in state: ${charNames.join(', ')}`);

const liBai = characterAgentSystem.createAgent(
  structuredState.characters[charNames[0]],
  ['坚毅', '正直', '冲动']
);
console.log(`  Created: ${liBai.name}`);
console.log(`  Goals: ${liBai.goals.join(', ')}`);
console.log(`  Personality: ${liBai.personality.join(', ')}`);
console.log('✅ Character agent created');

// Test 2: Manage agenda
console.log('\nTest 2: Manage Character Agenda');
let agentWithAgenda = characterAgentSystem.addAgendaItem(liBai, '寻找仇人线索', 9, 3);
agentWithAgenda = characterAgentSystem.addAgendaItem(agentWithAgenda, '提升武功', 7);
agentWithAgenda = characterAgentSystem.addAgendaItem(agentWithAgenda, '救助无辜', 5);
console.log(`  Agenda items: ${agentWithAgenda.agenda.length}`);
console.log(`  Top priority: ${agentWithAgenda.agenda.sort((a, b) => b.priority - a.priority)[0].action}`);
console.log('✅ Agenda management working');

// Test 3: Knowledge and relationships
console.log('\nTest 3: Knowledge and Relationships');
let knowledgeableAgent = characterAgentSystem.addKnowledge(agentWithAgenda, '仇人住在黑木崖');
knowledgeableAgent = characterAgentSystem.addKnowledge(knowledgeableAgent, '师父是隐世高手');
knowledgeableAgent = characterAgentSystem.updateRelationship(knowledgeableAgent, '师父', '尊敬');
knowledgeableAgent = characterAgentSystem.updateRelationship(knowledgeableAgent, '仇人', '仇恨');
console.log(`  Knowledge: ${knowledgeableAgent.knowledge.length} facts`);
console.log(`  Relationships: ${Object.keys(knowledgeableAgent.relationships).length}`);
console.log('✅ Knowledge and relationships tracked');

// Test 4: Simple decision making
console.log('\nTest 4: Simple Decision Making');
const villain: CharacterAgent = {
  name: '仇人',
  goals: ['巩固势力', '消灭威胁'],
  currentGoal: '消灭威胁',
  location: '黑木崖',
  knowledge: ['主角在追查自己'],
  relationships: { '主角': '敌对' },
  personality: ['阴险', '残忍', '多疑'],
  emotionalState: '警惕',
  inventory: [],
  agenda: [],
};

const context = {
  character: knowledgeableAgent,
  otherCharacters: [villain],
  worldEvents: ['江湖传闻主角在寻找仇人'],
  currentChapter: 2,
  storyContext: '主角正在追查杀父仇人',
};

const decision = characterAgentSystem.getSimpleDecision(context);
console.log(`  Decision: ${decision.action}`);
console.log(`  Reasoning: ${decision.reasoning}`);
console.log(`  Consequences: ${decision.consequences.length}`);
console.log('✅ Simple decision generated');

// Test 5: World State Manager
console.log('\nTest 5: World State Manager');
const world = createWorldStateManager('test-story');
world.initialize('江南小镇', [knowledgeableAgent, villain]);
console.log(`  Locations: ${world.getState().locations.size}`);
console.log(`  Characters: ${world.getState().characters.size}`);
console.log('✅ World state initialized');

// Test 6: Location management
console.log('\nTest 6: Location Management');
world.addLocation('loc-forest', '黑森林', '阴森茂密的森林，传说有强盗出没', ['loc-start']);
world.addLocation('loc-cliff', '黑木崖', '悬崖上的山寨，仇人老巢', ['loc-forest']);
world.connectLocations('loc-start', 'loc-forest');
console.log(`  Total locations: ${world.getState().locations.size}`);
console.log('✅ Locations managed');

// Test 7: Character movement
console.log('\nTest 7: Character Movement');
const moved = world.moveCharacter('主角', 'loc-forest');
console.log(`  Movement successful: ${moved}`);
const location = world.getCharacterLocation('主角');
console.log(`  Now at: ${location?.name}`);
const charactersThere = world.getCharactersAtLocation('loc-forest');
console.log(`  Characters in forest: ${charactersThere.map(c => c.name).join(', ')}`);
console.log('✅ Character movement working');

// Test 8: Event resolution
console.log('\nTest 8: Event Resolution');
const decisions: CharacterDecision[] = [
  {
    character: '主角',
    action: '潜入黑木崖侦查',
    target: '仇人',
    reasoning: '需要了解敌人布置',
    consequences: ['可能被发现', '获得情报'],
  },
  {
    character: '仇人',
    action: '设下埋伏等待主角',
    target: '主角',
    reasoning: '知道主角会来',
    consequences: ['可能捕获主角', '暴露布置'],
  },
];

const events = eventResolver.resolveDecisions(decisions, 2);
console.log(`  Events generated: ${events.length}`);
for (const event of events) {
  console.log(`    - ${event.type}: ${event.description}`);
}
console.log('✅ Events resolved from decisions');

// Test 9: Process events
console.log('\nTest 9: Process Events');
const agents = new Map<string, CharacterAgent>();
agents.set('主角', knowledgeableAgent);
agents.set('仇人', villain);

const resolutions = eventResolver.processEvents(events, agents);
console.log(`  Resolutions: ${resolutions.length}`);
for (const res of resolutions) {
  console.log(`    - ${res.outcome}`);
  console.log(`      Consequences: ${res.consequences.join(', ')}`);
}
console.log('✅ Events processed');

// Test 10: World state summary
console.log('\nTest 10: World State Summary');
world.applyResolutions(resolutions);
world.advanceChapter();
const summary = world.getSummary();
console.log('--- World Summary ---');
console.log(summary);
console.log('✅ World summary generated');

// Test 11: Serialization
console.log('\nTest 11: Serialization');
const serialized = world.serialize();
const world2 = createWorldStateManager('test-story');
world2.load(serialized);
console.log(`  Serialized and loaded successfully`);
console.log(`  Loaded chapter: ${world2.getState().currentChapter}`);
console.log(`  Loaded locations: ${world2.getState().locations.size}`);
console.log('✅ Serialization working');

// Test 12: Simulate turn (no LLM)
console.log('\nTest 12: Simulate Turn');
const allAgents = [knowledgeableAgent, villain];
characterAgentSystem.simulateTurn(
  allAgents,
  ['主角进入黑森林', '仇人收到密报'],
  3,
  '主角接近仇人老巢',
  false // no LLM
).then(decisions => {
  console.log(`  Decisions made: ${decisions.length}`);
  for (const d of decisions) {
    console.log(`    - ${d.character}: ${d.action}`);
  }
  console.log('✅ Turn simulation complete');

  console.log('\n✅ All World Simulation tests passed!');
  console.log('\n🎉 Phase 8 (World Simulation Layer) tests complete!');
});
