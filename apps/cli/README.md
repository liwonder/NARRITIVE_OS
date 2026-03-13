# @narrative-os/cli

AI-native narrative engine for long-form story generation.

## Installation

```bash
npm install -g @narrative-os/cli
```

## Quick Start

```bash
# Configure your LLM provider
nos config

# Create a new story
nos init --title "My Adventure" --chapters 10

# Generate chapters
nos generate <story-id>

# Or auto-generate all remaining chapters
nos continue <story-id>
```

## Commands

| Command | Description |
|---------|-------------|
| `nos init` | Create a new story (interactive prompts) |
| `nos use [id]` | Set or show current active story |
| `nos generate [id]` | Generate next chapter |
| `nos continue [id]` | Auto-generate remaining chapters |
| `nos status [id]` | View story status |
| `nos list` | List all stories |
| `nos read [id] [chapter]` | Read chapter content |
| `nos bible [id]` | View story bible |
| `nos memories [id]` | Search narrative memories |
| `nos validate [id]` | Validate story consistency |
| `nos export [id]` | Export story to markdown |
| `nos delete <id>` | Delete a story |
| `nos config` | Configure LLM settings (multi-model) |
| `nos version` | Show version information |

**Note:** `[id]` is optional if you have set a current active story with `nos use`.

## Supported LLM Providers

- **OpenAI** - GPT-4o, GPT-4o-mini, GPT-4-turbo
- **DeepSeek** - deepseek-chat, deepseek-reasoner
- **Alibaba Cloud** - Qwen models (qwen-max, qwen-plus, qwen-turbo, text-embedding-v3)
- **ByteDance Ark** - Doubao models (doubao-pro-128k, doubao-lite-128k, doubao-embedding)

## Features

- **Story Director**: AI-driven chapter planning based on story progress and tension
- **Character Agents**: Autonomous characters that make decisions based on their goals and personality
- **Persistent Memory**: Never forgets what happened 50 chapters ago
- **Logical Consistency**: Enforces facts and character continuity
- **World Simulation**: Characters have goals and act autonomously
- **Tension Control**: Manages narrative arc and pacing
- **Multi-Story Support**: Work on multiple stories simultaneously
- **Active Story**: Set a current story to avoid typing ID every time

## Documentation

For full documentation, visit: https://github.com/liwonder/NARRITIVE_OS

## License

MIT
