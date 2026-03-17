# Enhanced Scene Writing System

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [packages/engine/src/index.ts](file://packages/engine/src/index.ts)
- [packages/engine/src/agents/sceneWriter.ts](file://packages/engine/src/agents/sceneWriter.ts)
- [packages/engine/src/agents/scenePlanner.ts](file://packages/engine/src/agents/scenePlanner.ts)
- [packages/engine/src/agents/storyDirector.ts](file://packages/engine/src/agents/storyDirector.ts)
- [packages/engine/src/agents/chapterPlanner.ts](file://packages/engine/src/agents/chapterPlanner.ts)
- [packages/engine/src/pipeline/generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts)
- [packages/engine/src/types/index.ts](file://packages/engine/src/types/index.ts)
- [packages/engine/src/agents/tensionController.ts](file://packages/engine/src/agents/tensionController.ts)
- [packages/engine/src/memory/memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts)
- [packages/engine/src/world/characterAgent.ts](file://packages/engine/src/world/characterAgent.ts)
- [packages/engine/src/scene/sceneAssembler.ts](file://packages/engine/src/scene/sceneAssembler.ts)
- [apps/cli/src/index.ts](file://apps/cli/src/index.ts)
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts)
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts)
- [apps/cli/src/commands/status.ts](file://apps/cli/src/commands/status.ts)
</cite>

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
The Enhanced Scene Writing System is an AI-native narrative engine designed to generate long-form stories with persistent memory, autonomous world simulation, and logical consistency enforcement. It transforms story creation from linear text generation into a sophisticated, multi-agent pipeline that plans, executes, validates, and evolves narratives across chapters and scenes.

The system operates on the principle that stories are living systems, not static texts. It maintains a hierarchical memory architecture inspired by human storytelling cognition, ensuring continuity, coherence, and logical consistency across extended narratives.

## Project Structure
The project follows a modular monorepo architecture with clear separation between the CLI interface and the core narrative engine:

```mermaid
graph TB
subgraph "CLI Layer"
CLI[nos CLI]
Commands[Command Handlers]
Config[Configuration Store]
end
subgraph "Engine Layer"
Pipeline[Generation Pipeline]
Agents[AI Agents]
Memory[Memory Systems]
World[World Simulation]
Types[Type Definitions]
end
subgraph "Data Layer"
VectorStore[Vector Memory]
CanonStore[Canon Memory]
StateStore[Structured State]
ConstraintGraph[Constraint Graph]
end
CLI --> Commands
Commands --> Pipeline
Pipeline --> Agents
Pipeline --> Memory
Pipeline --> World
Agents --> Memory
Agents --> World
Memory --> VectorStore
Memory --> CanonStore
World --> StateStore
World --> ConstraintGraph
```

**Diagram sources**
- [apps/cli/src/index.ts:1-177](file://apps/cli/src/index.ts#L1-L177)
- [packages/engine/src/index.ts:1-151](file://packages/engine/src/index.ts#L1-L151)

The system consists of two main packages:
- **@narrative-os/cli**: Command-line interface for story creation and management
- **@narrative-os/engine**: Core narrative engine with AI agents and memory systems

**Section sources**
- [README.md:197-212](file://README.md#L197-L212)
- [apps/cli/src/index.ts:1-177](file://apps/cli/src/index.ts#L1-L177)
- [packages/engine/src/index.ts:1-151](file://packages/engine/src/index.ts#L1-L151)

## Core Components
The Enhanced Scene Writing System comprises several interconnected components that work together to create coherent, consistent narratives:

### AI Agents
The system employs specialized AI agents that handle different aspects of narrative generation:

- **StoryDirector**: Analyzes story state and generates chapter objectives
- **ChapterPlanner**: Converts objectives into detailed scene-by-scene outlines
- **ScenePlanner**: Creates individual scene breakdowns with specific purposes
- **SceneWriter**: Generates immersive narrative prose for each scene
- **TensionController**: Manages narrative arc and pacing across chapters

### Memory Systems
A hierarchical memory architecture ensures narrative consistency and coherence:

- **VectorStore**: HNSW-based semantic memory retrieval
- **CanonStore**: Immutable facts that must never be contradicted
- **StructuredState**: Real-time tracking of character emotions, locations, and knowledge
- **ConstraintGraph**: Knowledge graph enforcing logical consistency

### World Simulation
Autonomous character agents with goals and agendas drive narrative development:

- **CharacterAgentSystem**: Individual character decision-making
- **WorldStateEngine**: Persistent world state management
- **EventResolver**: Handles character interactions and consequences

**Section sources**
- [README.md:36-46](file://README.md#L36-L46)
- [packages/engine/src/agents/storyDirector.ts:134-320](file://packages/engine/src/agents/storyDirector.ts#L134-L320)
- [packages/engine/src/agents/chapterPlanner.ts:110-326](file://packages/engine/src/agents/chapterPlanner.ts#L110-L326)
- [packages/engine/src/agents/scenePlanner.ts:18-228](file://packages/engine/src/agents/scenePlanner.ts#L18-L228)
- [packages/engine/src/agents/sceneWriter.ts:20-198](file://packages/engine/src/agents/sceneWriter.ts#L20-L198)

## Architecture Overview
The Enhanced Scene Writing System implements a sophisticated multi-agent architecture that orchestrates narrative generation through coordinated AI agents:

```mermaid
sequenceDiagram
participant CLI as CLI Interface
participant Director as StoryDirector
participant Planner as ChapterPlanner
participant ScenePlanner as ScenePlanner
participant Writer as SceneWriter
participant Memory as Memory Systems
participant World as World Simulation
participant Validator as Validators
CLI->>Director : Request chapter direction
Director->>Director : Analyze story state
Director->>Planner : Generate objectives
Planner->>ScenePlanner : Create scene plan
ScenePlanner->>Writer : Plan scene structure
Writer->>Memory : Retrieve contextual memories
Writer->>World : Consider character decisions
Writer->>Writer : Generate scene content
Writer->>Validator : Validate against canon
Validator-->>Writer : Report violations
Writer-->>ScenePlanner : Return scene output
ScenePlanner-->>Planner : Complete scene plan
Planner-->>Director : Final chapter outline
Director-->>CLI : Deliver chapter direction
```

**Diagram sources**
- [packages/engine/src/pipeline/generateChapter.ts:71-355](file://packages/engine/src/pipeline/generateChapter.ts#L71-L355)
- [packages/engine/src/agents/storyDirector.ts:134-320](file://packages/engine/src/agents/storyDirector.ts#L134-L320)
- [packages/engine/src/agents/chapterPlanner.ts:110-326](file://packages/engine/src/agents/chapterPlanner.ts#L110-L326)
- [packages/engine/src/agents/scenePlanner.ts:18-228](file://packages/engine/src/agents/scenePlanner.ts#L18-L228)
- [packages/engine/src/agents/sceneWriter.ts:20-198](file://packages/engine/src/agents/sceneWriter.ts#L20-L198)

The architecture follows a pipeline pattern where each stage builds upon the previous one, ensuring narrative coherence and logical consistency. The system maintains persistence through structured state updates and memory extraction, allowing stories to evolve organically across chapters.

**Section sources**
- [README.md:20-34](file://README.md#L20-L34)
- [packages/engine/src/pipeline/generateChapter.ts:41-65](file://packages/engine/src/pipeline/generateChapter.ts#L41-L65)

## Detailed Component Analysis

### Scene Planning System
The scene planning system represents the heart of the Enhanced Scene Writing System, transforming high-level chapter objectives into detailed scene breakdowns:

```mermaid
flowchart TD
Start([Chapter Direction Received]) --> AnalyzeState["Analyze Story State"]
AnalyzeState --> CalculateProgress["Calculate Story Progress"]
CalculateProgress --> DetermineScenes["Determine Scene Count<br/>Setup: 5 scenes<br/>Early: 6-7 scenes<br/>Middle: 7-8 scenes<br/>Pre-climax: 6-7 scenes<br/>Final: 5 scenes"]
DetermineScenes --> BuildPrompt["Build Scene Planning Prompt"]
BuildPrompt --> GeneratePlan["Generate Scene Plan via LLM"]
GeneratePlan --> ValidatePlan{"Plan Valid?"}
ValidatePlan --> |Yes| CreateScenes["Create Scene Objects"]
ValidatePlan --> |No| FallbackPlan["Create Fallback Scene Plan"]
FallbackPlan --> CreateScenes
CreateScenes --> ReturnPlan["Return Scene Plan"]
ReturnPlan --> End([Planning Complete])
```

**Diagram sources**
- [packages/engine/src/agents/scenePlanner.ts:18-166](file://packages/engine/src/agents/scenePlanner.ts#L18-L166)
- [packages/engine/src/agents/chapterPlanner.ts:110-326](file://packages/engine/src/agents/chapterPlanner.ts#L110-L326)

The scene planning process considers story progress, character dynamics, and narrative structure to create appropriate scene counts and arrangements. The system adapts scene complexity based on story phase, ensuring optimal narrative development throughout the story arc.

**Section sources**
- [packages/engine/src/agents/scenePlanner.ts:18-166](file://packages/engine/src/agents/scenePlanner.ts#L18-L166)
- [packages/engine/src/agents/chapterPlanner.ts:110-326](file://packages/engine/src/agents/chapterPlanner.ts#L110-L326)

### Scene Writing Engine
The scene writing engine transforms planned scenes into immersive narrative prose through sophisticated prompting and validation:

```mermaid
classDiagram
class SceneWriter {
+writeScene(input) SceneOutput
-buildPrompt() string
-parseResponse() SceneOutput
-createFallbackScene() SceneOutput
}
class SceneInput {
+Scene scene
+StoryBible bible
+StoryState state
+number chapterNumber
+string[] relevantMemories
+string[] characterDecisions
}
class SceneOutput {
+string content
+string summary
+number wordCount
}
class MemoryRetriever {
+retrieveForChapter() RetrievedMemory[]
+formatMemoriesForPrompt() string
}
class CharacterAgentSystem {
+getDecision() CharacterDecision
+simulateTurn() CharacterDecision[]
}
SceneWriter --> SceneInput : uses
SceneWriter --> SceneOutput : produces
SceneWriter --> MemoryRetriever : queries
SceneWriter --> CharacterAgentSystem : coordinates
```

**Diagram sources**
- [packages/engine/src/agents/sceneWriter.ts:20-198](file://packages/engine/src/agents/sceneWriter.ts#L20-L198)
- [packages/engine/src/memory/memoryRetriever.ts:18-174](file://packages/engine/src/memory/memoryRetriever.ts#L18-L174)
- [packages/engine/src/world/characterAgent.ts:91-304](file://packages/engine/src/world/characterAgent.ts#L91-L304)

The scene writing process incorporates multiple contextual factors including character decisions, relevant memories, and narrative tension. The system maintains strict quality standards, validating output against canonical facts and ensuring coherent narrative flow.

**Section sources**
- [packages/engine/src/agents/sceneWriter.ts:20-198](file://packages/engine/src/agents/sceneWriter.ts#L20-L198)
- [packages/engine/src/memory/memoryRetriever.ts:18-174](file://packages/engine/src/memory/memoryRetriever.ts#L18-L174)
- [packages/engine/src/world/characterAgent.ts:91-304](file://packages/engine/src/world/characterAgent.ts#L91-L304)

### Tension Management System
The tension management system enforces narrative arc consistency through mathematical modeling and adaptive guidance:

```mermaid
flowchart TD
Start([Analyze Current State]) --> CalculateTarget["Calculate Target Tension<br/>Formula: 4 × progress × (1 - progress)"]
CalculateTarget --> CompareTension["Compare Current vs Target"]
CompareTension --> Decision{"Tension Gap Analysis"}
Decision --> |Below -0.2| Escalate["Escalate: Increase Dramatic Tension"]
Decision --> |Between -0.15 and 0.2| Maintain["Maintain: Keep Current Tension Level"]
Decision --> |Above 0.85| Climax["Climax: Build Toward Peak Tension"]
Decision --> |Final Chapter| Resolve["Resolve: Begin Resolving Tensions"]
Escalate --> GenerateGuidance["Generate Escalation Guidance"]
Maintain --> GenerateGuidance
Climax --> GenerateGuidance
Resolve --> GenerateGuidance
GenerateGuidance --> SelectScenes["Select Appropriate Scene Types"]
SelectScenes --> SetPacing["Set Pacing Notes"]
SetPacing --> ReturnGuidance["Return Tension Guidance"]
ReturnGuidance --> End([Tension Control Complete])
```

**Diagram sources**
- [packages/engine/src/agents/tensionController.ts:28-149](file://packages/engine/src/agents/tensionController.ts#L28-L149)

The tension system implements a parabolic curve formula that creates natural dramatic arcs, peaking at the story's midpoint and resolving at the conclusion. This mathematical approach ensures narrative engagement while maintaining logical consistency.

**Section sources**
- [packages/engine/src/agents/tensionController.ts:28-149](file://packages/engine/src/agents/tensionController.ts#L28-L149)

### Memory Integration System
The memory integration system provides contextual awareness through semantic retrieval and narrative context:

```mermaid
graph LR
subgraph "Memory Retrieval"
Query[Contextual Query Generation]
Vector[Vector Similarity Search]
Filter[Filter by Chapter Number]
Rerank[Rerank by Relevance]
end
subgraph "Memory Categories"
Event[Event Memories]
Character[Character Memories]
World[World-Building]
Plot[Plot-Relevant]
end
subgraph "Integration Points"
SceneWriter[Scene Writer]
Planner[Scene Planner]
Director[Story Director]
end
Query --> Vector
Vector --> Filter
Filter --> Rerank
Rerank --> CategoryGroup["Group by Category"]
CategoryGroup --> Event
CategoryGroup --> Character
CategoryGroup --> World
CategoryGroup --> Plot
Event --> SceneWriter
Character --> SceneWriter
World --> SceneWriter
Plot --> SceneWriter
Event --> Planner
Character --> Planner
World --> Planner
Plot --> Planner
Event --> Director
Character --> Director
World --> Director
Plot --> Director
```

**Diagram sources**
- [packages/engine/src/memory/memoryRetriever.ts:25-102](file://packages/engine/src/memory/memoryRetriever.ts#L25-L102)

The memory system enables contextual awareness by retrieving relevant past events, character developments, and world-building details. This ensures narrative consistency while preventing characters from accessing future knowledge.

**Section sources**
- [packages/engine/src/memory/memoryRetriever.ts:25-102](file://packages/engine/src/memory/memoryRetriever.ts#L25-L102)

### Character Decision System
The character decision system simulates autonomous character behavior through sophisticated AI reasoning:

```mermaid
sequenceDiagram
participant Planner as Scene Planner
participant AgentSys as CharacterAgentSystem
participant Character as Character Agent
participant OtherChars as Other Characters
participant WorldEvents as Recent Events
Planner->>AgentSys : Request Character Decisions
AgentSys->>Character : Create Agent from CharacterState
AgentSys->>OtherChars : Prepare Other Character Context
AgentSys->>WorldEvents : Gather Recent Events
AgentSys->>AgentSys : Build Decision Context
loop For Each Character
AgentSys->>Character : Get Decision
Character->>Character : Analyze Personality & Goals
Character->>Character : Consider Relationships
Character->>Character : Evaluate Current Situation
Character->>Character : Generate Action
Character-->>AgentSys : Return CharacterDecision
end
AgentSys-->>Planner : Return All Decisions
Planner-->>Planner : Integrate into Scene Planning
```

**Diagram sources**
- [packages/engine/src/world/characterAgent.ts:187-210](file://packages/engine/src/world/characterAgent.ts#L187-L210)
- [packages/engine/src/world/characterAgent.ts:270-300](file://packages/engine/src/world/characterAgent.ts#L270-L300)

The character decision system creates believable character actions by considering personality traits, emotional states, relationships, and current circumstances. This autonomy enhances narrative authenticity and reader engagement.

**Section sources**
- [packages/engine/src/world/characterAgent.ts:187-210](file://packages/engine/src/world/characterAgent.ts#L187-L210)
- [packages/engine/src/world/characterAgent.ts:270-300](file://packages/engine/src/world/characterAgent.ts#L270-L300)

## Dependency Analysis
The Enhanced Scene Writing System exhibits strong modularity with well-defined dependencies between components:

```mermaid
graph TB
subgraph "Core Dependencies"
Types[Type Definitions]
LLM[LLM Client]
Memory[Memory Systems]
World[World Simulation]
end
subgraph "Agent Layer"
StoryDirector[StoryDirector]
ChapterPlanner[ChapterPlanner]
ScenePlanner[ScenePlanner]
SceneWriter[SceneWriter]
TensionController[TensionController]
end
subgraph "Pipeline Layer"
GenerateChapter[GenerateChapter]
SceneAssembler[SceneAssembler]
end
subgraph "CLI Layer"
CLI[nos CLI]
Commands[Command Handlers]
end
Types --> StoryDirector
Types --> ChapterPlanner
Types --> ScenePlanner
Types --> SceneWriter
Types --> TensionController
Types --> GenerateChapter
Types --> SceneAssembler
LLM --> StoryDirector
LLM --> ChapterPlanner
LLM --> ScenePlanner
LLM --> SceneWriter
LLM --> TensionController
Memory --> GenerateChapter
World --> GenerateChapter
StoryDirector --> ChapterPlanner
ChapterPlanner --> ScenePlanner
ScenePlanner --> SceneWriter
SceneWriter --> SceneAssembler
GenerateChapter --> CLI
CLI --> Commands
```

**Diagram sources**
- [packages/engine/src/index.ts:1-151](file://packages/engine/src/index.ts#L1-L151)
- [packages/engine/src/pipeline/generateChapter.ts:1-40](file://packages/engine/src/pipeline/generateChapter.ts#L1-L40)

The dependency structure demonstrates clear separation of concerns with minimal circular dependencies. Each component has specific responsibilities, enabling maintainability and extensibility.

**Section sources**
- [packages/engine/src/index.ts:1-151](file://packages/engine/src/index.ts#L1-L151)
- [packages/engine/src/pipeline/generateChapter.ts:1-40](file://packages/engine/src/pipeline/generateChapter.ts#L1-L40)

## Performance Considerations
The Enhanced Scene Writing System implements several performance optimization strategies:

### Memory Efficiency
- **HNSW Vector Search**: O(log n) semantic memory retrieval using Hierarchical Navigable Small World graphs
- **Incremental Memory Loading**: Vector stores are initialized only when needed
- **Memory Filtering**: Automatic exclusion of future chapter memories prevents temporal inconsistencies

### Computational Optimization
- **Modular Processing**: Each agent operates independently, enabling parallel execution where possible
- **Fallback Mechanisms**: Robust fallback systems ensure generation continues even when LLM calls fail
- **Selective Validation**: Optional validation modes reduce computational overhead during development

### Resource Management
- **Memory Retrieval Limits**: Configurable limits on retrieved memories prevent excessive memory usage
- **Token Management**: Careful control of LLM token usage optimizes cost and performance
- **State Persistence**: Efficient serialization minimizes I/O overhead

## Troubleshooting Guide
Common issues and their solutions in the Enhanced Scene Writing System:

### Generation Failures
**Issue**: Scene generation fails with validation errors
**Solution**: Check canon store for conflicting facts and adjust scene planning parameters

**Issue**: Memory retrieval returns irrelevant results  
**Solution**: Improve contextual query generation and adjust similarity thresholds

**Issue**: Character decisions seem inconsistent
**Solution**: Review character personality profiles and relationship matrices

### Performance Issues
**Issue**: Slow generation times
**Solution**: Reduce target scene count, disable optional validations, or upgrade hardware

**Issue**: Memory usage increases rapidly
**Solution**: Implement memory cleanup policies and optimize vector store configuration

### Integration Problems
**Issue**: CLI commands fail to execute
**Solution**: Verify LLM provider configuration and API credentials

**Issue**: Story state corruption
**Solution**: Implement backup strategies and validate state serialization

**Section sources**
- [packages/engine/src/agents/sceneWriter.ts:138-144](file://packages/engine/src/agents/sceneWriter.ts#L138-L144)
- [packages/engine/src/agents/scenePlanner.ts:160-166](file://packages/engine/src/agents/scenePlanner.ts#L160-L166)
- [packages/engine/src/pipeline/generateChapter.ts:377-389](file://packages/engine/src/pipeline/generateChapter.ts#L377-L389)

## Conclusion
The Enhanced Scene Writing System represents a significant advancement in AI-powered narrative generation. By combining sophisticated AI agents, persistent memory systems, and autonomous world simulation, it creates coherent, engaging stories that maintain logical consistency across extended narratives.

The system's modular architecture enables both automated story generation and manual author control, while its hierarchical memory structure ensures narrative continuity and character development. The integration of tension management, character agency, and constraint enforcement creates rich, believable worlds that evolve naturally through the story arc.

Future enhancements could include expanded character relationship modeling, more sophisticated world simulation, and advanced narrative analysis capabilities. The foundation established by this system provides a robust platform for continued innovation in AI-assisted storytelling.