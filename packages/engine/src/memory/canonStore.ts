import type { StoryBible } from '../types/index.js';

export interface CanonFact {
  id: string;
  category: 'character' | 'world' | 'plot' | 'timeline';
  subject: string;
  attribute: string;
  value: string;
  chapterEstablished: number;
}

export interface CanonStore {
  storyId: string;
  facts: CanonFact[];
}

export function createCanonStore(storyId: string): CanonStore {
  return {
    storyId,
    facts: [],
  };
}

export function extractCanonFromBible(bible: StoryBible): CanonStore {
  const store = createCanonStore(bible.id);

  for (const char of bible.characters) {
    addFact(store, {
      category: 'character',
      subject: char.name,
      attribute: 'role',
      value: char.role,
      chapterEstablished: 0,
    });

    if (char.background) {
      addFact(store, {
        category: 'character',
        subject: char.name,
        attribute: 'background',
        value: char.background,
        chapterEstablished: 0,
      });
    }
  }

  for (const thread of bible.plotThreads) {
    addFact(store, {
      category: 'plot',
      subject: thread.name,
      attribute: 'status',
      value: thread.status,
      chapterEstablished: 0,
    });
  }

  return store;
}

export function addFact(store: CanonStore, fact: Omit<CanonFact, 'id'>): CanonStore {
  const newFact: CanonFact = {
    ...fact,
    id: generateId(),
  };
  return {
    ...store,
    facts: [...store.facts, newFact],
  };
}

export function getFactsByCategory(store: CanonStore, category: CanonFact['category']): CanonFact[] {
  return store.facts.filter(f => f.category === category);
}

export function getFact(store: CanonStore, subject: string, attribute: string): CanonFact | undefined {
  return store.facts.find(f => f.subject === subject && f.attribute === attribute);
}

export function updateFact(store: CanonStore, subject: string, attribute: string, value: string, chapter: number): CanonStore {
  const existingIndex = store.facts.findIndex(f => f.subject === subject && f.attribute === attribute);
  
  if (existingIndex >= 0) {
    const updatedFacts = [...store.facts];
    updatedFacts[existingIndex] = {
      ...updatedFacts[existingIndex],
      value,
      chapterEstablished: chapter,
    };
    return { ...store, facts: updatedFacts };
  }
  
  return addFact(store, {
    category: 'plot',
    subject,
    attribute,
    value,
    chapterEstablished: chapter,
  });
}

export function formatCanonForPrompt(store: CanonStore): string {
  const lines: string[] = ['## Story Canon (NEVER contradict these facts)'];
  
  const characters = getFactsByCategory(store, 'character');
  if (characters.length > 0) {
    lines.push('\n### Characters');
    for (const fact of characters) {
      lines.push(`- ${fact.subject}: ${fact.attribute} = ${fact.value}`);
    }
  }
  
  const world = getFactsByCategory(store, 'world');
  if (world.length > 0) {
    lines.push('\n### World');
    for (const fact of world) {
      lines.push(`- ${fact.subject}: ${fact.attribute} = ${fact.value}`);
    }
  }
  
  const plot = getFactsByCategory(store, 'plot');
  if (plot.length > 0) {
    lines.push('\n### Plot');
    for (const fact of plot) {
      lines.push(`- ${fact.subject}: ${fact.attribute} = ${fact.value}`);
    }
  }
  
  return lines.join('\n');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
