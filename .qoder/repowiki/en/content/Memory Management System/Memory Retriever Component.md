# Memory Retriever Component

<cite>
**Referenced Files in This Document**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts)
- [index.ts](file://packages/engine/src/index.ts)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts)
- [client.ts](file://packages/engine/src/llm/client.ts)
- [vector-memory.test.ts](file://packages/engine/src/test/vector-memory.test.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Memory Retrieval Workflow](#memory-retrieval-workflow)
5. [Data Structures](#data-structures)
6. [Integration Points](#integration-points)
7. [Performance Considerations](#performance-considerations)
8. [Usage Patterns](#usage-patterns)
9. [Testing and Validation](#testing-and-validation)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Conclusion](#conclusion)

## Introduction

The Memory Retriever Component is a sophisticated system designed to enable narrative AI engines to access and utilize previously stored memories for coherent storytelling. This component serves as the bridge between raw narrative data and intelligent memory recall, allowing story generation systems to maintain continuity, context awareness, and narrative coherence across multiple chapters and story arcs.

The Memory Retriever operates within a broader ecosystem that includes vector-based memory storage, semantic search capabilities, and integration with the overall narrative generation pipeline. It transforms unstructured narrative content into searchable, retrievable knowledge that informs subsequent story generation decisions.

## System Architecture

The Memory Retriever Component is built on a layered architecture that separates concerns between memory storage, retrieval mechanisms, and integration with the broader narrative system.

```mermaid
graph TB
subgraph "Memory Layer"
VS[VectorStore]
MR[MemoryRetriever]
CS[CanonStore]
end
subgraph "Integration Layer"
GC[GenerateChapter Pipeline]
ME[MemoryExtractor]
LLM[LLM Client]
end
subgraph "Data Layer"
NM[NarrativeMemory]
RC[RetrievalContext]
RM[RetrievedMemory]
end
VS --> MR
MR --> GC
CS --> GC
ME --> VS
LLM --> ME
MR --> RC
MR --> RM
VS --> NM
```

**Diagram sources**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L18-L174)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L19-L173)
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L26-L103)

The architecture follows a clear separation of concerns:
- **VectorStore**: Handles low-level memory storage and semantic search
- **MemoryRetriever**: Provides high-level retrieval interfaces and context-aware filtering
- **Integration**: Seamlessly connects with the generation pipeline and memory extraction processes

## Core Components

### MemoryRetriever Class

The MemoryRetriever class serves as the primary interface for accessing stored narrative memories. It encapsulates sophisticated retrieval logic that considers temporal context, narrative categories, and relevance scoring.

```mermaid
classDiagram
class MemoryRetriever {
-VectorStore vectorStore
+constructor(vectorStore : VectorStore)
+retrieveForChapter(context : RetrievalContext, k : number) : Promise~RetrievedMemory[]~
+retrieveForCharacter(characterName : string, context : string, k : number) : Promise~RetrievedMemory[]~
+retrieveForPlotThread(plotThreadId : string, bible : StoryBible, k : number) : Promise~RetrievedMemory[]~
+retrieveRelevantEvents(query : string, k : number) : Promise~RetrievedMemory[]~
+formatMemoriesForPrompt(memories : RetrievedMemory[]) : string
-generateContextualQuery(bible : StoryBible, state : StoryState, currentChapter : number) : string
-rerankMemories(query : string, candidates : MemorySearchResult[], topK : number) : Promise~RetrievedMemory[]~
-inferRelevanceReason(memory : NarrativeMemory) : string
-groupByCategory(memories : RetrievedMemory[]) : Record~string, RetrievedMemory[]~
-capitalize(str : string) : string
}
class VectorStore {
-HierarchicalNSW index
-Map~number, NarrativeMemory~ memories
-number dimension
-string storyId
-number nextId
+constructor(storyId : string)
+initialize() : Promise~void~
+addMemory(memory : Omit~NarrativeMemory, 'id' | 'embedding'~) : Promise~NarrativeMemory~
+searchSimilar(query : string, k : number) : Promise~MemorySearchResult[]~
+searchByCategory(query : string, category : NarrativeMemory~category~, k : number) : Promise~MemorySearchResult[]~
+getMemoriesByChapter(chapterNumber : number) : NarrativeMemory[]
+getAllMemories() : NarrativeMemory[]
-generateEmbedding(text : string) : Promise~number[]~
-generateMockEmbedding(text : string) : Promise~number[]~
+serialize() : string
+load(data : string) : Promise~void~
}
class CanonStore {
+string storyId
+CanonFact[] facts
+createCanonStore(storyId : string) : CanonStore
+extractCanonFromBible(bible : StoryBible) : CanonStore
+addFact(store : CanonStore, fact : Omit~CanonFact, 'id'~) : CanonStore
+getFactsByCategory(store : CanonStore, category : CanonFact~category~) : CanonFact[]
+getFact(store : CanonStore, subject : string, attribute : string) : CanonFact
+updateFact(store : CanonStore, subject : string, attribute : string, value : string, chapter : number) : CanonStore
+formatCanonForPrompt(store : CanonStore) : string
}
MemoryRetriever --> VectorStore : "uses"
MemoryRetriever --> CanonStore : "integrates with"
VectorStore --> NarrativeMemory : "stores"
MemoryRetriever --> RetrievalContext : "processes"
MemoryRetriever --> RetrievedMemory : "returns"
```

**Diagram sources**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L18-L174)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L19-L173)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts#L17-L134)

**Section sources**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L18-L174)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L19-L173)
- [canonStore.ts](file://packages/engine/src/memory/canonStore.ts#L17-L134)

### Retrieval Context System

The MemoryRetriever operates within a sophisticated context system that enables temporal and narrative-aware memory retrieval. The RetrievalContext interface provides essential information about the current story state, enabling the system to filter and rank memories appropriately.

```mermaid
flowchart TD
Start([Memory Retrieval Request]) --> ParseContext["Parse Retrieval Context"]
ParseContext --> CheckQuery{"Query Provided?"}
CheckQuery --> |No| GenerateQuery["Generate Contextual Query"]
CheckQuery --> |Yes| UseProvidedQuery["Use Provided Query"]
GenerateQuery --> SearchVector["Search Vector Store"]
UseProvidedQuery --> SearchVector
SearchVector --> FilterCurrent["Filter Current Chapter"]
FilterCurrent --> Rerank["Rerank by Relevance"]
Rerank --> ReturnResults["Return Retrieved Memories"]
ReturnResults --> End([Memory Retrieval Complete])
```

**Diagram sources**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L25-L41)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L104-L132)

