# Narrative OS Implementation Plan

## Phase 1 — Core Chapter Generator

**Goal:** Build a stable chapter generation loop.

**Components:**
- StoryBible
- ChapterWriter
- CompletenessChecker
- ChapterSummarizer

**Pipeline:**
```
metadata → chapter writer → completeness loop → summary generator
```

**Directory:**
```
engine/
  llm.ts
  prompts/
story/
  storyBible.ts
pipeline/
  generateChapter.ts
```

**Deliverable:** Multi-chapter stories with rolling summaries.

---

## Phase 2 — Canon Memory System

**Goal:** Prevent fact drift.

**Components:**
- Canon store (immutable facts)
- Canon injection into writer prompts

**Directory:**
```
memory/
  canonStore.ts
```

**Deliverable:** Stories that don't contradict established facts.

---

## Phase 3 — Vector Narrative Memory

**Goal:** Retrieve relevant past events via semantic search.

**Components:**
- Vector store (Pinecone/Weaviate/pgvector or local HNSW)
- Memory extractor agent
- Memory retriever

**Directory:**
```
memory/
  vectorStore.ts
  memoryExtractor.ts
  memoryRetriever.ts
```

**Deliverable:** 100+ chapter coherence via semantic retrieval.

---

## Phase 4 — Structured Story State

**Goal:** Track mutable narrative state.

**Components:**
- Story state tracker
- Character states
- Plot thread manager

**Directory:**
```
story/
  storyState.ts
```

**Schema:**
```ts
interface StoryState {
  chapter: number
  tension: number
  characters: Record<string, CharacterState>
  plotThreads: PlotThread[]
}
```

**Deliverable:** Live world state with character emotions and active threads.

---

## Phase 5 — Narrative Tension Controller

**Goal:** Control story pacing.

**Components:**
- Tension calculator: `targetTension = 4 * progress * (1 - progress)`
- Tension state tracking

**Directory:**
```
engine/
  tensionController.ts
```

**Deliverable:** Natural dramatic arcs instead of flat narratives.

---

## Phase 6 — Story Director Agent

**Goal:** Decide what the next chapter should accomplish.

**Components:**
- Director agent that reads story state, plot threads, tension target
- Outputs chapter objectives

**Directory:**
```
agents/
  storyDirector.ts
```

**Deliverable:** Autonomous chapter goal generation.

---

## Phase 7 — Chapter Planner Agent

**Goal:** Convert objectives into scene structures.

**Components:**
- Planner agent
- Scene outline generator

**Directory:**
```
agents/
  chapterPlanner.ts
```

**Output:**
```json
{
  "scenes": [
    {"goal": "investigation", "tension": 0.3},
    {"goal": "discovery", "tension": 0.6},
    {"goal": "conflict", "tension": 0.8}
  ]
}
```

**Deliverable:** Structured scene plans before writing.

---

## Phase 8 — World Simulation Layer

**Goal:** Characters act autonomously.

**Components:**
- Character agent model (goals, knowledge, location)
- Event resolver
- World state manager

**Directory:**
```
world/
  worldState.ts
  characterAgent.ts
  eventResolver.ts
```

**Deliverable:** Emergent plot from character decisions.

---

## Phase 9 — Narrative Constraints Graph

**Goal:** Enforce logical consistency.

**Components:**
- Constraint graph (knowledge graph of world state)
- Validator agent

**Directory:**
```
constraints/
  constraintGraph.ts
  validator.ts
```

**Checks:**
- Canon violations
- Location errors
- Knowledge leaks
- Timeline errors

**Deliverable:** No teleporting characters or impossible knowledge.

---

## Phase 10 — Memory + Graph Updates

**Goal:** Complete the feedback loop.

**Components:**
- State updater
- Post-chapter pipeline

**Directory:**
```
memory/
  stateUpdater.ts
```

**Pipeline after each chapter:**
```
extract narrative memory
→ update vector store
→ update character states
→ update plot threads
→ update constraint graph
```

**Deliverable:** Fully autonomous narrative engine.

---

## Final System Loop

```
while story_not_finished:
  compute story progress
  tension_controller()
  story_director()
  world_simulation()
  chapter_planner()
  retrieve_memories()
  writer_agent()
  validator()
  memory_extractor()
  update_state()
```

---

## Suggested Folder Architecture (Server Deployment)

For a hosted service with API and background workers:

