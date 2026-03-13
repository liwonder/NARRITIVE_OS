# @narrative-os/engine

Core narrative engine for AI-powered story generation with persistent memory and autonomous world simulation.

## Features

- **Story Director Agent**: Analyzes story state and generates chapter objectives
- **Character Agents**: Autonomous characters that decide their own actions in each scene
- **Hierarchical Memory System**: Story Bible → Canon → Vector Store → Structured State → Constraint Graph
- **HNSW Vector Search**: Semantic memory retrieval for narrative context
- **Constraint Graph**: Knowledge graph enforcing logical consistency
- **World Simulation**: Autonomous character agents with goals and agendas
- **Tension Controller**: Manages narrative arc and pacing across chapters
- **Chapter Generation Pipeline**: Story Director → Scene Planner → Character Agents → Writer → Validator

## Installation

```bash
npm install @narrative-os/engine
```

## Usage

```typescript
import { createStory, generateChapter } from '@narrative-os/engine';

// Create a new story
const story = await createStory({
  title: "My Adventure",
  premise: "A young hero discovers a hidden world...",
  characters: [...],
  totalChapters: 10
});

// Generate a chapter
const chapter = await generateChapter(story.id);
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NARRATIVE OS ENGINE                       │
├─────────────────────────────────────────────────────────────┤
│  Story Bible → Canon Store → Vector Store → Structured State │
│                                                              │
│  Chapter Generation Pipeline:                                │
│  ┌──────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Story Director│───→│ Scene Planner│───→│ Character Agents│ │
│  └──────────────┘    └─────────────┘    └─────────────────┘ │
│         │                                           │        │
│         ↓                                           ↓        │
│  ┌──────────────┐                         ┌──────────────┐  │
│  │   Tension    │                         │ Scene Writer │  │
│  │  Controller  │                         └──────────────┘  │
│  └──────────────┘                                  │        │
│                                                    ↓        │
│                                           ┌──────────────┐  │
│                                           │   Validator  │  │
│                                           └──────────────┘  │
│                                                              │
│  Post-Chapter Update:                                        │
│  Extract Memories → Update State → Update Graph → Validate   │
└─────────────────────────────────────────────────────────────┘
```

## License

MIT
