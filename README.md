# Narrative OS

An AI-native narrative engine for long-form story generation with persistent memory, autonomous world simulation, and logical consistency enforcement.

## The Problem with AI Story Generation

Most AI writing tools suffer from "goldfish memory" — they forget what happened 3 chapters ago, contradict established facts, and lose narrative coherence over time. Narrative OS solves this with a hierarchical memory architecture inspired by human storytelling cognition.

## Core Philosophy

**Stories are living systems**, not just sequences of text. Like a human author, Narrative OS maintains:

- **Story Bible**: The foundational blueprint (characters, setting, themes)
- **Canon Memory**: Immutable facts that must never be contradicted
- **Vector Memory**: Searchable narrative memories (HNSW-based similarity search)
- **Structured State**: Real-time tracking of character emotions, locations, knowledge
- **Constraint Graph**: Knowledge graph enforcing logical consistency
- **World Simulation**: Autonomous character agents with goals and agendas

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NARRATIVE OS PIPELINE                     │
├─────────────────────────────────────────────────────────────┤
│  Story Bible → Canon Store → Vector Store → Structured State │
│                                                              │
│  Chapter Generation:                                         │
│  Story Director → Chapter Planner → Writer → Validator       │
│                                                              │
│  Post-Chapter Update:                                        │
│  Extract Memories → Update State → Update Graph → Validate   │
└─────────────────────────────────────────────────────────────┘
```

### Memory Hierarchy

| Layer | Persistence | Purpose |
|-------|-------------|---------|
| Story Bible | Immutable | Foundation: characters, setting, themes |
| Canon Store | Append-only | Facts that must never be violated |
| Vector Memory | Searchable | Semantic narrative recall (HNSW) |
| Structured State | Real-time | Character states, plot threads, tension |
| Constraint Graph | Validated | Knowledge graph, locations, timeline |
| World Simulation | Autonomous | Character agents, events, consequences |

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/narrative_os.git
cd narrative_os

# Install dependencies (requires pnpm)
pnpm install

# Build the project
pnpm build

# Configure LLM provider
nos config
```

**Requirements:**
- Node.js 20+
- pnpm 9.0+
- DeepSeek API key (or OpenAI)
- Visual Studio 2022 with C++ build tools (for hnswlib-node)

## Quick Start

### 1. Create Your First Story

```bash
nos init --title "上海谜案" \
         --theme "正义与复仇" \
         --genre "悬疑" \
         --setting "1920年代上海" \
         --tone "紧张黑暗" \
         --premise "侦探调查连环杀人案" \
         --chapters 10
```

### 2. Generate Chapters

```bash
# Generate one chapter at a time
nos generate story-abc123

# Or auto-generate all remaining chapters
nos continue story-abc123
```

### 3. Check Progress

```bash
# List all stories
nos status

# Detailed status for one story
nos status story-abc123
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `nos config` | Configure LLM provider and API key |
| `nos init [options]` | Create a new story |
| `nos generate <story-id>` | Generate next chapter |
| `nos continue <story-id>` | Generate all remaining chapters |
| `nos status [story-id]` | Show story status or list all stories |

## Working Pattern

### Daily Workflow

```bash
# Morning: Check where you left off
nos status

# Work on your active story
nos generate story-abc123

# Everything auto-saves! Close your computer anytime.

# Next day: Continue exactly where you left off
nos generate story-abc123
```

### Multi-Story Management

Each story is completely isolated with its own:
- Characters and plot threads
- Memory stores (vector + canon)
- Constraint graphs
- World simulation state

```bash
# Create multiple stories
nos init --title "Story A" --chapters 5
nos init --title "Story B" --chapters 10

# Switch between them anytime
nos generate story-a-xxx
nos generate story-b-yyy
```

## Project Structure

```
narrative_os/
├── apps/cli/              # CLI interface
│   ├── src/commands/      # CLI commands (init, generate, status, continue)
│   └── src/config/        # Persistence layer (store.ts)
├── packages/engine/       # Core narrative engine
│   ├── src/agents/        # AI agents (writer, director, planner, validator)
│   ├── src/memory/        # Memory systems (canon, vector, state updater)
│   ├── src/story/         # Story state management
│   ├── src/constraints/   # Constraint graph and validator
│   ├── src/world/         # World simulation (character agents, events)
│   └── src/pipeline/      # Generation pipeline
└── PROGRESS.md            # Implementation tracker
```

## Data Storage

All story data persists to `~/.narrative-os/stories/{story-id}/`:

```
~/.narrative-os/stories/story-abc123/
├── bible.json              # Story bible
├── state.json              # Current chapter, tension
├── chapters.json           # Generated chapters
├── canon.json              # Canon facts
├── structured-state.json   # Character states
├── vector-store.json       # HNSW vector memories
├── constraint-graph.json   # Knowledge graph
└── world-state.json        # World simulation
```

## The 10-Phase Implementation

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Core Chapter Generator | ✅ |
| 2 | Canon Memory System | ✅ |
| 3 | Vector Narrative Memory (HNSW) | ✅ |
| 4 | Structured Story State | ✅ |
| 5 | Narrative Tension Controller | ✅ |
| 6 | Story Director Agent | ✅ |
| 7 | Chapter Planner Agent | ✅ |
| 8 | World Simulation Layer | ✅ |
| 9 | Narrative Constraints Graph | ✅ |
| 10 | Memory + Graph Updates | ✅ |

## Key Features

### Persistent Memory
- **HNSW Vector Search**: O(log n) semantic memory retrieval
- **Canon Enforcement**: Immutable facts prevent contradictions
- **Character Knowledge Tracking**: No impossible knowledge leaks

### Narrative Intelligence
- **Tension Curve**: Parabolic dramatic arc (4 * progress * (1 - progress))
- **Story Director**: Generates chapter objectives based on story state
- **Chapter Planner**: Converts objectives into scene outlines

### World Simulation
- **Character Agents**: Autonomous characters with goals and agendas
- **Event Resolution**: Conflict/discovery/interaction/movement events
- **Consequence System**: Actions have persistent effects

### Consistency Enforcement
- **Constraint Graph**: Knowledge graph of world state
- **Validator Agent**: Detects canon violations, timeline errors, knowledge leaks
- **Location Tracking**: Prevents impossible character movements

## Development

```bash
# Run tests
pnpm test

# Run specific phase test
npx tsx packages/engine/src/test/constraints.test.ts

# Build
pnpm build

# Development mode
pnpm dev
```

## Tech Stack

- **TypeScript 5.9.3** — Type-safe development
- **pnpm 9.0+** — Workspace management
- **Turbo 2.8.14** — Build system
- **hnswlib-node** — HNSW vector similarity search
- **Commander.js** — CLI framework
- **OpenAI/DeepSeek API** — LLM integration

## License

MIT

## Acknowledgments

Built with inspiration from:
- Human storytelling cognition
- Knowledge graph systems
- Interactive fiction engines
- Vector similarity search research
