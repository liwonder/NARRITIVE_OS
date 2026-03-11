# Memory Management System

<cite>
**Referenced Files in This Document**
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts)
- [bible.ts](file://packages/engine/src/story/bible.ts)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts)
- [writer.ts](file://packages/engine/src/agents/writer.ts)
- [completeness.ts](file://packages/engine/src/agents/completeness.ts)
- [summarizer.ts](file://packages/engine/src/agents/summarizer.ts)
- [state.ts](file://packages/engine/src/story/state.ts)
- [client.ts](file://packages/engine/src/llm/client.ts)
- [index.ts](file://packages/engine/src/index.ts)
- [generate.ts](file://apps/cli/src/commands/generate.ts)
- [simple.test.ts](file://packages/engine/src/test/simple.test.ts)
- [writer.md](file://packages/engine/src/llm/prompts/writer.md)
- [completeness.md](file://packages/engine/src/llm/prompts/completeness.md)
- [summarizer.md](file://packages/engine/src/llm/prompts/summarizer.md)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts)
- [stateUpdater.ts](file://packages/engine/src/agents/stateUpdater.ts)
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts)
- [structuredState.ts](file://packages/engine/src/story/structuredState.ts)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts)
- [vector-memory.test.ts](file://packages/engine/src/test/vector-memory.test.ts)
- [store.ts](file://apps/cli/src/config/store.ts)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive VectorStore implementation with HNSW algorithms for semantic memory search
- Integrated MemoryRetriever for contextual memory retrieval and filtering
- Added MemoryExtractor agent for automated narrative memory extraction from chapters
- Enhanced StateUpdaterPipeline with vector memory integration for comprehensive state management
- Updated generation pipeline to support vector memory extraction and semantic search
- Added CLI persistence support for vector stores with serialization and deserialization
- Expanded memory lifecycle to include vector memory extraction, storage, and retrieval

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
This document describes the Memory Management System with a focus on Canonical Fact Storage, Vector Memory System with HNSW Algorithms, Memory Validation, and Comprehensive State Management. The system now includes a sophisticated vector memory system that enables semantic search capabilities for AI-powered narrative features, allowing the AI to retrieve relevant past events, character developments, world details, and plot information based on meaning rather than exact keywords. The vector memory system integrates seamlessly with the canonical fact storage, memory validation, and state management components to provide a comprehensive memory infrastructure for narrative coherence and intelligent story generation.

## Project Structure
The memory system now encompasses a comprehensive vector memory infrastructure with enhanced state management capabilities:
- Memory: Canonical fact representation, vector-based memory storage, memory extraction, and retrieval
- Story: Structured story state with characters, plot threads, and unresolved questions
- Agents: Writers, completeness checker, summarizer, canonical validator, state updater, and memory extractor
- Pipeline: Orchestration of chapter generation with optional canonical validation, vector memory extraction, and state updates
- CLI: Command-line integration for iterative chapter generation with enhanced persistence including vector stores

```mermaid
graph TB
subgraph "Vector Memory System"
VS["VectorStore<br/>HNSW Index<br/>addMemory()<br/>searchSimilar()<br/>serialize()/load()"]
MR["MemoryRetriever<br/>retrieveForChapter()<br/>retrieveForCharacter()<br/>formatMemoriesForPrompt()"]
ME["MemoryExtractor<br/>extract()<br/>extractFromSummary()"]
end
subgraph "Canonical Memory"
CS["CanonStore<br/>createCanonStore()<br/>extractCanonFromBible()<br/>addFact()/updateFact()"]
end
subgraph "State Management"
SS["StructuredState<br/>createStructuredState()<br/>initializeCharactersFromBible()"]
SU["StateUpdaterPipeline<br/>update()<br/>extractChanges()<br/>quickUpdate()"]
end
subgraph "Story & Agents"
B["StoryBible<br/>createStoryBible()/addCharacter()/addPlotThread()"]
W["ChapterWriter<br/>write()/continue()"]
C["CompletenessChecker<br/>check()"]
Z["ChapterSummarizer<br/>summarize()"]
V["CanonValidator<br/>validate()"]
SU2["StateUpdater<br/>extractStateChanges()<br/>applyUpdates()"]
end
subgraph "Pipeline & CLI"
G["generateChapter()<br/>orchestration"]
CMD["generateCommand()"]
end
subgraph "Constraints"
CG["ConstraintGraph<br/>addNode()/addEdge()<br/>checkConstraints()<br/>addEvent()"]
end
B --> CS
CS --> G
VS --> MR
MR --> W
ME --> VS
G --> W
G --> C
G --> Z
G --> V
G --> SU
SS --> SU
SU --> VS
SU --> CG
S --> G
CMD --> G
CMD --> VS
```

**Diagram sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L19-L58)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L18-L41)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L52-L68)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts#L17-L58)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L90-L248)
- [bible.ts](file://packages/engine/src/story/bible.ts#L3-L26)
- [structuredState.ts](file://packages/engine/src/story/structuredState.ts#L23-L43)
- [writer.ts](file://packages/engine/src/agents/writer.ts#L55-L94)
- [completeness.ts](file://packages/engine/src/agents/completeness.ts#L37-L52)
- [summarizer.ts](file://packages/engine/src/agents/summarizer.ts#L24-L38)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts#L32-L55)
- [stateUpdater.ts](file://packages/engine/src/agents/stateUpdater.ts#L85-L193)
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L29-L245)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L20-L71)
- [generate.ts](file://apps/cli/src/commands/generate.ts#L4-L54)

**Section sources**
- [index.ts](file://packages/engine/src/index.ts#L1-L23)

## Core Components
- **VectorStore**: HNSW (Hierarchical Navigable Small World) algorithm-based vector memory storage with semantic similarity search, embedding generation, and full persistence capabilities.
- **MemoryRetriever**: Contextual memory retrieval system that searches vector stores for relevant past events, character memories, plot threads, and world details.
- **MemoryExtractor**: Automated narrative memory extraction agent that identifies and categorizes important facts from chapters into four categories: events, characters, world, and plot.
- **CanonStore**: Immutable store of canonical facts with helpers to extract, add, update, filter, and format facts for prompts.
- **StateUpdaterPipeline**: Comprehensive post-chapter state management pipeline that extracts narrative changes, updates constraint graphs, maintains recent events, and integrates vector memory extraction.
- **StructuredState**: Rich story state representation with characters, plot threads, unresolved questions, and recent events tracking.
- **StoryBible**: Central story definition containing characters and plot threads used to seed canonical facts and initialize structured state.
- **Agents**:
  - ChapterWriter: Generates chapter content with optional memory injection for contextual awareness.
  - CompletenessChecker: Ensures chapters end at natural stopping points.
  - ChapterSummarizer: Produces concise chapter summaries for memory extraction.
  - CanonValidator: Validates generated chapters against canonical facts using LLM reasoning.
  - StateUpdater: Extracts and applies state changes for unresolved questions and recent events.
- **Pipeline**: Orchestrates generation, optional canonical validation, vector memory extraction, and comprehensive state updates.
- **CLI**: Iteratively generates chapters, updates state, persists progress, and manages vector store persistence with enhanced memory and constraint graph persistence.

**Section sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L4-L17)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L5-L16)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L5-L12)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts#L3-L22)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L90-L192)
- [structuredState.ts](file://packages/engine/src/story/structuredState.ts#L23-L31)
- [bible.ts](file://packages/engine/src/story/bible.ts#L3-L26)
- [writer.ts](file://packages/engine/src/agents/writer.ts#L48-L94)
- [completeness.ts](file://packages/engine/src/agents/completeness.ts#L30-L52)
- [summarizer.ts](file://packages/engine/src/agents/summarizer.ts#L17-L38)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts#L31-L55)
- [stateUpdater.ts](file://packages/engine/src/agents/stateUpdater.ts#L85-L193)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L14-L71)
- [generate.ts](file://apps/cli/src/commands/generate.ts#L4-L54)

## Architecture Overview
The enhanced memory system integrates comprehensive vector memory capabilities with the generation pipeline as follows:
- StoryBible seeds both CanonStore and StructuredState via extraction and initialization.
- VectorStore and MemoryRetriever are integrated into the writer to provide contextual memory injection.
- MemoryExtractor automatically extracts narrative memories from generated chapters and adds them to the vector store.
- After writing, the pipeline checks completeness and optionally validates against canonical facts.
- StateUpdaterPipeline processes the chapter to extract narrative changes, update constraint graphs, maintain recent events, and integrate vector memory extraction.
- Summaries trigger memory extraction for vector store persistence.
- CLI orchestrates iteration, persistence of chapters, state, vector stores, and constraint graphs.

```mermaid
sequenceDiagram
participant CLI as "CLI generateCommand()"
participant Pipe as "generateChapter()"
participant Writer as "ChapterWriter"
participant Comp as "CompletenessChecker"
participant Sum as "ChapterSummarizer"
participant Val as "CanonValidator"
participant StateUp as "StateUpdaterPipeline"
participant ME as "MemoryExtractor"
participant VS as "VectorStore"
participant MR as "MemoryRetriever"
CLI->>Pipe : "generateChapter(context, { canon, vectorStore })"
Pipe->>Writer : "write(context, canon, memoryRetriever)"
Writer-->>Pipe : "WriterOutput"
loop "until complete"
Pipe->>Comp : "check(content)"
Comp-->>Pipe : "isComplete"
alt "incomplete"
Pipe->>Writer : "continue(existing)"
Writer-->>Pipe : "extended content"
end
end
alt "validateCanon"
Pipe->>Val : "validate(content, canon)"
Val-->>Pipe : "validation result"
end
Pipe->>Sum : "summarize(content, n)"
Sum-->>Pipe : "ChapterSummary"
Pipe->>ME : "extract(chapter, bible)"
ME->>VS : "addMemory(memory)"
VS-->>ME : "memory stored"
Pipe->>StateUp : "update(context with new chapter)"
StateUp-->>Pipe : "StateUpdateResult"
Pipe-->>CLI : "GenerateChapterResult"
```

**Diagram sources**
- [generate.ts](file://apps/cli/src/commands/generate.ts#L21-L34)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L20-L71)
- [writer.ts](file://packages/engine/src/agents/writer.ts#L55-L94)
- [completeness.ts](file://packages/engine/src/agents/completeness.ts#L37-L52)
- [summarizer.ts](file://packages/engine/src/agents/summarizer.ts#L24-L38)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts#L32-L55)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L94-L248)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L52-L68)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L66-L93)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L25-L41)

## Detailed Component Analysis

### VectorStore: HNSW Algorithm-Based Vector Memory System
The VectorStore provides sophisticated vector memory management with HNSW (Hierarchical Navigable Small World) algorithms for efficient semantic search:

- **HNSW Index Implementation**: Uses hnswlib-node with native bindings for high-performance nearest neighbor search with cosine distance metric.
- **Memory Model**: Stores narrative memories with categories (event, character, world, plot), chapter numbers, timestamps, and vector embeddings.
- **Embedding Generation**: Integrates with OpenAI text-embedding-3-small model for semantic vector generation with automatic mock fallback for testing environments.
- **Similarity Search**: Implements efficient KNN search with configurable result counts and category filtering.
- **Auto-Resizing**: Dynamically resizes index capacity as memory count approaches limits to maintain performance.
- **Serialization**: Full persistence support for vector stores across sessions with index rebuilding on load.
- **Mock Embeddings**: Includes deterministic fallback mechanism for environments without API access.

```mermaid
classDiagram
class VectorStore {
+HierarchicalNSW index
+Map~number, NarrativeMemory~ memories
+number dimension
+string storyId
+number nextId
+initialize(maxElements) Promise~void~
+ensureCapacity(additionalMemories) void
+addMemory(memory) Promise~NarrativeMemory~
+searchSimilar(query, k) Promise~MemorySearchResult[]~
+searchByCategory(query, category, k) Promise~MemorySearchResult[]~
+getMemoriesByChapter(chapterNumber) NarrativeMemory[]
+getAllMemories() NarrativeMemory[]
+serialize() string
+load(data) Promise~void~
}
class NarrativeMemory {
+number id
+string storyId
+number chapterNumber
+string content
+('event'|'character'|'world'|'plot') category
+Date timestamp
+number[] embedding
}
class MemorySearchResult {
+NarrativeMemory memory
+number score
}
VectorStore --> NarrativeMemory : "manages"
VectorStore --> MemorySearchResult : "returns"
```

**Diagram sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L19-L58)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L135-L157)

**Section sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L1-L208)

### MemoryRetriever: Contextual Memory Retrieval System
The MemoryRetriever provides intelligent memory retrieval with contextual awareness and filtering capabilities:

- **Contextual Query Generation**: Creates meaningful search queries based on story context, current chapter progress, and active plot threads.
- **Multi-Category Retrieval**: Supports specialized retrieval for characters, plot threads, and specific memory categories.
- **Re-ranking and Filtering**: Filters out memories from the current chapter and re-ranks results based on relevance.
- **Prompt Formatting**: Converts retrieved memories into structured format suitable for LLM prompts.
- **Category Grouping**: Organizes memories by category (event, character, world, plot) for clear presentation.
- **Relevance Reasoning**: Provides explanations for why memories are considered relevant.

```mermaid
flowchart TD
A["RetrievalContext"] --> B["Generate Contextual Query"]
B --> C["VectorStore.searchSimilar()"]
C --> D["Filter Current Chapter"]
D --> E["Rerank Results"]
E --> F["Format for Prompt"]
F --> G["RetrievedMemory[]"]
```

**Diagram sources**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L25-L41)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L117-L132)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L85-L102)

**Section sources**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L1-L174)

### MemoryExtractor: Automated Narrative Memory Extraction
The MemoryExtractor agent automatically identifies and categorizes important narrative elements from chapters:

- **Comprehensive Extraction**: Identifies events, character developments, world details, and plot thread progress from chapter content.
- **Structured Output**: Returns memories in standardized format with content and category classification.
- **Dual Extraction Modes**: Can extract from full chapter content or from chapter summaries for efficiency.
- **Prompt Engineering**: Uses carefully crafted prompts to ensure consistent and relevant memory extraction.
- **Content Limiting**: Implements content length limits to control token usage and maintain performance.

```mermaid
flowchart TD
A["Chapter Input"] --> B["Generate Extraction Prompt"]
B --> C["LLM Analysis"]
C --> D["Extract Memories"]
D --> E["Categorize Content"]
E --> F["Return ExtractedMemory[]"]
```

**Diagram sources**
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L52-L68)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L70-L93)

**Section sources**
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L1-L97)

### Enhanced StateUpdaterPipeline: Comprehensive Post-Chapter State Management
The StateUpdaterPipeline represents a significant enhancement to the memory management system, now fully integrated with vector memory capabilities:

- **Extraction Phase**: Uses LLM to analyze chapter content and extract character changes, plot thread updates, new facts, and world changes.
- **State Application**: Updates structured state with character emotional states, locations, knowledge, relationships, and goals.
- **Constraint Graph Integration**: Automatically updates constraint graph with new knowledge nodes, character locations, and events.
- **Vector Memory Integration**: Extracts narrative memories from chapters using MemoryExtractor and adds them to vector store for semantic search.
- **Recent Events Tracking**: Maintains rolling window of recent events for context.
- **Quick Update Mode**: Provides simplified update mechanism for testing and debugging.

```mermaid
flowchart TD
A["Chapter Input"] --> B["Extract Changes (LLM)"]
B --> C["Apply Character Updates"]
C --> D["Update Constraint Graph"]
D --> E["Extract Narrative Memories"]
E --> F["Add to Vector Store"]
F --> G["Update Recent Events"]
G --> H["StateUpdateResult"]
```

**Diagram sources**
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L94-L248)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L211-L229)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L341-L389)

**Section sources**
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L90-L435)

### Enhanced VectorStore: Persistent Memory Storage
The VectorStore provides sophisticated memory management with vector embeddings and similarity search:

- **Memory Model**: Stores narrative memories with categories (event, character, world, plot) and timestamps.
- **Embedding Generation**: Uses OpenAI text-embedding-3-small model for semantic similarity.
- **Similarity Search**: Implements HNSW algorithm for efficient nearest neighbor search.
- **Serialization**: Full persistence support for memory stores across sessions.
- **Mock Embeddings**: Includes fallback mechanism for environments without API access.

```mermaid
classDiagram
class VectorStore {
+HierarchicalNSW index
+Map~number, NarrativeMemory~ memories
+number dimension
+string storyId
+number nextId
+initialize() Promise~void~
+addMemory(memory) Promise~NarrativeMemory~
+searchSimilar(query, k) Promise~MemorySearchResult[]~
+searchByCategory(query, category, k) Promise~MemorySearchResult[]~
+serialize() string
+load(data) Promise~void~
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
VectorStore --> NarrativeMemory : "manages"
```

**Diagram sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L19-L58)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L135-L157)

**Section sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L1-L208)

### StructuredState: Rich Story State Representation
StructuredState provides comprehensive narrative state management:

- **Character Model**: Tracks emotional state, location, relationships, goals, knowledge, and development arcs.
- **Plot Thread Model**: Manages status, tension levels, involvement, and summaries for multiple story threads.
- **Question Management**: Maintains unresolved questions that drive narrative progression.
- **Event Tracking**: Keeps rolling window of recent events for context.
- **Tension Calculation**: Implements parabolic tension curve for dynamic narrative pacing.

```mermaid
classDiagram
class StoryStructuredState {
+string storyId
+number chapter
+number tension
+Record~string, CharacterState~ characters
+Record~string, PlotThreadState~ plotThreads
+string[] unresolvedQuestions
+string[] recentEvents
}
class CharacterState {
+string name
+string emotionalState
+string location
+Record~string, string~ relationships
+string[] goals
+string[] knowledge
+string[] development
}
class PlotThreadState {
+string id
+string name
+'dormant'|'active'|'escalating'|'resolved' status
+number tension
+number lastChapter
+string[] involvedCharacters
+string summary
}
StoryStructuredState --> CharacterState : "contains"
StoryStructuredState --> PlotThreadState : "contains"
```

**Diagram sources**
- [structuredState.ts](file://packages/engine/src/story/structuredState.ts#L23-L31)
- [structuredState.ts](file://packages/engine/src/story/structuredState.ts#L3-L11)
- [structuredState.ts](file://packages/engine/src/story/structuredState.ts#L13-L21)

**Section sources**
- [structuredState.ts](file://packages/engine/src/story/structuredState.ts#L1-L235)

### Enhanced Constraint Graph: Narrative Logic Enforcement
The ConstraintGraph provides comprehensive narrative logic enforcement:

- **Node Types**: Supports characters, locations, facts, events, and items with rich metadata.
- **Edge Relationships**: Manages relationships like located_at, knows, participates_in, and custom relations.
- **Constraint Checking**: Validates location consistency, knowledge consistency, timeline integrity, and logical coherence.
- **Dynamic Updates**: Automatically updates graph when characters move, learn new knowledge, or participate in events.
- **Serialization**: Full persistence support for constraint graph evolution.

```mermaid
graph TB
subgraph "Constraint Graph Nodes"
CHAR["Character Node<br/>properties: emotionalState, location, goals"]
LOC["Location Node<br/>properties: description"]
FACT["Fact Node<br/>properties: established in chapter"]
EVENT["Event Node<br/>properties: participants, chapter"]
end
subgraph "Constraint Edges"
CHAR --> |"located_at"| LOC
CHAR --> |"knows"| FACT
CHAR --> |"participates_in"| EVENT
END
```

**Diagram sources**
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L5-L19)
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L98-L143)
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L163-L192)

**Section sources**
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L29-L471)

### Enhanced Memory Lifecycle: Extraction → Validation → Integration → State Updates → Vector Memory
The enhanced memory lifecycle now includes comprehensive vector memory integration:

- **Extraction**: extractCanonFromBible reads characters and plot threads from the story bible and writes canonical facts into CanonStore.
- **Vector Memory Extraction**: MemoryExtractor automatically extracts narrative memories from generated chapters and adds them to VectorStore.
- **Validation**: CanonValidator compares generated chapter content against formatted canonical facts and reports contradictions.
- **Integration**: The pipeline passes CanonStore, VectorStore, and MemoryRetriever to the writer and optionally invokes validation; summaries trigger memory extraction.
- **State Updates**: StateUpdaterPipeline processes chapters to extract narrative changes, update constraint graphs, maintain recent events, and integrate vector memory extraction.
- **Persistence**: Enhanced CLI functions persist chapters, state, vector stores, and constraint graph data.

```mermaid
sequenceDiagram
participant B as "StoryBible"
participant E as "extractCanonFromBible()"
participant S as "CanonStore"
participant W as "ChapterWriter"
participant V as "CanonValidator"
participant SU as "StateUpdaterPipeline"
participant ME as "MemoryExtractor"
participant VS as "VectorStore"
participant MR as "MemoryRetriever"
participant CG as "ConstraintGraph"
B->>E : "bible"
E-->>S : "CanonStore"
W->>MR : "retrieveForChapter()"
MR->>VS : "searchSimilar()"
VS-->>MR : "similar memories"
MR-->>W : "formatted memories"
W-->>SU : "chapter content"
SU->>ME : "extractMemories()"
ME->>VS : "addMemory()"
VS-->>ME : "memories stored"
SU->>CG : "addEvent()"
CG-->>SU : "graph updated"
SU-->>W : "state updates applied"
```

**Diagram sources**
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts#L24-L58)
- [writer.ts](file://packages/engine/src/agents/writer.ts#L55-L94)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts#L32-L55)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L94-L248)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L52-L68)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L37-L58)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L25-L41)
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L163-L192)

**Section sources**
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts#L24-L58)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts#L31-L55)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L20-L71)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L94-L248)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L52-L68)

### Enhanced Practical Examples: Chapter Generation with Vector Memory Integration
Enhanced CLI-driven generation now includes comprehensive vector memory management:

- **CLI-driven generation**: The CLI command constructs a GenerationContext, loads or initializes VectorStore, calls generateChapter with CanonStore and VectorStore, and persists the new chapter, updated state, and vector store.
- **Memory extraction automation**: The pipeline automatically extracts memories from generated chapters using MemoryExtractor and adds them to the vector store.
- **Test-driven example**: Demonstrates creating a story bible, adding a character, building a CanonStore, generating a chapter with validation and summarization, extracting memories, and processing state updates.

```mermaid
sequenceDiagram
participant CLI as "CLI"
participant Engine as "generateChapter()"
participant Writer as "ChapterWriter"
participant Sum as "ChapterSummarizer"
participant ME as "MemoryExtractor"
participant Store as "CanonStore"
participant Mem as "VectorStore"
participant MR as "MemoryRetriever"
participant StateUp as "StateUpdaterPipeline"
CLI->>Engine : "generateChapter(context, { canon : Store, vectorStore : Mem })"
Engine->>Writer : "write(context, Store, MR)"
Writer-->>Engine : "WriterOutput"
Engine->>Sum : "summarize(content, n)"
Sum-->>Engine : "ChapterSummary"
Engine->>ME : "extract(chapter, bible)"
ME-->>Engine : "memories extracted"
Engine->>Mem : "addMemory(memory)"
Mem-->>Engine : "memories stored"
Engine->>StateUp : "update(context)"
StateUp-->>Engine : "StateUpdateResult"
Engine-->>CLI : "GenerateChapterResult"
```

**Diagram sources**
- [generate.ts](file://apps/cli/src/commands/generate.ts#L21-L34)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L20-L71)
- [writer.ts](file://packages/engine/src/agents/writer.ts#L55-L94)
- [summarizer.ts](file://packages/engine/src/agents/summarizer.ts#L24-L38)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L52-L68)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L94-L248)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L66-L93)

**Section sources**
- [generate.ts](file://apps/cli/src/commands/generate.ts#L1-L81)
- [simple.test.ts](file://packages/engine/src/test/simple.test.ts#L24-L73)

### Enhanced Canonical Fact Prioritization and Growth Strategies
Enhanced prioritization and growth strategies leverage comprehensive state management and vector memory integration:

- **Prioritization**: The writer's prompt template places Story Canon prominently, ensuring the LLM considers canonical facts during generation.
- **Vector Memory Enhancement**: VectorStore enables semantic search for relevant past events, character developments, and plot threads, enriching the context provided to the writer.
- **Growth**: As chapters are generated and summarized, StoryState accumulates summaries that inform future generations, while VectorStore grows with extracted memories for improved semantic search.
- **Dynamic updates**: updateFact allows evolving canonical facts over time; use chapterEstablished to track provenance and manage conflicts.
- **Constraint integration**: New facts from state updates are automatically integrated into the constraint graph for logical consistency.
- **Memory categorization**: Vector memories are categorized (event, character, world, plot) enabling targeted retrieval and context-aware writing.

```mermaid
flowchart TD
Start(["New Chapter"]) --> Seed["Seed CanonStore from StoryBible"]
Seed --> Write["ChapterWriter uses CanonStore + MemoryRetriever"]
Write --> Sum["Summarizer produces ChapterSummary"]
Sum --> State["updateStoryState()"]
State --> StateUp["StateUpdaterPipeline.process()"]
StateUp --> Graph["ConstraintGraph updates"]
StateUp --> Mem["VectorStore memories"]
Mem --> Search["Semantic search for context"]
Search --> Write
Graph --> Next["Next Generation uses enriched context"]
Next --> OptionalUpdate["Optional: updateFact() to evolve CanonStore"]
OptionalUpdate --> Next
```

**Diagram sources**
- [bible.ts](file://packages/engine/src/story/bible.ts#L3-L26)
- [writer.ts](file://packages/engine/src/agents/writer.ts#L55-L94)
- [summarizer.ts](file://packages/engine/src/agents/summarizer.ts#L24-L38)
- [state.ts](file://packages/engine/src/story/state.ts#L14-L29)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts#L79-L99)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L94-L248)
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L163-L192)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L37-L58)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L25-L41)

**Section sources**
- [writer.ts](file://packages/engine/src/agents/writer.ts#L55-L94)
- [state.ts](file://packages/engine/src/story/state.ts#L14-L29)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts#L79-L99)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L94-L248)

## Dependency Analysis
Enhanced dependency relationships now include comprehensive vector memory integration:

- CanonStore depends on StoryBible for initial extraction and on the pipeline for integration.
- VectorStore depends on LLM client for embeddings and supports serialization for persistence.
- MemoryRetriever depends on VectorStore for semantic search and on LLM client for contextual query generation.
- MemoryExtractor depends on LLM client for memory extraction and on StoryBible for context.
- StateUpdaterPipeline depends on all core components: Chapter, StoryBible, StoryStructuredState, CanonStore, VectorStore, MemoryExtractor, and ConstraintGraph.
- ConstraintGraph integrates with StateUpdaterPipeline for automatic updates and with StateUpdater for manual state changes.
- Agents depend on LLMClient for completions; CanonValidator, StateUpdater, and MemoryExtractor additionally depend on their respective data structures.
- Pipeline composes agents and manages optional validation, memory extraction, and state updates.
- CLI depends on the engine exports to orchestrate generation, persistence, vector store management, and enhanced state management.

```mermaid
graph LR
B["StoryBible"] --> CS["CanonStore"]
B --> SS["StructuredState"]
CS --> G["generateChapter"]
SS --> SU["StateUpdaterPipeline"]
VS["VectorStore"] --> MR["MemoryRetriever"]
VS --> SU
ME["MemoryExtractor"] --> VS
SU --> CG["ConstraintGraph"]
G --> W["ChapterWriter"]
G --> C["CompletenessChecker"]
G --> Z["ChapterSummarizer"]
G --> V["CanonValidator"]
V --> CS
W --> LLM["LLMClient"]
C --> LLM
Z --> LLM
V --> LLM
SU --> LLM
ME --> LLM
MR --> LLM
CMD["CLI generateCommand"] --> G
CMD --> VS
CMD --> CG
```

**Diagram sources**
- [bible.ts](file://packages/engine/src/story/bible.ts#L3-L26)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts#L24-L58)
- [structuredState.ts](file://packages/engine/src/story/structuredState.ts#L33-L85)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L90-L248)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L1-L208)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L1-L174)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L1-L97)
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L29-L471)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L20-L71)
- [writer.ts](file://packages/engine/src/agents/writer.ts#L55-L94)
- [completeness.ts](file://packages/engine/src/agents/completeness.ts#L37-L52)
- [summarizer.ts](file://packages/engine/src/agents/summarizer.ts#L24-L38)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts#L32-L55)
- [client.ts](file://packages/engine/src/llm/client.ts#L31-L105)
- [generate.ts](file://apps/cli/src/commands/generate.ts#L4-L54)

**Section sources**
- [index.ts](file://packages/engine/src/index.ts#L1-L116)
- [client.ts](file://packages/engine/src/llm/client.ts#L1-L106)

## Performance Considerations
Enhanced performance considerations for the expanded vector memory system:

- **HNSW Index Performance**: HNSW algorithm provides O(log N) search complexity with configurable efConstruction and efSearch parameters for balancing recall and speed.
- **Embedding Generation Costs**: OpenAI embeddings have token limits and costs; consider batching and caching strategies for repeated embeddings.
- **Index Resizing Strategy**: VectorStore auto-resizes indexes by 50% when capacity is reached; monitor memory usage and adjust initial capacity estimates.
- **Mock Embedding Fallback**: Mock embeddings provide deterministic but non-semantic vectors for testing; ensure proper environment configuration for production.
- **Memory Persistence**: VectorStore serialization/deserialization can be expensive for large memory stores; implement incremental persistence strategies.
- **Token Limits**: LLM calls for memory extraction and state updates specify maxTokens per operation; tune for quality vs. cost, especially for complex state updates.
- **Prompt Sizes**: formatCanonForPrompt, validator prompt, and StateUpdaterPipeline extraction prompts size impact latency; consider truncation or chunking for very large canons and complex state updates.
- **Constraint graph complexity**: Large constraint graphs impact validation performance; consider periodic graph cleanup and optimization.
- **Iterative continuation**: CompletenessChecker retries improve quality but increase cost; cap maxContinuationAttempts.
- **Immutable updates**: CanonStore, VectorStore, and StateUpdaterPipeline operations return new objects; ensure minimal copying and avoid unnecessary re-renders in UI contexts.

## Troubleshooting Guide
Enhanced troubleshooting guidance for the expanded vector memory system:

- **VectorStore Initialization Failures**: Ensure HNSW library is properly installed with native bindings; check node version compatibility.
- **Memory Extraction Failures**: If MemoryExtractor returns empty results, check LLM availability and API keys; verify chapter content length limits.
- **Vector Search Performance Issues**: Monitor HNSW index size and search parameters; consider rebuilding index with different efConstruction values.
- **Embedding Generation Errors**: Verify OpenAI API key configuration; check rate limits and network connectivity; ensure USE_MOCK_EMBEDDINGS is set appropriately.
- **Memory Persistence Issues**: Verify VectorStore serialization format and ensure proper embedding generation; check file permissions for vector-store.json.
- **Validation failures**: If CanonValidator returns violations, review canonical facts and regenerate content. Consider adjusting chapter goals or writer constraints.
- **State update failures**: If StateUpdaterPipeline fails, check LLM responses for malformed JSON and validate chapter content format.
- **Constraint violations**: Use ConstraintGraph.checkConstraints() to identify location, knowledge, timeline, and logic violations; address root causes in state updates.
- **Incomplete chapters**: CompletenessChecker may mark content as incomplete; use writer.continue to extend until completion.
- **JSON parsing errors**: StateUpdaterPipeline and validators fall back to valid structures when parsing fails; verify prompt formatting and LLM behavior.
- **CLI progress**: Ensure state updates, memory persistence, and constraint graph updates occur after each generation; confirm currentChapter increments and totalChapters thresholds.

**Section sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L125-L148)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L62-L65)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L117-L132)
- [canonValidator.ts](file://packages/engine/src/agents/canonValidator.ts#L49-L55)
- [completeness.ts](file://packages/engine/src/agents/completeness.ts#L37-L52)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L32-L43)
- [generate.ts](file://apps/cli/src/commands/generate.ts#L28-L53)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L297-L308)
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L229-L245)

## Conclusion
The enhanced Memory Management System centers on a robust CanonStore that seeds canonical facts from the story bible, a sophisticated VectorStore with HNSW algorithms for semantic memory search, comprehensive MemoryRetriever for contextual memory access, and the powerful StateUpdaterPipeline that provides complete post-chapter state management with vector memory integration. The system now includes automatic constraint graph updates, recent events tracking, enhanced CLI persistence for vector stores, and automated memory extraction capabilities. Together, these components maintain narrative coherence across iterations, enable intelligent semantic search for relevant past events, enforce logical consistency through constraint validation, and support scalable, efficient chapter generation with comprehensive state management and vector memory capabilities.

## Appendices

### Enhanced Prompt References
- Writer prompt structure and guidelines for chapter composition with enhanced canonical fact integration and memory context injection.
- Completeness prompt for detecting natural stopping points.
- Summarizer prompt for concise chapter summaries.
- StateUpdaterPipeline extraction prompt for comprehensive narrative change detection.
- MemoryExtractor prompt for automated narrative memory identification and categorization.
- Constraint graph validation prompt for logical consistency enforcement.

**Section sources**
- [writer.md](file://packages/engine/src/llm/prompts/writer.md#L1-L38)
- [completeness.md](file://packages/engine/src/llm/prompts/completeness.md#L1-L26)
- [summarizer.md](file://packages/engine/src/llm/prompts/summarizer.md#L1-L13)
- [stateUpdater.ts](file://packages/engine/src/memory/stateUpdater.ts#L31-L88)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L14-L50)
- [constraintGraph.ts](file://packages/engine/src/constraints/constraintGraph.ts#L229-L245)