export interface StoryBible {
  id: string;
  title: string;
  theme: string;
  genre: string;
  setting: string;
  tone: string;
  targetChapters: number;
  premise: string;
  characters: CharacterProfile[];
  plotThreads: PlotThread[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  personality: string[];
  goals: string[];
  background?: string;
}

export interface PlotThread {
  id: string;
  name: string;
  description: string;
  status: 'dormant' | 'active' | 'escalating' | 'resolved';
  tension: number;
}

export interface Chapter {
  id: string;
  storyId: string;
  number: number;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  generatedAt: Date;
}

export interface StoryState {
  storyId: string;
  currentChapter: number;
  totalChapters: number;
  currentTension: number;
  activePlotThreads: string[];
  chapterSummaries: ChapterSummary[];
}

export interface ChapterSummary {
  chapterNumber: number;
  summary: string;
  keyEvents: string[];
  characterChanges: Record<string, string>;
}

export interface GenerationContext {
  bible: StoryBible;
  state: StoryState;
  chapterNumber: number;
  targetWordCount?: number;
}

export interface WriterOutput {
  content: string;
  title: string;
  wordCount: number;
}

export interface CompletenessResult {
  isComplete: boolean;
  reason?: string;
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMProviderConfig {
  provider: 'openai' | 'deepseek' | string;
  apiKey: string;
  baseURL?: string;
  model?: string;
}
