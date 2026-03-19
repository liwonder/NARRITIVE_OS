<p align="center">
  <img src="https://raw.githubusercontent.com/liwonder/NARRITIVE_OS/main/apps/cli/assets/banner.png" alt="Narrative OS Banner" width="100%">
</p>

<h1 align="center">Narrative OS</h1>

<p align="center">
  <strong>AI-native narrative engine for long-form story generation</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@narrative-os/cli">
    <img src="https://img.shields.io/npm/v/@narrative-os/cli.svg?style=flat-square&color=blue" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/@narrative-os/cli">
    <img src="https://img.shields.io/npm/dm/@narrative-os/cli.svg?style=flat-square&color=green" alt="npm downloads">
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=flat-square" alt="node version">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="license">
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#commands">Commands</a> •
  <a href="#features">Features</a>
</p>

---

## Installation

```bash
npm install -g @narrative-os/cli
```

## Quick Start

```bash
# Configure your LLM provider
nos config

# Create a new story (interactive prompts)
nos init

# Set as current active story
nos use <story-id>

# Generate next chapter (uses active story)
nos generate

# Or auto-generate all remaining chapters
nos continue
```

## Commands

| Command | Description |
|---------|-------------|
| `nos init` | Create a new story with interactive prompts |
| `nos use [id]` | Set or show current active story |
| `nos generate [id]` | Generate next chapter |
| `nos continue [id]` | Auto-generate remaining chapters |
| `nos status [id]` | View story status and progress |
| `nos list` | List all stories |
| `nos read [id] [chapter]` | Read chapter content |
| `nos bible [id]` | View story bible |
| `nos memories [id]` | Search narrative memories |
| `nos validate [id]` | Validate story consistency |
| `nos export [id]` | Export story to markdown |
| `nos delete <id>` | Delete a story |
| `nos config` | Configure LLM settings (multi-model support) |
| `nos version` | Show CLI and engine version information |

**Note:** `[id]` is optional if you have set a current active story with `nos use`.

## Supported LLM Providers

| Provider | Models | Use Case |
|----------|--------|----------|
| **OpenAI** | GPT-4o, GPT-4o-mini, GPT-4-turbo | General generation |
| **DeepSeek** | deepseek-chat, deepseek-reasoner | Reasoning tasks |
| **Alibaba Cloud** | qwen-max, qwen-plus, qwen-turbo, text-embedding-v3 | Chinese content |
| **ByteDance Ark** | doubao-pro-128k, doubao-lite-128k, doubao-embedding | Chinese content |

## Multi-Model Configuration

Route different tasks to different models for optimal results:

```bash
nos config
```

Example configuration:
```json
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

## Features

- **Scene-Level Generation**: Generates 5000+ word chapters through 4 detailed scenes
- **Story Director**: AI-driven chapter planning based on story progress and tension
- **Character Strategy Tracking**: Analyzes character goals and motivations after each chapter
- **Conflict Detection**: Automatically identifies character conflicts for dramatic tension
- **Persistent Memory**: Never forgets what happened 50 chapters ago
- **Canon Validation**: Enforces facts and character continuity
- **World State Engine**: Tracks character locations, objects, and relationships
- **Tension Control**: Manages narrative arc and pacing
- **Auto Language Detection**: Generates stories in the language of your input
- **Multi-Story Support**: Work on multiple stories simultaneously
- **Active Story**: Set a current story to avoid typing ID every time
- **Genre System**: 24 built-in genres with plot structures and pacing patterns
- **Skills System**: 24 writing skills for different narrative techniques

## Workflow

```
1. nos init          → Create story with premise, characters, total chapters
2. nos use <id>      → Set as active story (optional but convenient)
3. nos generate      → Generate Chapter 1 (4 scenes, 5000+ words)
4. nos generate      → Generate Chapter 2 (continues from Chapter 1)
5. nos continue      → Auto-generate all remaining chapters
6. nos export <id>   → Export complete story to markdown
```

## Storage

Stories are stored in `~/.narrative-os/stories/<story-id>/`:
- `bible.json` - Story premise, characters, setting
- `chapters/` - Generated chapter content
- `state.json` - Current narrative state
- `world-state.json` - Character locations, objects, relationships
- `memories/` - Vector embeddings for semantic search
- `canon.json` - Established story facts

## Documentation

For full documentation, visit: https://github.com/liwonder/NARRITIVE_OS

## License

MIT
