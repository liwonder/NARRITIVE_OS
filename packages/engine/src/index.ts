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
export { MemoryExtractor, memoryExtractor } from './agents/memoryExtractor.js';
export { StateUpdater, stateUpdater } from './agents/stateUpdater.js';
export { planScenes } from './agents/scenePlanner.js';
export { writeScene } from './agents/sceneWriter.js';
export { validateScene, quickValidateScene } from './agents/sceneValidator.js';
export {
  TensionController,
  tensionController,
  calculateTargetTension,
  calculateNextChapterTension,
  analyzeTension,
  generateTensionGuidance,
  formatTensionForPrompt,
  estimateTensionFromChapter,
  type TensionAnalysis,
  type TensionGuidance,
} from './agents/tensionController.js';
export {
  StoryDirector,
  storyDirector,
  type ChapterObjective,
  type DirectorOutput,
  type DirectorContext,
} from './agents/storyDirector.js';
export {
  ChapterPlanner,
  chapterPlanner,
  type Scene,
  type ChapterOutline,
  type PlannerContext,
} from './agents/chapterPlanner.js';

// World Simulation
export {
  CharacterAgentSystem,
  characterAgentSystem,
  type CharacterAgent,
  type AgendaItem,
  type CharacterDecision,
  type CharacterAgentContext,
} from './world/characterAgent.js';
export {
  EventResolver,
  eventResolver,
  type WorldEvent,
  type EventResolution,
  type ConflictResolution,
} from './world/eventResolver.js';
export {
  WorldStateManager,
  createWorldStateManager,
  type Location,
  type WorldState,
} from './world/worldState.js';

// Constraints
export {
  ConstraintGraph,
  createConstraintGraph,
  type ConstraintNode,
  type ConstraintEdge,
  type ConstraintViolation,
  type NodeType,
} from './constraints/constraintGraph.js';
export {
  Validator,
  validator,
  type ValidationResult,
  type ChapterValidationContext,
} from './constraints/validator.js';

// State Update Pipeline
export {
  StateUpdaterPipeline,
  stateUpdaterPipeline,
  type StateUpdateResult,
  type StateChange,
  type UpdateContext,
} from './memory/stateUpdater.js';

// Pipeline
export { generateChapter, type GenerateChapterResult, type GenerateChapterOptions } from './pipeline/generateChapter.js';

// Story
export { createStoryBible, addCharacter, addPlotThread } from './story/bible.js';
export { createStoryState, updateStoryState } from './story/state.js';
export {
  createStructuredState,
  initializeCharactersFromBible,
  initializePlotThreadsFromBible,
  updateCharacterState,
  updatePlotThread,
  addUnresolvedQuestion,
  resolveQuestion,
  addRecentEvent,
  updateStoryTension,
  formatStructuredStateForPrompt,
  type StoryStructuredState,
  type CharacterState,
  type PlotThreadState,
} from './story/structuredState.js';

// Memory
export { createCanonStore, extractCanonFromBible, addFact, formatCanonForPrompt, type CanonStore, type CanonFact } from './memory/canonStore.js';
export { VectorStore, getVectorStore, clearVectorStore, type NarrativeMemory, type MemorySearchResult } from './memory/vectorStore.js';
export { MemoryRetriever, createMemoryRetriever, type RetrievalContext, type RetrievedMemory } from './memory/memoryRetriever.js';

// Scene
export { assembleChapter, formatChapterWithHeading } from './scene/sceneAssembler.js';
export { extractSceneOutcome, mergeSceneOutcomes } from './scene/sceneOutcomeExtractor.js';
