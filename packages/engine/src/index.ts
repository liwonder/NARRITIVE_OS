// Types
export * from './types/index.js';
export type { LLMProviderConfig } from './types/index.js';

// LLM
export { LLMClient, getLLM } from './llm/client.js';

// Agents
export { ChapterWriter, writer } from './agents/writer.js';
export { CompletenessChecker, completenessChecker } from './agents/completeness.js';
export { ChapterSummarizer, summarizer } from './agents/summarizer.js';
export { CanonValidator, canonValidator } from './agents/canonValidator.js';

// Pipeline
export { generateChapter, type GenerateChapterResult, type GenerateChapterOptions } from './pipeline/generateChapter.js';

// Story
export { createStoryBible, addCharacter, addPlotThread } from './story/bible.js';
export { createStoryState, updateStoryState } from './story/state.js';

// Memory
export { createCanonStore, extractCanonFromBible, addFact, formatCanonForPrompt, type CanonStore, type CanonFact } from './memory/canonStore.js';
