# Progress Documentation

<cite>
**Referenced Files in This Document**
- [PROGRESS.md](file://PROGRESS.md)
- [implementation-plan.md](file://implementation-plan.md)
- [packages/engine/src/index.ts](file://packages/engine/src/index.ts)
- [packages/engine/src/pipeline/generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts)
- [packages/engine/src/agents/writer.ts](file://packages/engine/src/agents/writer.ts)
- [packages/engine/src/memory/canonStore.ts](file://packages/engine/src/memory/canonStore.ts)
- [packages/engine/src/memory/vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts)
- [packages/engine/src/story/structuredState.ts](file://packages/engine/src/story/structuredState.ts)
- [packages/engine/src/agents/storyDirector.ts](file://packages/engine/src/agents/storyDirector.ts)
- [packages/engine/src/agents/chapterPlanner.ts](file://packages/engine/src/agents/chapterPlanner.ts)
- [packages/engine/src/constraints/constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts)
- [packages/engine/src/world/worldState.ts](file://packages/engine/src/world/worldState.ts)
- [packages/engine/src/memory/stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts)
- [packages/engine/src/types/index.ts](file://packages/engine/src/types/index.ts)
- [packages/engine/src/agents/scenePlanner.ts](file://packages/engine/src/agents/scenePlanner.ts)
- [packages/engine/src/agents/sceneWriter.ts](file://packages/engine/src/agents/sceneWriter.ts)
- [packages/engine/src/agents/sceneValidator.ts](file://packages/engine/src/agents/sceneValidator.ts)
- [packages/engine/src/scene/sceneAssembler.ts](file://packages/engine/src/scene/sceneAssembler.ts)
- [packages/engine/src/scene/sceneOutcomeExtractor.ts](file://packages/engine/src/scene/sceneOutcomeExtractor.ts)
- [packages/engine/src/test/scene-level.test.ts](file://packages/engine/src/test/scene-level.test.ts)
- [apps/cli/src/index.ts](file://apps/cli/src/index.ts)
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts)
- [apps/cli/src/commands/continue.ts](file://apps/cli/src/commands/continue.ts)
- [package.json](file://package.json)
- [turbo.json](file://turbo.json)
</cite>

## Update Summary
**Changes Made**
- Updated Phase 12 status from "Pending" to "Complete" reflecting the full implementation of scene-level generation as a major architectural milestone
- Documented the fundamental architectural shift from chapter-level to scene-level generation
- Added comprehensive coverage of new scene-level agents, components, and pipeline flow
- Updated architecture diagrams to reflect the new scene-centric narrative generation system
- Enhanced integration documentation to show how scene-level generation complements existing phases
- Expanded troubleshooting guide to cover scene-level generation components

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document provides a comprehensive overview of the Narrative Operating System (Narrative OS) implementation progress, covering the completed phases, current architecture, and integration points. The system has successfully implemented all twelve planned phases, delivering a robust, extensible framework for automated story generation with sophisticated narrative constraints, world simulation, memory management, and advanced scene-level generation capabilities.

## Project Structure
The repository is organized as a monorepo with a shared engine package and a CLI application:
- packages/engine: Core narrative engine with agents, memory, story state, constraints, world simulation, and scene-level generation components
- apps/cli: Command-line interface for configuring providers, initializing stories, generating chapters, and checking status
- Root configuration: package.json and turbo.json define the monorepo build and development tasks

```mermaid
graph TB
subgraph "Monorepo"
subgraph "packages/engine"
ENGINE_INDEX["index.ts<br/>Unified Exports"]
PIPELINE["pipeline/generateChapter.ts<br/>Scene-Level Pipeline"]
SCENE_AGENTS["agents/scene*<br/>Scene Planning, Writing, Validation"]
SCENE_COMPONENTS["scene/*<br/>Assembly & Outcome Extraction"]
CORE_AGENTS["agents/*<br/>Core 10 Agents"]
MEMORY["memory/*<br/>Canons, Vectors, State Updates"]
STORY["story/*<br/>Structured State & Persistence"]
CONSTRAINTS["constraints/*<br/>Graph & Validation"]
WORLD["world/*<br/>Simulation & Events"]
END
subgraph "apps/cli"
CLI_INDEX["src/index.ts<br/>Commands"]
GENERATE_CMD["commands/generate.ts"]
CONTINUE_CMD["commands/continue.ts"]
END
end
CLI_INDEX --> ENGINE_INDEX
GENERATE_CMD --> ENGINE_INDEX
CONTINUE_CMD --> ENGINE_INDEX
ENGINE_INDEX --> PIPELINE
PIPELINE --> SCENE_AGENTS
PIPELINE --> CORE_AGENTS
PIPELINE --> MEMORY
PIPELINE --> STORY
PIPELINE --> CONSTRAINTS
PIPELINE --> WORLD
SCENE_AGENTS --> SCENE_COMPONENTS
```

**Diagram sources**
- [packages/engine/src/index.ts:1-123](file://packages/engine/src/index.ts#L1-L123)
- [packages/engine/src/pipeline/generateChapter.ts:1-290](file://packages/engine/src/pipeline/generateChapter.ts#L1-L290)
- [apps/cli/src/index.ts:1-54](file://apps/cli/src/index.ts#L1-L54)

**Section sources**
- [package.json:1-17](file://package.json#L1-L17)
- [turbo.json:1-19](file://turbo.json#L1-L19)

## Core Components
The engine exposes a unified export surface for all twelve phases of the narrative system, including the new scene-level generation components. The CLI consumes these exports to orchestrate complete story generation cycles with integrated memory, constraints, world simulation, and advanced scene composition.

- Engine exports: LLM client, 10 completed agents (writer, completeness checker, summarizer, validators, memory extractor, state updater, tension controller, story director, chapter planner), 3 new scene-level agents (scene planner, scene writer, scene validator), scene assembly and outcome extraction utilities, world simulation, constraints graph, state updater pipeline, and dual-mode generation pipeline
- CLI commands: config, init, generate, status, continue

**Section sources**
- [packages/engine/src/index.ts:1-123](file://packages/engine/src/index.ts#L1-L123)
- [apps/cli/src/index.ts:1-54](file://apps/cli/src/index.ts#L1-L54)

## Architecture Overview
The system implements a complete phased narrative engine with integrated feedback loops and advanced scene-level generation. The pipeline now encompasses all twelve phases, creating a self-improving narrative generation system with sophisticated world simulation, constraint enforcement, and granular scene composition capabilities.

```mermaid
sequenceDiagram
participant CLI as "CLI"
participant Engine as "Engine"
participant Director as "StoryDirector"
participant Planner as "ChapterPlanner"
participant ScenePlanner as "ScenePlanner"
participant SceneWriter as "SceneWriter"
participant SceneValidator as "SceneValidator"
participant SceneAssembler as "SceneAssembler"
participant Canon as "CanonStore"
participant Vector as "VectorStore"
participant Summarizer as "ChapterSummarizer"
participant World as "WorldStateManager"
participant Graph as "ConstraintGraph"
CLI->>Engine : generateChapter(context, options)
Engine->>Director : direct(context)
Director-->>Engine : objectives
Engine->>Planner : plan(objectives)
Planner-->>Engine : chapter outline
Engine->>ScenePlanner : planScenes(outline)
ScenePlanner-->>Engine : scene plan
Engine->>SceneWriter : writeScene(scene, context)
SceneWriter-->>Engine : scene content
Engine->>SceneValidator : validateScene(scene, content)
SceneValidator-->>Engine : validation result
Engine->>SceneAssembler : assembleChapter(scenes)
SceneAssembler-->>Engine : chapter content
Engine->>Engine : scene-level feedback loop
Engine->>Vector : addSceneMemory(extracted)
Engine->>Graph : update constraints
Graph-->>Engine : validation results
Engine->>World : update simulation
World-->>Engine : world state
Engine->>Engine : state updater pipeline
Engine-->>CLI : {chapter, summary, violations, memoriesExtracted}
```

**Diagram sources**
- [packages/engine/src/pipeline/generateChapter.ts:63-205](file://packages/engine/src/pipeline/generateChapter.ts#L63-L205)
- [packages/engine/src/agents/scenePlanner.ts:16-109](file://packages/engine/src/agents/scenePlanner.ts#L16-L109)
- [packages/engine/src/agents/sceneWriter.ts:19-111](file://packages/engine/src/agents/sceneWriter.ts#L19-L111)
- [packages/engine/src/agents/sceneValidator.ts:14-65](file://packages/engine/src/agents/sceneValidator.ts#L14-L65)
- [packages/engine/src/scene/sceneAssembler.ts:14-42](file://packages/engine/src/scene/sceneAssembler.ts#L14-L42)
- [packages/engine/src/memory/vectorStore.ts:37-58](file://packages/engine/src/memory/vectorStore.ts#L37-L58)
- [packages/engine/src/constraints/constraintGraph.ts:29-471](file://packages/engine/src/constraints/constraintGraph.ts#L29-L471)
- [packages/engine/src/world/worldState.ts:24-321](file://packages/engine/src/world/worldState.ts#L24-L321)

**Section sources**
- [PROGRESS.md:342-371](file://PROGRESS.md#L342-L371)

## Detailed Component Analysis

### Phase 1 — Core Chapter Generator ✅ COMPLETE
- Purpose: Establish a robust chapter generation loop with completion checks, summaries, and continuation handling
- Key elements:
  - ChapterWriter: builds prompts with story context, characters, canon, memories, recent summaries, and inferred chapter goals
  - CompletenessChecker: ensures chapters meet minimum structural completeness
  - ChapterSummarizer: produces concise chapter summaries
  - generateChapter pipeline: orchestrates writing, continuation, validation, summarization, and memory extraction

```mermaid
flowchart TD
Start(["Start generateChapter"]) --> Init["Initialize MemoryRetriever (optional)"]
Init --> Write["Writer.write(context, canon?, memoryRetriever?)"]
Write --> Check{"Is complete?"}
Check --> |No| Continue["Writer.continue(existingContent, context)"]
Continue --> Check
Check --> |Yes| Summarize["Summarizer.summarize(content, chapterNumber)"]
Summarize --> Extract["MemoryExtractor.extract(chapter, bible)"]
Extract --> Store["VectorStore.addMemory(memory)"]
Store --> Done(["Return {chapter, summary, violations, memoriesExtracted}"])
```

**Diagram sources**
- [packages/engine/src/pipeline/generateChapter.ts:210-285](file://packages/engine/src/pipeline/generateChapter.ts#L210-L285)
- [packages/engine/src/agents/writer.ts:61-135](file://packages/engine/src/agents/writer.ts#L61-L135)

**Section sources**
- [PROGRESS.md:7-41](file://PROGRESS.md#L7-L41)
- [packages/engine/src/agents/writer.ts:1-164](file://packages/engine/src/agents/writer.ts#L1-L164)
- [packages/engine/src/pipeline/generateChapter.ts:1-290](file://packages/engine/src/pipeline/generateChapter.ts#L1-L290)

### Phase 2 — Canon Memory System ✅ COMPLETE
- Purpose: Prevent fact drift by storing immutable facts and validating chapters against them
- Key elements:
  - CanonStore: stores facts (character, world, plot, timeline) with establishment chapters
  - extractCanonFromBible: auto-extracts initial facts from the story bible
  - CanonValidator: detects contradictions between chapter content and established facts
  - Writer prompt injection: formatted canon section included in prompts

```mermaid
classDiagram
class CanonStore {
+string storyId
+CanonFact[] facts
+addFact(fact)
+getFactsByCategory(category)
+formatCanonForPrompt()
}
class CanonFact {
+string id
+string category
+string subject
+string attribute
+string value
+number chapterEstablished
}
CanonStore --> CanonFact : "contains"
```

**Diagram sources**
- [packages/engine/src/memory/canonStore.ts:12-129](file://packages/engine/src/memory/canonStore.ts#L12-L129)

**Section sources**
- [PROGRESS.md:44-72](file://PROGRESS.md#L44-L72)
- [packages/engine/src/memory/canonStore.ts:1-134](file://packages/engine/src/memory/canonStore.ts#L1-L134)

### Phase 3 — Vector Narrative Memory ✅ COMPLETE
- Purpose: Enable semantic search over narrative memories to improve coherence across long stories
- Key elements:
  - VectorStore: HNSW-based vector index with OpenAI embeddings and mock fallback
  - MemoryRetriever: queries relevant memories for chapter prompts
  - MemoryExtractor: extracts narrative fragments post-generation
  - Integration: automatic memory extraction and persistence after each chapter

```mermaid
classDiagram
class VectorStore {
-HierarchicalNSW index
-Map~number,NarrativeMemory~ memories
+initialize()
+addMemory(memory)
+searchSimilar(query,k)
+serialize()/load()
}
class NarrativeMemory {
+number id
+string storyId
+number chapterNumber
+string content
+string category
+Date timestamp
+number[] embedding
}
VectorStore --> NarrativeMemory : "stores"
```

**Diagram sources**
- [packages/engine/src/memory/vectorStore.ts:19-158](file://packages/engine/src/memory/vectorStore.ts#L19-L158)

**Section sources**
- [PROGRESS.md:75-107](file://PROGRESS.md#L75-L107)
- [packages/engine/src/memory/vectorStore.ts:1-173](file://packages/engine/src/memory/vectorStore.ts#L1-L173)

### Phase 4 — Structured Story State ✅ COMPLETE
- Purpose: Track mutable story state (tension, characters, plot threads, unresolved questions, recent events)
- Key elements:
  - StoryStructuredState: central state container with helpers for initialization, updates, and formatting
  - Tension calculation: parabolic curve targeting natural dramatic arc
  - Integration: formatted state injected into prompts for context

```mermaid
flowchart TD
Init["createStructuredState(storyId)"] --> InitChars["initializeCharactersFromBible()"]
InitChars --> InitThreads["initializePlotThreadsFromBible()"]
InitThreads --> UpdateTension["updateStoryTension(currentChapter,totalChapters)"]
UpdateTension --> Format["formatStructuredStateForPrompt()"]
Format --> Writer["Writer prompt injection"]
```

**Diagram sources**
- [packages/engine/src/story/structuredState.ts:33-179](file://packages/engine/src/story/structuredState.ts#L33-L179)

**Section sources**
- [PROGRESS.md:110-137](file://PROGRESS.md#L110-L137)
- [packages/engine/src/story/structuredState.ts:1-235](file://packages/engine/src/story/structuredState.ts#L1-L235)

### Phase 5 — Narrative Tension Controller ✅ COMPLETE
- Purpose: Control pacing by computing target tension and generating guidance
- Key elements:
  - calculateTargetTension: parabolic curve for 10-chapter stories
  - analyzeTension and generateTensionGuidance: categorize and suggest scene types
  - Integration: formatted guidance injected into prompts

**Section sources**
- [PROGRESS.md:140-163](file://PROGRESS.md#L140-L163)
- [packages/engine/src/story/structuredState.ts:155-179](file://packages/engine/src/story/structuredState.ts#L155-L179)

### Phase 6 — Story Director Agent ✅ COMPLETE
- Purpose: Determine chapter objectives and high-level direction
- Key elements:
  - Analyzes structured state, tension guidance, and recent summaries
  - Produces objectives with priorities and types
  - Fallback mode for testing without LLM

```mermaid
classDiagram
class StoryDirector {
+direct(context) DirectorOutput
+generateFallbackObjectives(state,structuredState) DirectorOutput
+formatForPrompt(output) string
}
class DirectorOutput {
+number chapterNumber
+string overallGoal
+ChapterObjective[] objectives
+string[] focusCharacters
+string[] suggestedScenes
+string tone
+string notes
}
StoryDirector --> DirectorOutput : "produces"
```

**Diagram sources**
- [packages/engine/src/agents/storyDirector.ts:100-276](file://packages/engine/src/agents/storyDirector.ts#L100-L276)

**Section sources**
- [PROGRESS.md:166-190](file://PROGRESS.md#L166-L190)
- [packages/engine/src/agents/storyDirector.ts:1-276](file://packages/engine/src/agents/storyDirector.ts#L1-L276)

### Phase 7 — Chapter Planner Agent ✅ COMPLETE
- Purpose: Convert objectives into detailed scene outlines with progressive tension
- Key elements:
  - Builds scene-by-scene breakdown with goals, settings, characters, and estimated word counts
  - Validates outline coverage against objectives
  - Fallback outline generation without LLM

```mermaid
classDiagram
class ChapterPlanner {
+plan(context) ChapterOutline
+generateFallbackOutline(directorOutput,targetWordCount) ChapterOutline
+validateOutline(outline,objectives) ValidationResult
+formatForPrompt(outline) string
}
class ChapterOutline {
+number chapterNumber
+string overallGoal
+string tone
+number totalEstimatedWords
+Scene[] scenes
+string[] transitions
+string[] notes
}
ChapterPlanner --> ChapterOutline : "produces"
```

**Diagram sources**
- [packages/engine/src/agents/chapterPlanner.ts:110-326](file://packages/engine/src/agents/chapterPlanner.ts#L110-L326)

**Section sources**
- [PROGRESS.md:193-220](file://PROGRESS.md#L193-L220)
- [packages/engine/src/agents/chapterPlanner.ts:1-326](file://packages/engine/src/agents/chapterPlanner.ts#L1-L326)

### Phase 8 — World Simulation Layer ✅ COMPLETE
- Purpose: Enable autonomous character behavior and emergent plot through turn-based simulation
- Key elements:
  - WorldStateManager: manages locations, characters, events, and history
  - CharacterAgent and EventResolver: model character agendas and resolve interactions
  - Serialization: full world state persistence

```mermaid
classDiagram
class WorldStateManager {
+initialize(setting,initialCharacters)
+addLocation(id,name,description,connectedTo)
+moveCharacter(characterName,toLocationId)
+addEvent(event)
+applyResolutions(resolutions)
+advanceChapter()
+serialize()/load()
}
class Location {
+string id
+string name
+string description
+string[] connectedTo
+string[] characters
+string[] items
+string[] events
}
WorldStateManager --> Location : "manages"
```

**Diagram sources**
- [packages/engine/src/world/worldState.ts:24-321](file://packages/engine/src/world/worldState.ts#L24-L321)

**Section sources**
- [PROGRESS.md:222-251](file://PROGRESS.md#L222-L251)
- [packages/engine/src/world/worldState.ts:1-321](file://packages/engine/src/world/worldState.ts#L1-L321)

### Phase 9 — Narrative Constraints Graph ✅ COMPLETE
- Purpose: Enforce logical consistency across story world (canon, location, knowledge, timeline, logic)
- Key elements:
  - ConstraintGraph: nodes and edges representing characters, locations, facts, events
  - Validation: location consistency, knowledge leaks, timeline errors, logical inconsistencies
  - Integration: dual validation (fast graph-based + comprehensive LLM-based)

```mermaid
classDiagram
class ConstraintGraph {
+addNode(node)
+addEdge(edge)
+checkConstraints(currentChapter) ConstraintViolation[]
+getCharacterKnowledge(characterName)
+getCharacterLocation(characterName)
+serialize()/load()
}
class ConstraintNode {
+string id
+NodeType type
+string label
+Record~string,any~ properties
+number chapterEstablished
}
class ConstraintEdge {
+string id
+string from
+string to
+string type
+Record~string,any~ properties
}
ConstraintGraph --> ConstraintNode : "contains"
ConstraintGraph --> ConstraintEdge : "connects"
```

**Diagram sources**
- [packages/engine/src/constraints/constraintGraph.ts:29-471](file://packages/engine/src/constraints/constraintGraph.ts#L29-L471)

**Section sources**
- [PROGRESS.md:253-282](file://PROGRESS.md#L253-L282)
- [packages/engine/src/constraints/constraintGraph.ts:1-471](file://packages/engine/src/constraints/constraintGraph.ts#L1-L471)

### Phase 10 — Memory + Graph Updates ✅ COMPLETE
- Purpose: Complete the feedback loop by updating state, vector store, character states, plot threads, and constraint graph after each chapter
- Key elements:
  - StateUpdaterPipeline: orchestrates the complete post-chapter update process
  - Multi-stage updates: extract → update vector → update state → update graph
  - Support for both quick (no LLM) and full (LLM-powered) update modes
  - Integration with all previous phases for comprehensive story evolution

```mermaid
flowchart TD
Chapter["Generated Chapter"] --> Extract["Extract Narrative Memory"]
Extract --> UpdateVector["Update Vector Store"]
UpdateVector --> UpdateState["Update Structured State"]
UpdateState --> UpdateGraph["Update Constraint Graph"]
UpdateGraph --> UpdateWorld["Update World Simulation"]
UpdateWorld --> Feedback["Feedback Loop Complete"]
Feedback --> NextCycle["Next Chapter Generation"]
```

**Diagram sources**
- [packages/engine/src/memory/stateUpdater.ts:1-232](file://packages/engine/src/memory/stateUpdater.ts#L1-L232)

**Section sources**
- [PROGRESS.md:284-311](file://PROGRESS.md#L284-L311)
- [packages/engine/src/memory/stateUpdater.ts:1-232](file://packages/engine/src/memory/stateUpdater.ts#L1-L232)

### Phase 12 — Scene-Level Generation ✅ COMPLETE
- Purpose: Implement granular scene-level generation as a fundamental architectural shift from chapter-level to scene-level narrative construction
- Key elements:
  - Scene interface and types: Scene, ScenePlan, SceneOutput, SceneOutcome with comprehensive metadata
  - ScenePlanner: breaks chapters into individual scenes with specific purposes, locations, and tension levels
  - SceneWriter: generates immersive prose for single scenes with character-focused narrative
  - SceneValidator: validates scene quality, consistency, and adherence to narrative requirements
  - SceneAssembler: combines individual scenes into cohesive chapters with proper transitions
  - SceneOutcomeExtractor: extracts state changes from each scene for world simulation updates
  - Updated generateChapter pipeline: dual-mode operation supporting both legacy and scene-level generation
  - Memory updates: vector store updates after every scene, not just chapter completion
  - Comprehensive test coverage: extensive validation of scene-level generation workflow

```mermaid
flowchart TD
Start(["generateChapter with useSceneLevel=true"]) --> Plan["planScenes(bible, state, chapterNumber)"]
Plan --> Loop{"For each Scene"}
Loop --> |Scene 1| Write1["writeScene(scene1, context)"]
Loop --> |Scene 2| Write2["writeScene(scene2, context)"]
Loop --> |Scene n| Writen["writeScene(scenen, context)"]
Write1 --> Validate1["validateScene(scene1, output1)"]
Write2 --> Validate2["validateScene(scene2, output2)"]
Writen --> Validaten["validateScene(scenen, outputn)"]
Validate1 --> Extract1["extractSceneOutcome(scene1, output1)"]
Validate2 --> Extract2["extractSceneOutcome(scene2, output2)"]
Validaten --> Extractn["extractSceneOutcome(scenen, outputn)"]
Extract1 --> Store1["VectorStore.addMemory(scene1)"]
Extract2 --> Store2["VectorStore.addMemory(scene2)"]
Extractn --> Storen["VectorStore.addMemory(scenen)"]
Store1 --> Assemble["assembleChapter(scenes)"]
Store2 --> Assemble
Storen --> Assemble
Assemble --> Canon["canonValidator.validate(chapter)"]
Canon --> Return(["Return {chapter, summary, violations, memoriesExtracted}"])
```

**Diagram sources**
- [packages/engine/src/pipeline/generateChapter.ts:63-205](file://packages/engine/src/pipeline/generateChapter.ts#L63-L205)
- [packages/engine/src/agents/scenePlanner.ts:16-109](file://packages/engine/src/agents/scenePlanner.ts#L16-L109)
- [packages/engine/src/agents/sceneWriter.ts:19-111](file://packages/engine/src/agents/sceneWriter.ts#L19-L111)
- [packages/engine/src/agents/sceneValidator.ts:14-65](file://packages/engine/src/agents/sceneValidator.ts#L14-L65)
- [packages/engine/src/scene/sceneAssembler.ts:14-42](file://packages/engine/src/scene/sceneAssembler.ts#L14-L42)
- [packages/engine/src/scene/sceneOutcomeExtractor.ts:14-67](file://packages/engine/src/scene/sceneOutcomeExtractor.ts#L14-L67)

**Section sources**
- [PROGRESS.md:342-371](file://PROGRESS.md#L342-L371)
- [packages/engine/src/types/index.ts:91-125](file://packages/engine/src/types/index.ts#L91-L125)
- [packages/engine/src/agents/scenePlanner.ts:1-170](file://packages/engine/src/agents/scenePlanner.ts#L1-L170)
- [packages/engine/src/agents/sceneWriter.ts:1-139](file://packages/engine/src/agents/sceneWriter.ts#L1-L139)
- [packages/engine/src/agents/sceneValidator.ts:1-117](file://packages/engine/src/agents/sceneValidator.ts#L1-L117)
- [packages/engine/src/scene/sceneAssembler.ts:1-115](file://packages/engine/src/scene/sceneAssembler.ts#L1-L115)
- [packages/engine/src/scene/sceneOutcomeExtractor.ts:1-117](file://packages/engine/src/scene/sceneOutcomeExtractor.ts#L1-L117)
- [packages/engine/src/test/scene-level.test.ts:1-301](file://packages/engine/src/test/scene-level.test.ts#L1-L301)

## Dependency Analysis
The engine exports consolidate all twelve major modules behind a single entry point, enabling clean imports from both CLI and potential API/worker applications. The CLI depends on the engine for complete story lifecycle operations with integrated memory, constraints, world simulation, and advanced scene-level generation capabilities.

```mermaid
graph LR
CLI["apps/cli/src/index.ts"] --> ENGINE["packages/engine/src/index.ts"]
ENGINE --> PIPELINE["generateChapter.ts"]
PIPELINE --> SCENE_AGENTS["scene agents"]
PIPELINE --> CORE_AGENTS["core agents"]
PIPELINE --> SCENE_COMPONENTS["scene components"]
PIPELINE --> WRITER["writer.ts"]
PIPELINE --> SUMMARIZER["summarizer.ts"]
PIPELINE --> CANON["canonStore.ts"]
PIPELINE --> VECTOR["vectorStore.ts"]
PIPELINE --> STATE["structuredState.ts"]
PIPELINE --> DIRECTOR["storyDirector.ts"]
PIPELINE --> PLANNER["chapterPlanner.ts"]
PIPELINE --> CONSTRAINTS["constraintGraph.ts"]
PIPELINE --> WORLD["worldState.ts"]
PIPELINE --> UPDATER["stateUpdater.ts"]
SCENE_AGENTS --> SCENE_COMPONENTS
```

**Diagram sources**
- [packages/engine/src/index.ts:1-123](file://packages/engine/src/index.ts#L1-L123)
- [apps/cli/src/index.ts:1-54](file://apps/cli/src/index.ts#L1-L54)

**Section sources**
- [packages/engine/src/index.ts:1-123](file://packages/engine/src/index.ts#L1-L123)
- [apps/cli/src/index.ts:1-54](file://apps/cli/src/index.ts#L1-L54)

## Performance Considerations
- Vector indexing: HNSW provides efficient similarity search; ensure proper initialization and persistence to avoid rebuild costs
- Embedding generation: OpenAI embeddings are used with a mock fallback; configure environment appropriately for production
- Prompt construction: Avoid excessively large prompts by limiting recent summaries and memory sections
- Continuation attempts: Limit max continuation attempts to prevent runaway token usage
- Serialization: Persist state and memories to disk to minimize recomputation across sessions
- Constraint graph validation: Optimized for both quick (graph-based) and comprehensive (LLM-based) validation modes
- World simulation: Turn-based approach prevents excessive computational overhead while maintaining narrative coherence
- Scene-level generation: Individual scene processing enables better memory management and incremental feedback but increases computational overhead
- Memory updates: Scene-level memory persistence provides more granular story continuity but requires more frequent vector store operations
- Parallel processing: Scene-level generation can potentially benefit from parallel scene processing where supported by the underlying LLM infrastructure

## Troubleshooting Guide
- Provider configuration: Use the CLI config command to set LLM provider and API keys
- Integration tests: Run the provided integration test to validate provider connectivity and basic pipeline behavior
- Memory persistence: Verify vector store and canon persistence files exist in the expected locations
- Constraint violations: Review reported violations from the CanonValidator and ConstraintGraph to identify and fix inconsistencies
- World simulation issues: Check character locations and event resolutions for logical consistency
- State updater problems: Verify that all three update modes (quick, LLM-powered, multi-chapter) are functioning correctly
- CLI command failures: Use verbose logging to trace through the complete generation pipeline from CLI to engine
- Scene-level generation issues: Check scene planning prompts, scene writing quality, and validation results for individual scenes
- Memory extraction problems: Verify that scene-level memories are being properly extracted and stored in the vector database
- Pipeline configuration: Ensure proper useSceneLevel flag is set for scene-level generation vs legacy chapter-level generation
- Performance bottlenecks: Monitor scene generation timing and adjust targetSceneCount parameter based on computational resources

**Section sources**
- [PROGRESS.md:314-339](file://PROGRESS.md#L314-L339)
- [apps/cli/src/index.ts:18-21](file://apps/cli/src/index.ts#L18-L21)

## Conclusion
The Narrative OS has successfully implemented all twelve planned phases, delivering a comprehensive, self-improving framework for automated story generation. The system now features sophisticated world simulation, narrative constraints enforcement, integrated memory management, and advanced scene-level generation capabilities as a fundamental architectural shift from chapter-level to scene-level narrative construction. 

The implementation of Phase 12 represents a major milestone in the evolution of the narrative generation system, introducing granular scene composition that enables more precise control over narrative pacing, character development, and plot progression. The new scene-level agents (ScenePlanner, SceneWriter, SceneValidator) work in conjunction with the SceneAssembler and SceneOutcomeExtractor to create a comprehensive scene-centric generation pipeline that maintains compatibility with the existing chapter-level generation while providing enhanced narrative granularity.

The modular architecture continues to enable incremental enhancements while maintaining system stability, positioning the platform to produce coherent, consistent, and engaging narratives across extended story arcs with complete narrative integrity, logical consistency, and sophisticated scene-level control. The dual-mode generation pipeline ensures backward compatibility while providing access to the advanced capabilities of scene-level narrative construction.