## Memory Retrieval Workflow

The Memory Retriever implements several specialized retrieval strategies tailored to different narrative contexts and requirements.

### Chapter-Based Retrieval

The primary retrieval mechanism focuses on finding memories relevant to a specific chapter, considering temporal constraints and narrative progression.

```mermaid
sequenceDiagram
participant Client as "Client"
participant MR as "MemoryRetriever"
participant VS as "VectorStore"
participant LLM as "LLM Client"
Client->>MR : retrieveForChapter(context, k)
MR->>MR : generateContextualQuery()
MR->>VS : searchSimilar(query, k*2)
VS-->>MR : MemorySearchResult[]
MR->>MR : filterPastMemories()
MR->>MR : rerankMemories()
MR->>MR : inferRelevanceReason()
MR-->>Client : RetrievedMemory[]
Note over MR,LLM : Contextual query generation uses story metadata
Note over VS : Vector similarity search with HNSW index
```

**Diagram sources**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L25-L41)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L104-L132)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L60-L72)

### Character-Specific Retrieval

The system provides specialized retrieval for character-related memories, enabling nuanced character development and relationship tracking.

### Plot Thread Retrieval

Plot thread-specific retrieval ensures narrative coherence by surfacing memories relevant to ongoing story arcs and plot developments.

**Section sources**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L43-L83)

## Data Structures

The Memory Retriever Component relies on well-defined data structures that balance flexibility with performance requirements.

### NarrativeMemory Structure

The core memory representation captures essential narrative information with metadata for efficient retrieval and categorization.

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier for the memory |
| storyId | string | Identifier linking memory to specific story |
| chapterNumber | number | Chapter where memory was established |
| content | string | Text content of the memory |
| category | 'event' \| 'character' \| 'world' \| 'plot' | Narrative category classification |
| timestamp | Date | Creation timestamp |
| embedding | number[] | Vector embedding for similarity search |

### Retrieval Context

The RetrievalContext provides the necessary information for context-aware memory retrieval, enabling temporal and narrative filtering.

### RetrievedMemory

The RetrievedMemory structure combines stored memory data with retrieval metadata including relevance scores and reasoning.

**Section sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L4-L17)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L5-L16)

## Integration Points

The Memory Retriever integrates seamlessly with multiple components of the narrative generation system, creating a cohesive storytelling pipeline.

### Pipeline Integration

The generateChapter pipeline orchestrates memory retrieval as part of the broader story generation process, ensuring that retrieved memories inform writing decisions while maintaining narrative coherence.

```mermaid
graph LR
subgraph "Generation Pipeline"
GC[generateChapter]
WR[writer]
CC[completenessChecker]
SU[stateUpdater]
CV[canonValidator]
SM[summarizer]
end
subgraph "Memory System"
MR[MemoryRetriever]
VS[VectorStore]
ME[MemoryExtractor]
end
GC --> MR
GC --> VS
GC --> ME
WR --> MR
CC --> MR
CV --> MR
ME --> VS
VS --> MR
```

