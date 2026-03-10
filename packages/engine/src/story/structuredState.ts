import type { Chapter, ChapterSummary, StoryBible } from '../types/index.js';

export interface CharacterState {
  name: string;
  emotionalState: string;
  location: string;
  relationships: Record<string, string>; // character name -> relationship status
  goals: string[];
  knowledge: string[]; // What this character knows
  development: string[]; // Character arc changes
}

export interface PlotThreadState {
  id: string;
  name: string;
  status: 'dormant' | 'active' | 'escalating' | 'resolved';
  tension: number; // 0.0 to 1.0
  lastChapter: number;
  involvedCharacters: string[];
  summary: string;
}

export interface StoryStructuredState {
  storyId: string;
  chapter: number;
  tension: number; // Overall story tension 0.0 to 1.0
  characters: Record<string, CharacterState>;
  plotThreads: Record<string, PlotThreadState>;
  unresolvedQuestions: string[];
  recentEvents: string[];
}

export function createStructuredState(storyId: string): StoryStructuredState {
  return {
    storyId,
    chapter: 0,
    tension: 0.1, // Start with low tension
    characters: {},
    plotThreads: {},
    unresolvedQuestions: [],
    recentEvents: [],
  };
}

export function initializeCharactersFromBible(
  state: StoryStructuredState,
  bible: StoryBible
): StoryStructuredState {
  const newState = { ...state };
  
  for (const char of bible.characters) {
    newState.characters[char.name] = {
      name: char.name,
      emotionalState: 'neutral',
      location: bible.setting,
      relationships: {},
      goals: [...char.goals],
      knowledge: [],
      development: [],
    };
  }
  
  return newState;
}

export function initializePlotThreadsFromBible(
  state: StoryStructuredState,
  bible: StoryBible
): StoryStructuredState {
  const newState = { ...state };
  
  for (const thread of bible.plotThreads) {
    newState.plotThreads[thread.id] = {
      id: thread.id,
      name: thread.name,
      status: thread.status,
      tension: thread.tension,
      lastChapter: 0,
      involvedCharacters: [],
      summary: thread.description,
    };
  }
  
  return newState;
}

export function updateCharacterState(
  state: StoryStructuredState,
  characterName: string,
  updates: Partial<CharacterState>
): StoryStructuredState {
  const newState = { ...state };
  
  if (newState.characters[characterName]) {
    newState.characters[characterName] = {
      ...newState.characters[characterName],
      ...updates,
    };
  }
  
  return newState;
}

export function updatePlotThread(
  state: StoryStructuredState,
  threadId: string,
  updates: Partial<PlotThreadState>,
  currentChapter: number
): StoryStructuredState {
  const newState = { ...state };
  
  if (newState.plotThreads[threadId]) {
    newState.plotThreads[threadId] = {
      ...newState.plotThreads[threadId],
      ...updates,
      lastChapter: currentChapter,
    };
  }
  
  return newState;
}

export function addUnresolvedQuestion(
  state: StoryStructuredState,
  question: string
): StoryStructuredState {
  return {
    ...state,
    unresolvedQuestions: [...state.unresolvedQuestions, question],
  };
}

export function resolveQuestion(
  state: StoryStructuredState,
  question: string
): StoryStructuredState {
  return {
    ...state,
    unresolvedQuestions: state.unresolvedQuestions.filter(q => q !== question),
  };
}

export function addRecentEvent(
  state: StoryStructuredState,
  event: string
): StoryStructuredState {
  // Keep only last 10 events
  const recentEvents = [...state.recentEvents, event].slice(-10);
  return {
    ...state,
    recentEvents,
  };
}

export function calculateTargetTension(
  currentChapter: number,
  totalChapters: number
): number {
  // Parabolic tension curve: low at start, high in middle, resolution at end
  const progress = currentChapter / totalChapters;
  return 4 * progress * (1 - progress);
}

export function updateStoryTension(
  state: StoryStructuredState,
  currentChapter: number,
  totalChapters: number
): StoryStructuredState {
  const targetTension = calculateTargetTension(currentChapter, totalChapters);
  
  // Blend current tension toward target (smooth transition)
  const newTension = state.tension * 0.7 + targetTension * 0.3;
  
  return {
    ...state,
    chapter: currentChapter,
    tension: Math.round(newTension * 100) / 100, // Round to 2 decimals
  };
}

export function formatStructuredStateForPrompt(state: StoryStructuredState): string {
  const lines: string[] = ['## Current Story State'];
  
  // Overall tension
  const tensionPercent = Math.round(state.tension * 100);
  lines.push(`\n**Story Tension:** ${tensionPercent}%`);
  
  // Active plot threads
  const activeThreads = Object.values(state.plotThreads)
    .filter(t => t.status !== 'resolved' && t.status !== 'dormant');
  
  if (activeThreads.length > 0) {
    lines.push('\n### Active Plot Threads');
    for (const thread of activeThreads) {
      const threadTension = Math.round(thread.tension * 100);
      lines.push(`- **${thread.name}** (${thread.status}, tension: ${threadTension}%)`);
      lines.push(`  - ${thread.summary}`);
    }
  }
  
  // Character states
  const characters = Object.values(state.characters);
  if (characters.length > 0) {
    lines.push('\n### Character States');
    for (const char of characters) {
      lines.push(`- **${char.name}**: ${char.emotionalState}`);
      if (char.location) lines.push(`  - Location: ${char.location}`);
      if (Object.keys(char.relationships).length > 0) {
        const rels = Object.entries(char.relationships)
          .map(([name, status]) => `${name} (${status})`)
          .join(', ');
        lines.push(`  - Relationships: ${rels}`);
      }
    }
  }
  
  // Unresolved questions
  if (state.unresolvedQuestions.length > 0) {
    lines.push('\n### Unresolved Questions');
    for (const q of state.unresolvedQuestions) {
      lines.push(`- ${q}`);
    }
  }
  
  // Recent events
  if (state.recentEvents.length > 0) {
    lines.push('\n### Recent Events');
    for (const event of state.recentEvents.slice(-5)) {
      lines.push(`- ${event}`);
    }
  }
  
  return lines.join('\n');
}
