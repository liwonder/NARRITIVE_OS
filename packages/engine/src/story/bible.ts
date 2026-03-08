import type { StoryBible, CharacterProfile, PlotThread } from '../types/index.js';

export function createStoryBible(
  title: string,
  theme: string,
  genre: string,
  setting: string,
  tone: string,
  premise: string,
  targetChapters: number = 10
): StoryBible {
  return {
    id: generateId(),
    title,
    theme,
    genre,
    setting,
    tone,
    targetChapters,
    premise,
    characters: [],
    plotThreads: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function addCharacter(
  bible: StoryBible,
  name: string,
  role: CharacterProfile['role'],
  personality: string[],
  goals: string[]
): StoryBible {
  const character: CharacterProfile = {
    id: generateId(),
    name,
    role,
    personality,
    goals,
  };
  
  return {
    ...bible,
    characters: [...bible.characters, character],
    updatedAt: new Date(),
  };
}

export function addPlotThread(
  bible: StoryBible,
  name: string,
  description: string
): StoryBible {
  const thread: PlotThread = {
    id: generateId(),
    name,
    description,
    status: 'dormant',
    tension: 0.1,
  };
  
  return {
    ...bible,
    plotThreads: [...bible.plotThreads, thread],
    updatedAt: new Date(),
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