**Diagram sources**
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L26-L103)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L171-L174)

### Agent Integration

The Memory Retriever coordinates with various agents within the system, including the MemoryExtractor for creating new memories and the writer for incorporating retrieved information into generated content.

**Section sources**
- [generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L26-L103)
- [memoryExtractor.ts](file://packages/engine/src/agents/memoryExtractor.ts#L52-L97)

## Performance Considerations

The Memory Retriever is designed with performance optimization in mind, utilizing advanced indexing and caching mechanisms to ensure responsive memory retrieval.

### Vector Similarity Search

The system employs Hierarchical Navigable Small World (HNSW) indexing for efficient similarity search, providing logarithmic time complexity for nearest neighbor queries.

### Embedding Generation

The VectorStore component handles embedding generation through the LLM client, with fallback mechanisms for environments without external API access.

### Memory Filtering

The retrieval process includes intelligent filtering to exclude irrelevant memories, particularly preventing access to future chapter content that would violate temporal consistency.

**Section sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L30-L35)
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L90-L133)

## Usage Patterns

The Memory Retriever supports multiple usage patterns depending on the narrative context and requirements.

### Basic Retrieval Pattern

```typescript
// Initialize vector store and memory retriever
const vectorStore = getVectorStore(storyId);
await vectorStore.initialize();
const memoryRetriever = createMemoryRetriever(vectorStore);

// Retrieve memories for current chapter
const context: RetrievalContext = {
  bible,
  state,
  currentChapter: chapterNumber
};

const memories = await memoryRetriever.retrieveForChapter(context, 5);
const formatted = memoryRetriever.formatMemoriesForPrompt(memories);
```

### Character-Focused Retrieval

```typescript
// Retrieve character-specific memories
const characterMemories = await memoryRetriever.retrieveForCharacter(
  characterName, 
  characterContext, 
  3
);
```

### Plot Thread Retrieval

```typescript
// Retrieve memories relevant to specific plot threads
const plotMemories = await memoryRetriever.retrieveForPlotThread(
  plotThreadId, 
  bible, 
  3
);
```

**Section sources**
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L25-L83)
- [vector-memory.test.ts](file://packages/engine/src/test/vector-memory.test.ts#L96-L127)

## Testing and Validation

The Memory Retriever Component includes comprehensive testing that validates both individual components and integrated workflows.

### Vector Memory Testing

The test suite demonstrates the complete memory lifecycle from storage to retrieval, validating semantic search capabilities and temporal filtering.

### Integration Testing

Tests verify the seamless integration between memory retrieval and the broader narrative generation pipeline, ensuring that retrieved memories enhance rather than disrupt story coherence.

**Section sources**
- [vector-memory.test.ts](file://packages/engine/src/test/vector-memory.test.ts#L31-L185)

## Troubleshooting Guide

Common issues and their solutions when working with the Memory Retriever Component.

### Memory Retrieval Issues

**Problem**: Memory retrieval returns empty results
**Solution**: Verify vector store initialization and embedding generation. Check that memories have been properly added and that the HNSW index is functioning correctly.

**Problem**: Temporal inconsistencies in retrieved memories
**Solution**: Ensure proper filtering of current chapter memories. The system automatically excludes memories from the current chapter, but verify that chapter numbers are correctly set.

### Performance Issues

**Problem**: Slow memory retrieval performance
**Solution**: Monitor HNSW index initialization and embedding generation. Consider adjusting the search parameters and ensuring adequate system resources for vector operations.

**Problem**: Memory corruption or loss
**Solution**: Implement proper serialization and deserialization of the vector store. Regularly backup memory data and verify integrity during loading operations.

### Integration Problems

**Problem**: Memory retriever not integrating with generation pipeline
**Solution**: Verify proper initialization sequence and ensure that vector store is initialized before creating the memory retriever. Check that all required dependencies are properly configured.

**Section sources**
- [vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts#L37-L58)
- [memoryRetriever.ts](file://packages/engine/src/memory/memoryRetriever.ts#L117-L132)

## Conclusion

The Memory Retriever Component represents a sophisticated solution for narrative memory management in AI-powered storytelling systems. Its architecture balances performance with functionality, providing developers with flexible tools for context-aware memory retrieval while maintaining narrative coherence and temporal consistency.

The component's integration with the broader narrative generation pipeline ensures that retrieved memories enhance rather than complicate the storytelling process. Through careful design of data structures, retrieval algorithms, and integration patterns, the Memory Retriever enables the creation of compelling, coherent narratives that maintain continuity across multiple chapters and story arcs.

Future enhancements could include more sophisticated relevance scoring, advanced filtering capabilities, and expanded integration with other narrative components to further improve the quality and coherence of generated stories.