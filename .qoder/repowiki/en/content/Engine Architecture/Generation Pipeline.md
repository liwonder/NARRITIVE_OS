# Generation Pipeline

<cite>
**Referenced Files in This Document**
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts)
- [scopeBuilder.ts](file://packages/engine/src/scope/scopeBuilder.ts)
- [index.ts](file://packages/engine/src/types/index.ts)
- [sceneAssembler.ts](file://packages/engine/src/scene/sceneAssembler.ts)
- [sceneOutcomeExtractor.ts](file://packages/engine/src/scene/sceneOutcomeExtractor.ts)
- [scenePlanner.ts](file://packages/engine/src/agents/scenePlanner.ts)
- [sceneWriter.ts](file://packages/engine/src/agents/sceneWriter.ts)
- [sceneValidator.ts](file://packages/engine/src/agents/sceneValidator.ts)
- [writer.ts](file://packages/engine/src/agents/writer.ts)
- [completeness.ts](file://packages/engine/src/agents/completeness.ts)
- [summarizer.ts](file://packages/engine/src/agents/summarizer.ts)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts)
- [client.ts](file://packages/engine/src/llm/client.ts)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts)
- [bible.ts](file://packages/engine/src/story/bible.ts)
- [state.ts](file://packages/engine/src/story/state.ts)
- [generate.ts](file://apps/cli/src/commands/generate.ts)
- [simple.test.ts](file://packages/engine/src/test/simple.test.ts)
- [worldStateEngine.ts](file://packages/engine/src/world/worldStateEngine.ts)
- [characterAgent.ts](file://packages/engine/src/world/characterAgent.ts)
- [worldStateUpdater.ts](file://packages/engine/src/agents/worldStateUpdater.ts)
- [storyDirector.ts](file://packages/engine/src/agents/storyDirector.ts)
- [eventResolver.ts](file://packages/engine/src/world/eventResolver.ts)
- [worldState.ts](file://packages/engine/src/world/worldState.ts)
- [world-simulation.test.ts](file://packages/engine/src/test/world-simulation.test.ts)
</cite>

## Update Summary
**Changes Made**
- Integrated new Scope Builder functionality for targeted context extraction, replacing broad memory search approach
- Enhanced chapter summary generation with multilingual support based on story language detection
- Added comprehensive scope window construction for each scene with character, location, and relationship-based filtering
- Implemented efficient memory filtering using scope-based queries instead of full vector search
- Enhanced world state integration with targeted context windows for improved performance and relevance

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
10. [Appendices](#appendices)

## Introduction
This document describes the enhanced generation pipeline that orchestrates AI-powered story creation with advanced world simulation capabilities for Phase 14. The pipeline now integrates sophisticated scope building functionality that replaces memory search with targeted context extraction, significantly improving performance and relevance. It supports multilingual chapter summaries and maintains comprehensive world simulation capabilities with intelligent character decision-making, world state updates, and event resolution to create coherent, internally consistent narratives. The system supports both scene-level generation (Phase 12) as the primary approach and legacy chapter-level generation as a fallback option, with enhanced world simulation and scope-based context management.

## Project Structure
The generation pipeline now includes sophisticated scope building infrastructure alongside traditional story generation components. The enhanced structure integrates Scope Builder, World State Engine, Character Agent System, Story Director, and Event Resolver to create a comprehensive narrative world management system with targeted context extraction.

```mermaid
graph TB
subgraph "Enhanced Engine"
A["generateChapter.ts"]
SB["scope/scopeBuilder.ts"]
B["agents/writer.ts"]
C["agents/completeness.ts"]
D["agents/summarizer.ts"]
E["agents/canonValidator.ts"]
F["agents/memoryExtractor.ts"]
G["agents/scenePlanner.ts"]
H["agents/sceneWriter.ts"]
I["agents/sceneValidator.ts"]
J["scene/sceneAssembler.ts"]
K["scene/sceneOutcomeExtractor.ts"]
L["llm/client.ts"]
M["types/index.ts"]
N["memory/canonStore.ts"]
O["memory/vectorStore.ts"]
P["memory/memoryRetriever.ts"]
Q["story/bible.ts"]
R["story/state.ts"]
S["agents/storyDirector.ts"]
T["agents/worldStateUpdater.ts"]
U["world/worldStateEngine.ts"]
V["world/characterAgent.ts"]
W["world/eventResolver.ts"]
X["world/worldState.ts"]
end
subgraph "CLI"
Y["apps/cli/src/commands/generate.ts"]
end
subgraph "Tests"
Z["packages/engine/src/test/world-simulation.test.ts"]
end
Y --> A
A --> SB
A --> B
A --> C
A --> D
A --> E
A --> F
A --> G
A --> H
A --> I
A --> J
A --> K
A --> S
A --> T
A --> U
A --> V
A --> W
A --> X
SB --> U
SB --> O
B --> L
C --> L
D --> L
E --> L
F --> L
G --> L
H --> L
I --> L
J --> L
K --> L
S --> L
T --> L
U --> L
V --> L
W --> L
X --> L
A --> M
A --> N
A --> O
A --> P
A --> Q
A --> R
Z --> A
```

**Diagram sources**
- [generateChapter.ts:1-494](file://packages/engine/src/pipeline/generateChapter.ts#L1-L494)
- [scopeBuilder.ts:1-480](file://packages/engine/src/scope/scopeBuilder.ts#L1-L480)
- [writer.ts](file://packages/engine/src/agents/writer.ts)
- [completeness.ts](file://packages/engine/src/agents/completeness.ts)
- [summarizer.ts](file://packages/engine/src/agents/summarizer.ts)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts)
- [scenePlanner.ts](file://packages/engine/src/agents/scenePlanner.ts)
- [sceneWriter.ts](file://packages/engine/src/agents/sceneWriter.ts)
- [sceneValidator.ts](file://packages/engine/src/agents/sceneValidator.ts)
- [sceneAssembler.ts](file://packages/engine/src/scene/sceneAssembler.ts)
- [sceneOutcomeExtractor.ts](file://packages/engine/src/scene/sceneOutcomeExtractor.ts)
- [client.ts](file://packages/engine/src/llm/client.ts)
- [types/index.ts:1-152](file://packages/engine/src/types/index.ts#L1-L152)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts)
- [bible.ts](file://packages/engine/src/story/bible.ts)
- [state.ts](file://packages/engine/src/story/state.ts)
- [storyDirector.ts](file://packages/engine/src/agents/storyDirector.ts)
- [worldStateUpdater.ts](file://packages/engine/src/agents/worldStateUpdater.ts)
- [worldStateEngine.ts](file://packages/engine/src/world/worldStateEngine.ts)
- [characterAgent.ts](file://packages/engine/src/world/characterAgent.ts)
- [eventResolver.ts](file://packages/engine/src/world/eventResolver.ts)
- [worldState.ts](file://packages/engine/src/world/worldState.ts)

**Section sources**
- [generateChapter.ts:1-494](file://packages/engine/src/pipeline/generateChapter.ts#L1-L494)
- [scopeBuilder.ts:1-480](file://packages/engine/src/scope/scopeBuilder.ts#L1-L480)
- [index.ts:1-152](file://packages/engine/src/types/index.ts#L1-L152)

## Core Components
The enhanced pipeline now operates with sophisticated scope-based context extraction and multilingual capabilities:

### Primary Scene-Level Generation Mode with Enhanced Context Management
- **generateChapter**: Orchestrates scene-level generation with integrated World State Engine, character decision passing, world state updates, and scope-based context extraction.
- **Scope Builder**: Creates targeted context windows for each scene using character, location, and relationship-based filtering instead of broad memory searches.
- **Story Director**: Provides chapter-level direction with tension management and objective generation for coherent narrative progression.
- **Character Agent System**: Manages character decisions, agendas, knowledge, and relationships with both LLM-powered and fallback decision-making.
- **World State Engine**: Comprehensive world state tracking including characters, locations, objects, relationships, and timeline events.
- **World State Updater**: Extracts and applies world state changes from scene content to maintain narrative consistency.
- **Event Resolver**: Processes character decisions into world events and resolves conflicts and interactions systematically.
- **Enhanced Scene Planner**: Creates detailed scene plans with director guidance and world state awareness.
- **Scene Writer**: Generates scenes with character decision integration and scope-aware context.
- **Scene Validator**: Validates scenes against canonical facts and world state consistency.
- **Scene Assembler**: Combines scenes with world state transitions and narrative flow.
- **Scene Outcome Extractor**: Extracts key events and character changes with world state implications.
- **Multilingual Chapter Summarizer**: Generates chapter summaries in the appropriate language based on story configuration.

### Legacy Chapter-Level Generation Mode
- **Writer Agent**: Generates or continues chapter content using structured prompts with story context and target word count.
- **Completeness Checker**: Evaluates whether the chapter ends at a natural stopping point.
- **Summarizer**: Produces concise chapter summaries and extracts key events.
- **Memory Extractor**: Extracts and stores memories from chapter content into vector store.

### Enhanced World Simulation Infrastructure
- **World State Engine**: Authoritative database tracking characters, locations, objects, relationships, and timeline for logical consistency.
- **Character Agent System**: Intelligent character decision-making with personality, goals, agendas, and relationship dynamics.
- **Event Resolution System**: Systematic processing of character interactions, conflicts, and environmental events.
- **Story Director**: Chapter-level narrative guidance with tension management and objective prioritization.
- **World State Updater**: Automatic extraction and application of world state changes from generated content.
- **Scope-Based Context Management**: Efficient context extraction using graph-based subgraphs and targeted memory filtering.

**Section sources**
- [generateChapter.ts:70-335](file://packages/engine/src/pipeline/generateChapter.ts#L70-L335)
- [scopeBuilder.ts:67-105](file://packages/engine/src/scope/scopeBuilder.ts#L67-L105)
- [worldStateEngine.ts:64-352](file://packages/engine/src/world/worldStateEngine.ts#L64-L352)
- [characterAgent.ts:91-304](file://packages/engine/src/world/characterAgent.ts#L91-L304)
- [storyDirector.ts:100-276](file://packages/engine/src/agents/storyDirector.ts#L100-L276)
- [worldStateUpdater.ts:80-251](file://packages/engine/src/agents/worldStateUpdater.ts#L80-L251)
- [eventResolver.ts:30-272](file://packages/engine/src/world/eventResolver.ts#L30-L272)

## Architecture Overview
The enhanced pipeline now supports sophisticated scope-based context extraction with integrated character decision-making and world state management:

```mermaid
sequenceDiagram
participant CLI as "CLI Command"
participant Engine as "generateChapter"
participant Mode as "Mode Selector"
participant Director as "StoryDirector"
participant Planner as "ScenePlanner"
participant Agents as "CharacterAgentSystem"
participant Scope as "ScopeBuilder"
participant SceneGen as "SceneWriter"
participant WorldUpd as "WorldStateUpdater"
participant Assembler as "SceneAssembler"
participant Outcome as "OutcomeExtractor"
participant LLM as "LLMClient"
CLI->>Engine : "generateChapter(context, options)"
Engine->>Mode : "Check useSceneLevel flag"
alt "Scene-level mode (default)"
Mode->>Director : "direct(context)"
Director->>LLM : "complete(prompt, config)"
LLM-->>Director : "DirectorOutput"
Director-->>Engine : "Chapter direction & objectives"
Mode->>Planner : "planScenes(context, directorOutput)"
Planner->>LLM : "complete(prompt, config)"
LLM-->>Planner : "ScenePlan"
loop "For each scene"
Engine->>Agents : "getDecision(character, context)"
Agents->>LLM : "complete(prompt, config)"
LLM-->>Agents : "CharacterDecision"
Agents-->>Engine : "CharacterDecision[]"
Engine->>Scope : "buildScope(centerCharacters, centerLocation)"
Scope->>LLM : "complete(prompt, config)"
LLM-->>Scope : "ScopeWindow"
Scope-->>Engine : "Targeted context window"
Engine->>SceneGen : "writeScene(scene, decisions, scopeContext)"
SceneGen->>LLM : "complete(prompt, config)"
LLM-->>SceneGen : "sceneContent"
Engine->>WorldUpd : "updateFromScene(content)"
WorldUpd->>LLM : "complete(prompt, config)"
LLM-->>WorldUpd : "WorldStateUpdate"
WorldUpd-->>Engine : "Applied updates"
end
Engine->>Assembler : "assembleChapter(scenes)"
Assembler->>LLM : "complete(prompt, config)"
LLM-->>Assembler : "assembledContent"
Engine->>Outcome : "extractSceneOutcome(scenes)"
Outcome->>LLM : "complete(prompt, config)"
LLM-->>Outcome : "mergedOutcomes"
else "Legacy chapter mode"
Mode->>Engine : "generateChapterLegacy"
Engine->>Writer : "writer.write(context)"
Writer->>LLM : "complete(prompt, config)"
LLM-->>Writer : "content"
end
Engine-->>CLI : "GenerateChapterResult"
```

**Diagram sources**
- [generateChapter.ts:70-335](file://packages/engine/src/pipeline/generateChapter.ts#L70-L335)
- [scopeBuilder.ts:67-105](file://packages/engine/src/scope/scopeBuilder.ts#L67-L105)
- [storyDirector.ts:100-112](file://packages/engine/src/agents/storyDirector.ts#L100-L112)
- [characterAgent.ts:187-210](file://packages/engine/src/world/characterAgent.ts#L187-L210)
- [worldStateUpdater.ts:231-247](file://packages/engine/src/agents/worldStateUpdater.ts#L231-L247)

## Detailed Component Analysis

### Enhanced Dual-Mode GenerateChapter Workflow with Scope-Based Context
The generateChapter function now supports sophisticated scope-based context extraction with integrated character decision-making:

#### Scene-Level Generation with Enhanced Context Management (Primary Mode)
- **Input unpacking and defaults**: Extracts context and applies default scene-level options with useSceneLevel=true and world state engine initialization.
- **Story Director integration**: Consults Story Director for chapter direction, objectives, and tension guidance before scene planning.
- **Character decision orchestration**: Coordinates character decision-making for each scene with personality, goals, and relationship context.
- **Scope-based context extraction**: Creates targeted context windows for each scene using ScopeBuilder with character, location, and relationship-based filtering.
- **Efficient memory filtering**: Uses scope-based queries instead of broad vector searches to extract relevant memories for each scene.
- **World state integration**: Updates World State Engine after each scene with character movements, discoveries, relationship changes, and new events.
- **Event resolution**: Processes character decisions into world events and resolves conflicts systematically.
- **Enhanced scene generation**: Generates scenes with character decision integration and scope-aware context.
- **Assembly and validation**: Combines scenes with world state transitions and validates against canonical facts and world consistency.

#### Legacy Chapter-Level Generation (Fallback Mode)
- **Input unpacking and defaults**: Extracts context and applies default chapter-level options.
- **Initial writing**: Calls the writer to produce the first draft.
- **Continuation loop**: Repeatedly checks completeness and continues until satisfied or attempts exhausted.
- **Optional memory extraction**: Extracts and stores memories from chapter content.
- **Summary generation**: Produces concise chapter summary and key events.
- **Output synthesis**: Builds the Chapter result with metadata and timestamps.

```mermaid
flowchart TD
Start(["Start generateChapter"]) --> CheckMode{"useSceneLevel enabled?"}
CheckMode --> |Yes| InitWorld["Initialize World State Engine"]
InitWorld --> Director["StoryDirector.direct()"]
Director --> PlanScenes["planScenes(context, directorOutput)"]
PlanScenes --> SceneLoop["For each scene in plan"]
SceneLoop --> GetDecisions["CharacterAgentSystem.getDecision()"]
GetDecisions --> BuildScope["ScopeBuilder.buildScope()"]
BuildScope --> FilterMemories["Filter memories by scope"]
FilterMemories --> WriteScene["writeScene(scene, decisions, scopeContext)"]
WriteScene --> UpdateWorld["WorldStateUpdater.updateFromScene()"]
UpdateWorld --> ValidateScene["validateScene(scene)"]
ValidateScene --> ExtractOutcome["extractSceneOutcome(scene)"]
ExtractOutcome --> StoreMemory["Store scene memory"]
StoreMemory --> SceneLoop
SceneLoop --> |All scenes| Assemble["assembleChapter(scenes)"]
Assemble --> MultilingualSum["generateNaturalChapterSummary()"]
MultilingualSum --> CanonValidate["canonValidator.validate(content)"]
CanonValidate --> Build["Build Chapter result"]
CheckMode --> |No| Legacy["generateChapterLegacy(context)"]
Legacy --> Build
Build --> End(["Return GenerateChapterResult"])
```

**Diagram sources**
- [generateChapter.ts:70-335](file://packages/engine/src/pipeline/generateChapter.ts#L70-L335)
- [scopeBuilder.ts:67-105](file://packages/engine/src/scope/scopeBuilder.ts#L67-L105)
- [characterAgent.ts:187-210](file://packages/engine/src/world/characterAgent.ts#L187-L210)
- [worldStateUpdater.ts:231-247](file://packages/engine/src/agents/worldStateUpdater.ts#L231-L247)

**Section sources**
- [generateChapter.ts:40-494](file://packages/engine/src/pipeline/generateChapter.ts#L40-L494)

### Enhanced Scope Builder System
The Scope Builder provides sophisticated context extraction for each scene:

#### Scope Window Construction
- **Character-based scope**: Extracts characters within N hops of center characters using world state relationships.
- **Location-based scope**: Includes locations connected to center characters and their spatial relationships.
- **Object-based scope**: Filters objects discovered by or located with center characters.
- **Graph subgraph extraction**: Builds comprehensive graph representation of relevant narrative entities.
- **Memory filtering**: Uses scope entities as query terms for targeted memory retrieval instead of broad searches.

#### Scope Building Algorithm
- **Breadth-first expansion**: Expands from center characters using BFS algorithm with configurable hop distance.
- **Relationship traversal**: Follows character-location-object relationships to build comprehensive context.
- **Memory relevance scoring**: Filters memories based on scope entity relevance using vector store similarity search.
- **Constraint integration**: Optionally includes relevant constraints from constraint graph for validation.

#### Scope Window Structure
- **characters**: Array of character IDs within scope with location and emotional state context.
- **locations**: Array of location IDs within scope with connection and occupancy information.
- **objects**: Array of object IDs within scope with discovery and location tracking.
- **graphSubgraph**: Complete graph representation with nodes and edges for LLM consumption.
- **relevantMemories**: Filtered memory content relevant to scope entities.
- **constraints**: Constraint violations relevant to scope characters.

**Section sources**
- [scopeBuilder.ts:67-105](file://packages/engine/src/scope/scopeBuilder.ts#L67-L105)
- [scopeBuilder.ts:110-179](file://packages/engine/src/scope/scopeBuilder.ts#L110-L179)
- [scopeBuilder.ts:354-374](file://packages/engine/src/scope/scopeBuilder.ts#L354-L374)
- [scopeBuilder.ts:379-403](file://packages/engine/src/scope/scopeBuilder.ts#L379-L403)

### Enhanced Multilingual Chapter Summary System
The chapter summary generation now supports multiple languages based on story configuration:

#### Language Detection and Support
- **Automatic language detection**: Extracts language from StoryBible.language field for appropriate localization.
- **Supported languages**: English, Chinese, Japanese, Korean, Arabic, Russian, Spanish, French, German.
- **Context-aware formatting**: Generates summaries in the appropriate language with cultural narrative conventions.
- **Fallback mechanism**: Uses first scene summary if LLM fails to generate multilingual summary.

#### Summary Generation Process
- **Scene aggregation**: Collects all scene summaries into cohesive chapter narrative.
- **Narrative flow**: Creates flowing, non-list format summaries focusing on main events and character development.
- **Language-specific prompts**: Uses appropriate language names and cultural conventions in generation prompts.
- **Quality constraints**: Enforces 2-4 sentence limit with specific narrative guidelines.

#### Integration Points
- **Scene-level summaries**: Uses individual scene summaries as foundation for chapter-level synthesis.
- **World state context**: Incorporates world state changes and character developments into summary generation.
- **Validation and fallback**: Implements robust error handling with fallback to scene-based summaries.

**Section sources**
- [generateChapter.ts:448-493](file://packages/engine/src/pipeline/generateChapter.ts#L448-L493)

### Enhanced World State Engine
The World State Engine provides comprehensive world simulation capabilities:

#### Core World State Tracking
- **Characters**: Track alive status, location, known information, emotional state, and goals with automatic location management.
- **Locations**: Manage connected locations, characters present, objects present, and connections for spatial reasoning.
- **Objects**: Track ownership, discovery status, and properties with automatic location updates.
- **Relationships**: Maintain trust levels, hostility levels, and relationship types between characters.
- **Timeline**: Record events with participants, locations, and timestamps for narrative consistency.

#### World State Operations
- **Character Management**: Add characters, move between locations, kill characters, add knowledge, and update emotional states.
- **Location Management**: Add locations, connect locations, and manage spatial relationships.
- **Object Management**: Add objects, move objects, and track discoveries with automatic knowledge updates.
- **Relationship Management**: Set and update relationships with trust/hostility calculations.
- **Event Tracking**: Add events to timeline with participant extraction and location inference.

#### World State Formatting
- **Prompt Formatting**: Convert world state to narrative-friendly format for LLM consumption.
- **Consistency Validation**: Provide helper methods for character knowledge validation, location checks, and relationship queries.

**Section sources**
- [worldStateEngine.ts:64-352](file://packages/engine/src/world/worldStateEngine.ts#L64-L352)

### Character Decision System
The Character Agent System manages intelligent character behavior with both LLM-powered and fallback decision-making:

#### Character Agent Structure
- **Character State**: Name, goals, current goal, location, knowledge, relationships, personality traits, emotional state, inventory, and agenda.
- **Agenda Management**: Priority-based action planning with deadlines and completion tracking.
- **Knowledge and Relationships**: Dynamic updates to character knowledge and relationship states.

#### Decision-Making Capabilities
- **LLM-Powered Decisions**: Sophisticated decision-making considering personality, goals, agenda, knowledge, relationships, and current situation.
- **Fallback Decisions**: Simple decision-making for testing and error scenarios based on agenda items and basic relationship dynamics.
- **Multi-Agent Coordination**: Simultaneous decision-making for multiple characters with context sharing.

#### Decision Context
- **Character Context**: Current character state, other characters present, recent world events, current chapter, and story context.
- **Decision Output**: Action selection, target character/object, reasoning, and potential consequences.

**Section sources**
- [characterAgent.ts:4-304](file://packages/engine/src/world/characterAgent.ts#L4-L304)

### Story Director Integration
The Story Director provides chapter-level narrative guidance:

#### Director Output
- **Overall Goal**: One-sentence description of chapter achievement.
- **Objectives**: Priority-ordered objectives with types (plot, character, world, tension, resolution).
- **Focus Characters**: Characters that should be central to the chapter.
- **Suggested Scenes**: Scene ideas that achieve objectives.
- **Tone**: Emotional tone for the chapter.
- **Notes**: Additional guidance for writers.

#### Director Context
- **Story Bible**: Title, genre, theme, premise, characters, and plot threads.
- **Story State**: Current chapter, total chapters, current tension, active plot threads, and chapter summaries.
- **Structured State**: Organized story state with plot threads, character states, unresolved questions, and recent events.
- **Tension Guidance**: Target tension levels and pacing recommendations.
- **Previous Summaries**: Last 3 chapter summaries for continuity.

#### Fallback Mechanism
- **Automatic Objective Generation**: Fallback objectives based on current story state for testing and error scenarios.

**Section sources**
- [storyDirector.ts:15-276](file://packages/engine/src/agents/storyDirector.ts#L15-L276)

### World State Updater
The World State Updater extracts and applies world state changes from generated content:

#### Update Extraction
- **Character Moves**: Movement between locations with origin/destination tracking.
- **Character Deaths**: Character death notifications with automatic location cleanup.
- **Object Moves**: Object movement and ownership changes.
- **Discoveries**: Object discoveries, location discoveries, and factual knowledge acquisition.
- **Relationship Changes**: Trust and hostility modifications between characters.
- **Emotional Changes**: Character emotional state modifications.
- **New Events**: Significant events that occurred during scenes.

#### Update Application
- **Safe Application**: Robust error handling for failed updates with warnings and graceful degradation.
- **Relationship Calculations**: Proper trust/hostility calculations with bounds checking.
- **Event Creation**: Automatic event creation with participant extraction and location inference.

#### Integration Points
- **Scene-Level Updates**: Applied after each scene generation for immediate world consistency.
- **Chapter-Level Validation**: Used for final chapter validation against world state consistency.

**Section sources**
- [worldStateUpdater.ts:80-251](file://packages/engine/src/agents/worldStateUpdater.ts#L80-L251)

### Event Resolution System
The Event Resolver processes character decisions into systematic world events:

#### Event Categorization
- **Interaction Events**: Character-to-character interactions and conversations.
- **Conflict Events**: Physical or verbal confrontations between characters.
- **Discovery Events**: Object, location, or factual discoveries.
- **Movement Events**: Character location changes.
- **Environmental Events**: Weather, time, or setting changes affecting the scene.

#### Conflict Resolution
- **Capability Scoring**: Based on emotional state and personality traits.
- **Outcome Determination**: Clear winners, compromises, or mixed results.
- **Consequence Tracking**: Damage, advantages, and long-term effects.

#### Resolution Processing
- **Event Processing**: Converts raw character decisions into structured world events.
- **Resolution Application**: Applies event outcomes to world state and character development.
- **Narrative Integration**: Generates narrative descriptions of event resolutions.

**Section sources**
- [eventResolver.ts:30-272](file://packages/engine/src/world/eventResolver.ts#L30-L272)

### Enhanced Scene-Level Generation Components

#### Enhanced Scene Planner
- **Director Integration**: Incorporates Story Director objectives and tension guidance into scene planning.
- **Dynamic Scene Count**: Adjusts scene count based on chapter goals and complexity requirements.
- **Tension Management**: Plans scenes with appropriate tension levels for narrative progression.

#### Scene Writer with Character Decisions and Scope Context
- **Decision Integration**: Incorporates character decisions into scene generation prompts.
- **Scope-aware Context**: Uses targeted scope windows for context enhancement instead of broad memory searches.
- **Context Enhancement**: Uses character knowledge, relationships, and emotional states for context.
- **World State Awareness**: Considers current world state for realistic scene generation.

#### Scene Validator with World Consistency
- **Canon Validation**: Validates against established story facts and canonical constraints.
- **World State Validation**: Checks for logical consistency with current world state.
- **Character Consistency**: Ensures character actions align with their established knowledge and relationships.

#### Scene Outcome Extractor with World Implications
- **Event Tracking**: Identifies significant plot events and their world state implications.
- **Character Development**: Tracks character changes, relationship developments, and knowledge acquisitions.
- **World State Impact**: Documents changes to locations, objects, and relationships resulting from scenes.

**Section sources**
- [generateChapter.ts:125-290](file://packages/engine/src/pipeline/generateChapter.ts#L125-L290)

### Legacy Chapter-Level Components
The legacy components maintain backward compatibility and serve as fallback options:

#### Enhanced Writer Agent
- **Memory Integration**: Enhanced with memory retrieval for context enrichment.
- **Word Count Management**: Improved target achievement and continuation logic.
- **Continuation Strategy**: Robust loop control with configurable attempts and validation.

#### Completeness Checker
- **Reliable Classification**: Optimized for consistent binary assessment.
- **Format Normalization**: Handles varied LLM output formats effectively.
- **Context-Aware Evaluation**: Considers narrative flow and structural coherence.

#### Summarizer
- **Token Budget Management**: Efficient summary generation within constraints.
- **Event Extraction**: Heuristic sentence boundary detection for meaningful summaries.
- **Character Change Tracking**: Extracts character development for story progression.

#### Memory Extractor
- **Semantic Extraction**: Advanced memory extraction with relevance scoring.
- **Categorization System**: Organized memory storage for future retrieval.
- **Vector Embedding**: Enhanced similarity search capabilities.

**Section sources**
- [generateChapter.ts:340-435](file://packages/engine/src/pipeline/generateChapter.ts#L340-L435)

### Enhanced Types and Data Structures
The pipeline now includes comprehensive world simulation and scope-based context type definitions:

#### World Simulation Types
- **WorldState**: Complete world state with characters, locations, objects, relationships, and timeline.
- **WorldCharacter**: Character state with alive status, location, knowledge, and emotional state.
- **WorldLocation**: Location state with connected locations and present characters.
- **WorldObject**: Object state with ownership and discovery tracking.
- **WorldRelationship**: Relationship state with trust and hostility levels.
- **WorldEvent**: Timeline event with participants and location tracking.

#### Character Decision Types
- **CharacterDecision**: Decision structure with action, target, reasoning, and consequences.
- **CharacterAgentContext**: Complete context for character decision-making.
- **AgendaItem**: Priority-based action planning with deadlines.

#### Story Director Types
- **DirectorOutput**: Chapter direction with objectives and suggestions.
- **ChapterObjective**: Structured objectives with priority and type categorization.
- **TensionGuidance**: Target tension levels and pacing recommendations.

#### Scope Builder Types
- **ScopeWindow**: Targeted context window with characters, locations, objects, and relevant memories.
- **GraphSubgraph**: Extracted graph subset with nodes and edges for LLM consumption.
- **ScopeBuilderOptions**: Configuration for scope window construction with hop distance and memory limits.

#### Enhanced Result Structures
- **GenerateChapterResult**: Extended with world state updates and character decision tracking.
- **WorldStateUpdate**: Structured world state change extraction with validation.

**Section sources**
- [index.ts:117-152](file://packages/engine/src/types/index.ts#L117-L152)
- [worldStateEngine.ts:9-62](file://packages/engine/src/world/worldStateEngine.ts#L9-L62)
- [characterAgent.ts:25-39](file://packages/engine/src/world/characterAgent.ts#L25-L39)
- [storyDirector.ts:6-23](file://packages/engine/src/agents/storyDirector.ts#L6-L23)
- [worldStateUpdater.ts:12-28](file://packages/engine/src/agents/worldStateUpdater.ts#L12-L28)
- [scopeBuilder.ts:12-47](file://packages/engine/src/scope/scopeBuilder.ts#L12-L47)

### Enhanced Memory and Vector Store Integration
Enhanced memory management supports both scene-level and chapter-level operations with scope-based context extraction:

- **Vector Store**: Provides semantic memory storage with similarity search capabilities.
- **Memory Retriever**: Enables contextual memory retrieval for scene planning and generation.
- **Scope-based Filtering**: Uses scope entities as query terms for targeted memory extraction instead of broad searches.
- **Scene Memory Storage**: Stores individual scene summaries and outcomes with world state context.
- **World State Memory**: Integrates world state changes into memory system for consistency tracking.
- **Memory Extraction**: Extracts meaningful story elements with world state implications for persistent storage.

**Section sources**
- [generateChapter.ts:267-276](file://packages/engine/src/pipeline/generateChapter.ts#L267-L276)
- [scopeBuilder.ts:354-374](file://packages/engine/src/scope/scopeBuilder.ts#L354-L374)
- [worldStateUpdater.ts:231-247](file://packages/engine/src/agents/worldStateUpdater.ts#L231-L247)

## Dependency Analysis
The enhanced pipeline exhibits sophisticated integration of scope-based context extraction with dual-mode architecture:

```mermaid
graph LR
CLI["CLI generate.ts"] --> API["engine/index.ts exports"]
API --> Gen["generateChapter.ts"]
API --> SB["scopeBuilder.ts"]
Gen --> SceneMode["Scene-level Mode"]
Gen --> LegacyMode["Legacy Mode"]
SceneMode --> Director["storyDirector.ts"]
SceneMode --> SP["scenePlanner.ts"]
SceneMode --> Agents["characterAgent.ts"]
SceneMode --> SW["sceneWriter.ts"]
SceneMode --> WorldUpd["worldStateUpdater.ts"]
SceneMode --> WSE["worldStateEngine.ts"]
SceneMode --> EV["eventResolver.ts"]
SceneMode --> Scope["ScopeBuilder"]
Scope --> WSE
Scope --> VS["memory/vectorStore.ts"]
LegacyMode --> W["writer.ts"]
LegacyMode --> CC["completeness.ts"]
LegacyMode --> S["summarizer.ts"]
LegacyMode --> ME["memoryExtractor.ts"]
Director --> LLM["client.ts"]
Agents --> LLM
SW --> LLM
WorldUpd --> LLM
WSE --> LLM
EV --> LLM
SP --> LLM
W --> LLM
CC --> LLM
S --> LLM
ME --> LLM
Gen --> Types["types/index.ts"]
Gen --> Canon["memory/canonStore.ts"]
Gen --> VS
Gen --> MR["memory/memoryRetriever.ts"]
Gen --> Story["story/bible.ts"]
Gen --> State["story/state.ts"]
SB --> Types
SB --> Canon
SB --> VS
SB --> MR
```

**Diagram sources**
- [generateChapter.ts:1-494](file://packages/engine/src/pipeline/generateChapter.ts#L1-L494)
- [scopeBuilder.ts:1-480](file://packages/engine/src/scope/scopeBuilder.ts#L1-L480)
- [index.ts:1-151](file://packages/engine/src/index.ts#L1-L151)

**Section sources**
- [generateChapter.ts:1-494](file://packages/engine/src/pipeline/generateChapter.ts#L1-L494)

## Performance Considerations
Enhanced performance considerations for sophisticated scope-based context extraction:

- **Token budgets**: Scene-level generation with scope-based context extraction may require higher token budgets due to multiple validation steps and world state formatting.
- **Scope complexity**: Scope Builder operations scale with number of characters, locations, and objects within the scope window, requiring efficient graph traversal algorithms.
- **Memory filtering efficiency**: Scope-based memory filtering reduces vector store search complexity from O(n) to O(k) where k << n for relevant memories.
- **Character decision parallelization**: Character decision-making can be parallelized while maintaining world state consistency.
- **Event resolution optimization**: Event resolution can be batched and processed efficiently for multiple characters.
- **World state caching**: World State Engine can cache frequently accessed data to reduce computational overhead.
- **Tension calculation**: Story Director tension analysis provides efficient guidance without excessive computational cost.
- **Logging and monitoring**: Enhanced logging tracks scope building, world state updates, character decisions, and event resolutions with detailed timing information.

## Troubleshooting Guide
Enhanced troubleshooting for sophisticated scope-based context extraction:

### Scope Builder Issues
- **Scope construction failures**: Verify center characters and locations exist in world state before building scope windows.
- **Memory filtering problems**: Check vector store initialization and ensure scope entities are properly formatted for query terms.
- **Graph traversal errors**: Monitor BFS algorithm for infinite loops and handle edge cases in character-location-object relationships.
- **Performance bottlenecks**: Profile scope building operations and optimize for large numbers of characters and complex relationships.

### World State Engine Issues
- **Initialization failures**: Verify story ID consistency and ensure proper World State Engine initialization before scene generation.
- **State corruption**: Check for proper serialization/deserialization and handle world state loading errors gracefully.
- **Inconsistent state**: Monitor world state updates for logical consistency and handle edge cases in character movements and object ownership.
- **Performance bottlenecks**: Profile world state operations and optimize for large numbers of characters and complex relationships.

### Character Decision System Issues
- **Decision failures**: Verify character context completeness and ensure adequate personality and relationship data for decision-making.
- **LLM integration problems**: Check LLM provider configuration and handle decision fallback scenarios gracefully.
- **Multi-agent coordination**: Ensure proper context sharing between characters and handle decision conflicts appropriately.

### Story Director Issues
- **Objective generation failures**: Verify story state consistency and ensure adequate context for director guidance.
- **Tension calculation problems**: Check tension analysis inputs and handle edge cases in target tension computation.
- **Fallback mechanism**: Ensure fallback objectives are generated correctly when LLM calls fail.

### World State Updater Issues
- **Update extraction failures**: Verify scene content quality and handle malformed JSON responses from LLM extraction.
- **Application errors**: Check world state update application with proper error handling and rollback mechanisms.
- **Consistency validation**: Monitor world state consistency and handle violations appropriately.

### Event Resolution Issues
- **Event categorization problems**: Verify event type classification and handle ambiguous action descriptions.
- **Conflict resolution failures**: Check conflict resolution logic and handle edge cases in character capability scoring.
- **Resolution processing errors**: Ensure proper event resolution application and handle partial resolution scenarios.

### Multilingual Summary Issues
- **Language detection failures**: Verify StoryBible.language field contains valid language codes and handle unsupported languages gracefully.
- **Summary generation errors**: Check LLM provider configuration for multilingual support and handle fallback scenarios.
- **Cultural narrative issues**: Ensure generated summaries respect cultural conventions and narrative expectations.

### Legacy Chapter-Level Issues
- **JSON parsing failures**: Legacy validators fall back to safe defaults when JSON parsing fails. Verify prompt formatting and provider response stability.
- **Incomplete chapters**: The pipeline continues until completion or attempts are exhausted. Adjust target word count or increase maxContinuationAttempts.
- **Canon violations**: Review reported violations and update canonical facts accordingly. Consider disabling validation temporarily for experimentation.

### Common Dual-Mode Issues
- **Mode selection confusion**: Verify useSceneLevel flag and targetSceneCount settings. Scene-level mode is default but can be disabled for compatibility.
- **Memory store configuration**: Ensure vector store is properly initialized before enabling memory retrieval features.
- **Provider misconfiguration**: Verify environment variables for provider and API keys. The LLM client handles both scene-level and chapter-level prompts.
- **CLI errors**: The CLI handles both generation modes seamlessly. Check mode-specific configuration options and logging output.

**Section sources**
- [generateChapter.ts:92-102](file://packages/engine/src/pipeline/generateChapter.ts#L92-L102)
- [scopeBuilder.ts:354-374](file://packages/engine/src/scope/scopeBuilder.ts#L354-L374)
- [characterAgent.ts:288-297](file://packages/engine/src/world/characterAgent.ts#L288-L297)
- [worldStateUpdater.ts:113-128](file://packages/engine/src/agents/worldStateUpdater.ts#L113-L128)
- [eventResolver.ts:237-249](file://packages/engine/src/world/eventResolver.ts#L237-L249)

## Conclusion
The enhanced generation pipeline now provides a sophisticated scope-based context extraction framework supporting both scene-level and chapter-level generation approaches. The integration of Scope Builder, World State Engine, Character Agent System, Story Director, and Event Resolver creates a comprehensive narrative world management system that ensures logical consistency and rich character interactions. The new scope-based context extraction replaces broad memory searches with targeted context windows, significantly improving performance and relevance. Multilingual chapter summary generation enhances internationalization support with automatic language detection and culturally appropriate narrative conventions. Scene-level generation serves as the primary method with intelligent character decision-making, scope-aware context extraction, world state updates, and systematic event resolution capabilities. Legacy chapter-level generation maintains backward compatibility while the enhanced type system, memory management, and scope-based context extraction provide improved story consistency and contextual awareness. The modular design enables easy extension, testing, and debugging across both generation modes, while the CLI and tests demonstrate practical usage patterns for both approaches with sophisticated scope-based context management capabilities.

## Appendices

### Enhanced GenerateChapterOptions and Result Structures
- **GenerateChapterOptions** (Enhanced)
  - Fields: canon, vectorStore, validateCanon, maxContinuationAttempts, retrieveMemories, useSceneLevel, targetSceneCount, worldStateEngine
  - Defaults: validateCanon true, maxContinuationAttempts 3, useSceneLevel true, targetSceneCount 4
  - New: worldStateEngine for external World State Engine integration
- **GenerateChapterResult** (Enhanced)
  - Fields: chapter, summary, violations, memoriesExtracted
  - Additional: world state updates and character decision tracking
- **Scope Builder Types** (New)
  - ScopeWindow: Targeted context window with characters, locations, objects, and relevant memories
  - GraphSubgraph: Extracted graph subset with nodes and edges for LLM consumption
  - ScopeBuilderOptions: Configuration for scope window construction with hop distance and memory limits
  - World Simulation Types: Complete world state with characters, locations, objects, relationships, timeline
  - CharacterDecision: Decision structure with action, target, reasoning, consequences
  - WorldStateUpdate: Structured world state change extraction
  - EventResolution: Event outcome with consequences and new events

**Section sources**
- [generateChapter.ts:29-38](file://packages/engine/src/pipeline/generateChapter.ts#L29-L38)
- [generateChapter.ts:22-27](file://packages/engine/src/pipeline/generateChapter.ts#L22-L27)
- [scopeBuilder.ts:12-47](file://packages/engine/src/scope/scopeBuilder.ts#L12-L47)
- [worldStateEngine.ts:52-62](file://packages/engine/src/world/worldStateEngine.ts#L52-L62)
- [characterAgent.ts:25-31](file://packages/engine/src/world/characterAgent.ts#L25-L31)
- [worldStateUpdater.ts:12-20](file://packages/engine/src/agents/worldStateUpdater.ts#L12-L20)

### Parameter Configuration Examples
- **Scene-level configuration**: Enable scene-level generation with targetSceneCount=6 for complex chapters requiring detailed breakdown and world simulation.
- **Scope-based context**: Configure scopeBuilder with maxHops=2 and maxMemories=8 for balanced context extraction.
- **World state integration**: Configure worldStateEngine for external World State Engine management and persistent world state tracking.
- **Character decision configuration**: Enable character decision passing with personality and relationship integration for rich narrative interactions.
- **Multilingual support**: Ensure StoryBible.language field contains valid language codes for automatic multilingual summary generation.
- **Legacy configuration**: Disable scene-level mode with useSceneLevel=false for compatibility with existing workflows.
- **Memory integration**: Configure vectorStore for contextual memory retrieval and scene memory storage with scope-based filtering.
- **CLI usage**: The CLI supports both modes through configuration flags and automatically selects appropriate generation approach with scope-based context management.

**Section sources**
- [generateChapter.ts:92-102](file://packages/engine/src/pipeline/generateChapter.ts#L92-L102)
- [generateChapter.ts:29-38](file://packages/engine/src/pipeline/generateChapter.ts#L29-L38)
- [scopeBuilder.ts:41-47](file://packages/engine/src/scope/scopeBuilder.ts#L41-L47)
- [generate.ts](file://apps/cli/src/commands/generate.ts)

### Extensibility and Custom Processing Steps
- **Add new scope builders**: Implement custom scope building algorithms with specialized filtering criteria for domain-specific contexts.
- **Modify character decision logic**: Update character agent system to handle new decision-making patterns and personality traits.
- **Extend world state validation**: Add new validation dimensions for world-specific constraints beyond canonical facts.
- **Custom event resolution**: Develop domain-specific event resolution for specialized story elements and conflict types.
- **Hybrid generation approaches**: Combine scene-level and chapter-level techniques with scope-based context extraction for optimal narrative structure.
- **Memory enhancement**: Extend memory extraction to capture richer contextual information with scope-based relevance scoring.
- **World state persistence**: Implement custom world state serialization and deserialization for external storage systems.
- **Multilingual expansion**: Add support for additional languages in the multilingual summary system with appropriate cultural conventions.

**Section sources**
- [generateChapter.ts:70-335](file://packages/engine/src/pipeline/generateChapter.ts#L70-L335)
- [scopeBuilder.ts:67-105](file://packages/engine/src/scope/scopeBuilder.ts#L67-L105)
- [worldStateEngine.ts:64-352](file://packages/engine/src/world/worldStateEngine.ts#L64-L352)
- [characterAgent.ts:91-304](file://packages/engine/src/world/characterAgent.ts#L91-L304)
- [worldStateUpdater.ts:80-251](file://packages/engine/src/agents/worldStateUpdater.ts#L80-L251)

### Debugging Strategies for Generation Failures
- **Mode diagnostics**: Verify useSceneLevel flag and targetSceneCount settings for appropriate mode selection.
- **Scope diagnostics**: Monitor scope building operations and handle scope construction failures with detailed logging.
- **World state diagnostics**: Monitor world state updates and handle consistency violations with detailed logging.
- **Character decision debugging**: Isolate character decision failures and verify context completeness.
- **Story director diagnostics**: Check director output quality and handle fallback scenarios gracefully.
- **Event resolution debugging**: Trace event categorization and resolution processes for systematic troubleshooting.
- **Multilingual debugging**: Verify language detection and handle unsupported languages gracefully.
- **Memory diagnostics**: Check vector store initialization and scope-based memory filtering for contextual enhancement.
- **Performance profiling**: Track token usage, scope building operations, world state operations, and generation time for both scene-level and chapter-level approaches.
- **Backward compatibility**: Test legacy mode for compatibility with existing workflows and data structures.
- **Error isolation**: Use separate logging channels for scene-level, scope-based, world state, and chapter-level operations to identify failure points.

**Section sources**
- [generateChapter.ts:92-102](file://packages/engine/src/pipeline/generateChapter.ts#L92-L102)
- [scopeBuilder.ts:354-374](file://packages/engine/src/scope/scopeBuilder.ts#L354-L374)
- [characterAgent.ts:288-297](file://packages/engine/src/world/characterAgent.ts#L288-L297)
- [worldStateUpdater.ts:113-128](file://packages/engine/src/agents/worldStateUpdater.ts#L113-L128)
- [eventResolver.ts:237-249](file://packages/engine/src/world/eventResolver.ts#L237-L249)