```
/narrative-os
├── apps/
│   ├── api/                    # HTTP server (Fastify/Express/Hono)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── stories.ts      # CRUD + generation triggers
│   │   │   │   ├── chapters.ts
│   │   │   │   └── health.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── server.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── worker/                 # Background job processor
│   │   ├── src/
│   │   │   ├── processors/
│   │   │   │   ├── generateChapter.ts
│   │   │   │   ├── validateChapter.ts
│   │   │   │   └── extractMemory.ts
│   │   │   └── worker.ts
│   │   └── package.json
│   │
│   └── cli/                    # CLI tool (local execution)
│       ├── src/
│       │   ├── commands/
│       │   │   ├── init.ts         # Create new story
│       │   │   ├── generate.ts     # Generate next chapter
│       │   │   ├── status.ts       # Show story state
│       │   │   └── continue.ts     # Resume generation
│       │   ├── config/
│       │   │   └── store.ts        # Local story storage
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── engine/                 # Core narrative logic (shared)
│   │   ├── src/
│   │   │   ├── agents/
│   │   │   │   ├── storyDirector.ts
│   │   │   │   ├── chapterPlanner.ts
│   │   │   │   ├── writer.ts
│   │   │   │   ├── validator.ts
│   │   │   │   └── memoryExtractor.ts
│   │   │   ├── memory/
│   │   │   │   ├── canonStore.ts
│   │   │   │   ├── vectorStore.ts
│   │   │   │   ├── retriever.ts
│   │   │   │   └── extractor.ts
│   │   │   ├── world/
│   │   │   │   ├── worldState.ts
│   │   │   │   ├── characterAgent.ts
│   │   │   │   └── eventResolver.ts
│   │   │   ├── constraints/
│   │   │   │   ├── graph.ts
│   │   │   │   └── validator.ts
│   │   │   ├── story/
│   │   │   │   ├── bible.ts
│   │   │   │   └── state.ts
│   │   │   ├── pipeline/
│   │   │   │   └── generateChapter.ts
│   │   │   ├── llm/
│   │   │   │   ├── client.ts
│   │   │   │   └── prompts/
│   │   │   │       ├── storyArchitect.md
│   │   │   │       ├── storyDirector.md
│   │   │   │       ├── chapterPlanner.md
│   │   │   │       ├── writer.md
│   │   │   │       ├── validator.md
│   │   │   │       ├── memoryExtractor.md
│   │   │   │       └── characterAgent.md
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── database/               # Schema + migrations
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── stories.ts
│   │   │   │   ├── chapters.ts
│   │   │   │   ├── characters.ts
│   │   │   │   ├── plotThreads.ts
│   │   │   │   └── vectorCache.ts
│   │   │   └── migrations/
│   │   └── package.json
│   │
│   ├── config/                 # Shared configuration
│   │   └── src/
│   │       ├── index.ts
│   │       └── env.ts
│   │
│   └── types/                  # Shared TypeScript types
│       └── src/
│           ├── story.ts
│           ├── character.ts
│           ├── chapter.ts
│           └── api.ts
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile.api
│   │   └── Dockerfile.worker
│   ├── k8s/                    # Kubernetes manifests
│   └── terraform/              # Cloud provisioning
│
└── turbo.json                  # Monorepo task runner
```

### API Endpoints (Server)

```
POST   /stories              # Create new story
GET    /stories/:id          # Get story with state
POST   /stories/:id/chapters # Queue next chapter generation
GET    /stories/:id/chapters # List all chapters
GET    /stories/:id/state    # Get current story state
POST   /stories/:id/continue # Resume generation
```

### CLI Commands (Local)

```
nos init                    # Create new story interactively
nos generate <story-id>     # Generate next chapter
nos status <story-id>       # Show story state and plot threads
nos continue <story-id>     # Resume generation to target length
nos list                    # Show all local stories
```

### Worker Queue Jobs (Server only)

```
job: generate-chapter
  → runs pipeline
  → stores result
  → triggers memory extraction

job: extract-memory
  → updates vector store
  → updates story state
  → updates constraint graph
```

### Shared Engine Usage

Both API and CLI import from `packages/engine`:

```ts
// apps/api/src/routes/chapters.ts
import { generateChapter } from '@narrative-os/engine';

// apps/cli/src/commands/generate.ts
import { generateChapter } from '@narrative-os/engine';
```

**Key difference:**
- CLI runs pipeline synchronously (local execution)
- API queues jobs for async worker processing (scalable)

---

## Development Order (Critical)

Build sequentially. Each phase must work before starting the next:

1. Chapter generator
2. Canon memory
3. Vector memory
4. Story state
5. Story director
6. Chapter planner
7. Tension controller
8. World simulation
9. Constraints graph

---

## Tech Stack

| Component | Recommendation |
|-----------|---------------|
| Runtime | Node.js + TypeScript |
| Large model | GPT-4o / Claude 3.5 Sonnet |
| Small model | GPT-3.5 / Claude 3 Haiku |
| Vector DB | Pinecone / Weaviate / pgvector (optional until Phase 3) |
| State store | Redis + PostgreSQL |
| Embeddings | OpenAI text-embedding-3-small |
| Workflow | Temporal / Inngest / BullMQ |

---

## Testing Strategy

Test agents individually before integration:

```bash
node test/storyDirector.js
node test/chapterPlanner.js
node test/validator.js
```

Use mock data. Observe failures. Refine prompts. Repeat.
