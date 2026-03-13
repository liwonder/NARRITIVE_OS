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

// Multi-model configuration for different task types
export interface ModelConfig {
  name: string;
  provider: 'openai' | 'deepseek' | 'alibaba' | 'ark' | string;
  apiKey: string;
  baseURL?: string;
  model: string;
  purpose: 'reasoning' | 'chat' | 'fast' | 'embedding';
}

export interface MultiModelConfig {
  models: ModelConfig[];
  defaultModel: string;
}

// Task types that can use different models
export type TaskType = 
  | 'generation'      // Complex creative writing (use reasoning model)
  | 'validation'      // Canon validation (use chat model)
  | 'summarization'   // Chapter summarization (use fast model)
  | 'extraction'      // Memory/state extraction (use chat model)
  | 'planning'        // Scene/chapter planning (use reasoning model)
  | 'embedding'       // Text embeddings (use embedding model)
  | 'default';        // Fallback

// Scene-level generation types (Phase 12)
export interface Scene {
  id: number;
  location: string;
  characters: string[];
  purpose: string;
  tension: number;
  conflict?: string;
  type?: 'dialogue' | 'action' | 'reveal' | 'investigation' | 'transition';
}

export interface ScenePlan {
  scenes: Scene[];
  chapterGoal: string;
  targetTension: number;
}

export interface SceneOutput {
  content: string;
  summary: string;
  wordCount: number;
}

export interface SceneValidationResult {
  isValid: boolean;
  violations: string[];
}

export interface SceneOutcome {
  events: string[];
  characterChanges: Record<string, string>;
  locationChanges: Record<string, string>;
  newInformation: string[];
}
