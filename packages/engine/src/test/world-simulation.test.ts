import { describe, it, expect } from 'vitest';
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

describe('World Simulation Layer (Phase 8)', () => {
  const createTestBible = () => {
    let bible = createStoryBible(
      '江湖恩仇录',
      '武侠复仇与救赎',
      'wuxia',
      '明朝江南',
      '悲壮苍凉',
      '少年侠客为父报仇，在江湖中经历恩怨情仇，最终领悟武道真谛',
      10
    );
    bible = addCharacter(bible, '林云', 'protagonist', ['坚毅', '正直', '冲动'], ['为父报仇', '成为大侠']);
    bible = addCharacter(bible, '血手人屠', 'antagonist', ['阴险', '残忍', '多疑'], ['巩固势力', '消灭威胁']);
    return bible;
  };

  it('should create character agents', () => {
    const bible = createTestBible();
    const structuredState = initializeCharactersFromBible(
      createStructuredState('test-story'),
      bible
    );

    const charNames = Object.keys(structuredState.characters);
    expect(charNames.length).toBeGreaterThan(0);

    const agent = characterAgentSystem.createAgent(
      structuredState.characters[charNames[0]],
      ['坚毅', '正直', '冲动']
    );

    expect(agent.name).toBeTruthy();
    expect(agent.goals).toBeInstanceOf(Array);
    expect(agent.personality).toBeInstanceOf(Array);
  });

  it('should manage character agenda', () => {
    const bible = createTestBible();
    const structuredState = initializeCharactersFromBible(createStructuredState('test-story'), bible);
    const agent = characterAgentSystem.createAgent(structuredState.characters[Object.keys(structuredState.characters)[0]], ['坚毅']);

    let agentWithAgenda = characterAgentSystem.addAgendaItem(agent, '寻找仇人线索', 9, 3);
    agentWithAgenda = characterAgentSystem.addAgendaItem(agentWithAgenda, '提升武功', 7);
    agentWithAgenda = characterAgentSystem.addAgendaItem(agentWithAgenda, '救助无辜', 5);

    expect(agentWithAgenda.agenda.length).toBe(3);
    const topPriority = agentWithAgenda.agenda.sort((a, b) => b.priority - a.priority)[0];
    expect(topPriority.action).toBe('寻找仇人线索');
  });

  it('should track knowledge and relationships', () => {
    const bible = createTestBible();
    const structuredState = initializeCharactersFromBible(createStructuredState('test-story'), bible);
    const agent = characterAgentSystem.createAgent(structuredState.characters[Object.keys(structuredState.characters)[0]], ['坚毅']);

    let knowledgeableAgent = characterAgentSystem.addKnowledge(agent, '仇人住在黑木崖');
    knowledgeableAgent = characterAgentSystem.addKnowledge(knowledgeableAgent, '师父是隐世高手');
    knowledgeableAgent = characterAgentSystem.updateRelationship(knowledgeableAgent, '师父', '尊敬');
    knowledgeableAgent = characterAgentSystem.updateRelationship(knowledgeableAgent, '仇人', '仇恨');

    expect(knowledgeableAgent.knowledge.length).toBe(2);
    expect(Object.keys(knowledgeableAgent.relationships).length).toBe(2);
    expect(knowledgeableAgent.relationships['师父']).toBe('尊敬');
  });

  it('should generate simple decisions', () => {
    const protagonist: CharacterAgent = {
      name: '主角',
      goals: ['为父报仇', '成为大侠'],
      currentGoal: '为父报仇',
      location: '江南小镇',
      knowledge: ['仇人住在黑木崖'],
      relationships: { '仇人': '仇恨' },
      personality: ['坚毅', '正直', '冲动'],
      emotionalState: '愤怒',
      inventory: [],
      agenda: [],
    };

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
      character: protagonist,
      otherCharacters: [villain],
      worldEvents: ['江湖传闻主角在寻找仇人'],
      currentChapter: 2,
      storyContext: '主角正在追查杀父仇人',
    };

    const decision = characterAgentSystem.getSimpleDecision(context);

    expect(decision.action).toBeTruthy();
    expect(decision.reasoning).toBeTruthy();
    expect(decision.consequences).toBeInstanceOf(Array);
  });

  it('should initialize world state manager', () => {
    const world = createWorldStateManager('test-story');
    
    const agent1: CharacterAgent = {
      name: '主角', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: [], emotionalState: '', inventory: [], agenda: []
    };
    const agent2: CharacterAgent = {
      name: '仇人', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: [], emotionalState: '', inventory: [], agenda: []
    };

    world.initialize('江南小镇', [agent1, agent2]);

    expect(world.getState().locations.size).toBeGreaterThan(0);
    expect(world.getState().characters.size).toBe(2);
  });

  it('should manage locations', () => {
    const world = createWorldStateManager('test-story');
    const agent: CharacterAgent = { name: '主角', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: [], emotionalState: '', inventory: [], agenda: [] };
    world.initialize('江南小镇', [agent]);

    world.addLocation('loc-forest', '黑森林', '阴森茂密的森林，传说有强盗出没', ['loc-start']);
    world.addLocation('loc-cliff', '黑木崖', '悬崖上的山寨，仇人老巢', ['loc-forest']);
    world.connectLocations('loc-start', 'loc-forest');

    expect(world.getState().locations.size).toBe(3);
  });

  it('should move characters between locations', () => {
    const world = createWorldStateManager('test-story');
    const agent: CharacterAgent = { name: '主角', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: [], emotionalState: '', inventory: [], agenda: [] };
    world.initialize('江南小镇', [agent]);
    world.addLocation('loc-forest', '黑森林', '阴森森林', ['loc-start']);

    const moved = world.moveCharacter('主角', 'loc-forest');
    expect(moved).toBe(true);

    const location = world.getCharacterLocation('主角');
    expect(location?.name).toBe('黑森林');

    const charactersThere = world.getCharactersAtLocation('loc-forest');
    expect(charactersThere.some(c => c.name === '主角')).toBe(true);
  });

  it('should resolve decisions into events', () => {
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

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty('type');
    expect(events[0]).toHaveProperty('description');
  });

  it('should process events into resolutions', () => {
    const decisions: CharacterDecision[] = [
      { character: '主角', action: '攻击', target: '仇人', reasoning: '复仇', consequences: ['受伤'] },
    ];
    const events = eventResolver.resolveDecisions(decisions, 2);

    const protagonist: CharacterAgent = { name: '主角', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: [], emotionalState: '', inventory: [], agenda: [] };
    const villain: CharacterAgent = { name: '仇人', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: [], emotionalState: '', inventory: [], agenda: [] };
    
    const agents = new Map<string, CharacterAgent>();
    agents.set('主角', protagonist);
    agents.set('仇人', villain);

    const resolutions = eventResolver.processEvents(events, agents);

    expect(resolutions.length).toBeGreaterThan(0);
    expect(resolutions[0]).toHaveProperty('outcome');
    expect(resolutions[0]).toHaveProperty('consequences');
  });

  it('should generate world summary', () => {
    const world = createWorldStateManager('test-story');
    const agent: CharacterAgent = { name: '主角', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: [], emotionalState: '', inventory: [], agenda: [] };
    world.initialize('江南小镇', [agent]);

    world.advanceChapter();
    const summary = world.getSummary();

    expect(summary).toBeTruthy();
    expect(summary.length).toBeGreaterThan(0);
  });

  it('should serialize and load world state', () => {
    const world = createWorldStateManager('test-story');
    const agent: CharacterAgent = { name: '主角', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: [], emotionalState: '', inventory: [], agenda: [] };
    world.initialize('江南小镇', [agent]);
    world.advanceChapter();

    const serialized = world.serialize();
    const world2 = createWorldStateManager('test-story');
    world2.load(serialized);

    expect(world2.getState().currentChapter).toBe(world.getState().currentChapter);
    expect(world2.getState().locations.size).toBe(world.getState().locations.size);
  });

  it('should simulate turn without LLM', async () => {
    const protagonist: CharacterAgent = {
      name: '主角', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: ['坚毅'], emotionalState: '愤怒', inventory: [], agenda: []
    };
    const villain: CharacterAgent = {
      name: '仇人', goals: [], currentGoal: '', location: '', knowledge: [], relationships: {}, personality: ['阴险'], emotionalState: '警惕', inventory: [], agenda: []
    };
    const allAgents = [protagonist, villain];

    const decisions = await characterAgentSystem.simulateTurn(
      allAgents,
      ['主角进入黑森林', '仇人收到密报'],
      3,
      '主角接近仇人老巢',
      false // no LLM
    );

    expect(decisions.length).toBe(2);
    expect(decisions[0]).toHaveProperty('character');
    expect(decisions[0]).toHaveProperty('action');
  });
});
