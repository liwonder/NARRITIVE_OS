# @narrative-os/engine

Core narrative engine for AI-powered story generation with persistent memory and autonomous world simulation.

## Features

- **Scene-Level Generation**: Generates 5000+ word chapters through 4 detailed scenes
- **Story Director Agent**: Analyzes story state and generates chapter objectives
- **Character Strategy Analyzer**: Tracks character goals and motivations across chapters
- **World State Engine**: Maintains consistent character locations, objects, and relationships
- **Hierarchical Memory System**: Story Bible → Canon → Vector Store → Structured State
- **HNSW Vector Search**: Semantic memory retrieval for narrative context
- **Canon Validator**: Enforces story facts and logical consistency
- **Tension Controller**: Manages narrative arc and pacing across chapters
- **Multi-Model Support**: Route different tasks to different LLM providers

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
const result = await generateChapter({
  bible: story.bible,
  state: story.state,
  chapterNumber: 1
});
```

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     NARRATIVE OS ENGINE                         │
├────────────────────────────────────────────────────────────────┤
│  Memory Layer:                                                  │
│  Story Bible → Canon Store → Vector Store → World State Engine  │
│                                                                 │
│  Chapter Generation Pipeline:                                   │
│  ┌──────────────┐    ┌─────────────┐    ┌─────────────────┐    │
│  │ Story Director│───→│ Scene Planner│───→│   Scene Writer  │    │
│  └──────────────┘    └─────────────┘    └─────────────────┘    │
│         │                                          │            │
│         ↓                                          ↓            │
│  ┌──────────────┐                         ┌──────────────┐     │
│  │   Tension    │                         │   Validator  │     │
│  │  Controller  │                         └──────────────┘     │
│  └──────────────┘                                               │
│                                                                 │
│  Post-Chapter Processing:                                       │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Memory Extractor│→│ Canon Extractor│→│ Character Strategy │ │
│  └─────────────────┘  └──────────────┘  └────────────────────┘ │
│                                                                 │
│  Character Strategy tracks:                                     │
│  - Current Goal (short-term)                                    │
│  - Long-term Goal                                               │
│  - Next Chapter Target                                          │
│  - Character Conflicts Detection                                │
└────────────────────────────────────────────────────────────────┘
```

## Supported LLM Providers

- **OpenAI** - GPT-4o, GPT-4o-mini, GPT-4-turbo
- **DeepSeek** - deepseek-chat, deepseek-reasoner
- **Alibaba Cloud** - Qwen models (qwen-max, qwen-plus, qwen-turbo, text-embedding-v3)
- **ByteDance Ark** - Doubao models (doubao-pro-128k, doubao-lite-128k, doubao-embedding)

## Multi-Model Configuration

Route different tasks to different models:

```typescript
{
  "defaultModel": "gpt-4o",
  "models": {
    "generation": { "provider": "openai", "model": "gpt-4o" },
    "reasoning": { "provider": "deepseek", "model": "deepseek-reasoner" },
    "summarization": { "provider": "openai", "model": "gpt-4o-mini" },
    "embedding": { "provider": "openai", "model": "text-embedding-3-small" }
  }
}
```

## License

MIT
