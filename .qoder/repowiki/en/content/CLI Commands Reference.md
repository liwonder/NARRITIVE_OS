# CLI Commands Reference

<cite>
**Referenced Files in This Document**
- [index.ts](file://apps/cli/src/index.ts)
- [package.json](file://apps/cli/package.json)
- [README.md](file://apps/cli/README.md)
- [init.ts](file://apps/cli/src/commands/init.ts)
- [generate.ts](file://apps/cli/src/commands/generate.ts)
- [read.ts](file://apps/cli/src/commands/read.ts)
- [list.ts](file://apps/cli/src/commands/list.ts)
- [status.ts](file://apps/cli/src/commands/status.ts)
- [config.ts](file://apps/cli/src/commands/config.ts)
- [use.ts](file://apps/cli/src/commands/use.ts)
- [export.ts](file://apps/cli/src/commands/export.ts)
- [bible.ts](file://apps/cli/src/commands/bible.ts)
- [state.ts](file://apps/cli/src/commands/state.ts)
- [version.ts](file://apps/cli/src/commands/version.ts)
- [hint.ts](file://apps/cli/src/commands/hint.ts)
- [delete.ts](file://apps/cli/src/commands/delete.ts)
- [clone.ts](file://apps/cli/src/commands/clone.ts)
- [memories.ts](file://apps/cli/src/commands/memories.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Commands](#core-commands)
4. [Story Management](#story-management)
5. [Writing Commands](#writing-commands)
6. [Story Analysis](#story-analysis)
7. [Export and Utilities](#export-and-utilities)
8. [Configuration](#configuration)
9. [Storage and Persistence](#storage-and-persistence)
10. [Advanced Features](#advanced-features)
11. [Troubleshooting](#troubleshooting)

## Introduction

Narrative OS is an AI-native narrative engine designed for long-form story generation. The CLI provides a comprehensive interface for creating, managing, and developing stories with AI assistance. Built with TypeScript and Node.js, it offers both interactive prompts and automated generation capabilities.

The system supports multiple AI providers including OpenAI, DeepSeek, Alibaba Cloud, and ByteDance Ark, with sophisticated model routing for different types of tasks such as reasoning, simple tasks, and embeddings.

## Getting Started

### Installation

```bash
npm install -g @narrative-os/cli
```

### Quick Start Workflow

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

### Basic Concepts

- **Active Story**: Set a current story to avoid typing ID every time
- **Story ID**: Unique identifier for each story (automatically generated)
- **Chapter System**: Structured 5000+ word chapters divided into 4 detailed scenes
- **Multi-Story Support**: Work on multiple stories simultaneously

## Core Commands

### Welcome Screen
When no arguments are provided, the CLI displays a comprehensive welcome screen with available commands and quick tips.

### Help System
Use `nos --help` to display all available commands and their descriptions.

### Version Information
```bash
nos version
```
Displays CLI version, engine version, and installed extension modules.

**Section sources**
- [index.ts:28-32](file://apps/cli/src/index.ts#L28-L32)
- [version.ts:64-123](file://apps/cli/src/commands/version.ts#L64-L123)

## Story Management

### Create New Story (`nos init`)
Interactive story creation with genre selection, character generation, and configuration options.

**Command Options:**
- `-t, --title <title>`: Story title
- `--theme <theme>`: Story theme (e.g., Redemption, Love, Betrayal)
- `-g, --genre <genre>`: Genre selection
- `-s, --setting <setting>`: Setting (time/place)
- `--tone <tone>`: Tone (e.g., Dark, Lighthearted, Suspenseful)
- `-p, --premise <premise>`: Brief premise/synopsis
- `-c, --chapters <number>`: Target chapter count

**Interactive Features:**
- Language selection (English/Chinese)
- Primary and secondary genre selection
- Writing skills customization
- Automatic character generation

**Section sources**
- [index.ts:44-54](file://apps/cli/src/index.ts#L44-L54)
- [init.ts:47-203](file://apps/cli/src/commands/init.ts#L47-L203)

### List Stories (`nos list`, alias: `ls`)
Lists all stories with their progress and status.

**Output Includes:**
- Story ID
- Title
- Progress (current/total chapters)
- Completion status (Complete/In Progress)

**Section sources**
- [index.ts:56-60](file://apps/cli/src/index.ts#L56-L60)
- [list.ts:1-23](file://apps/cli/src/commands/list.ts#L1-L23)

### Set Active Story (`nos use [story-id]`)
Sets the current active story for shortcut commands.

**Features:**
- Shows current active story if none provided
- Validates story existence
- Enables commands without specifying story ID

**Section sources**
- [index.ts:63-67](file://apps/cli/src/index.ts#L63-L67)
- [use.ts:45-72](file://apps/cli/src/commands/use.ts#L45-L72)

### Story Status (`nos status [story-id]`)
Displays comprehensive story information including progress, chapters, and recent summaries.

**Output Includes:**
- Story title and ID
- Theme, genre, setting
- Progress percentage
- Current tension level
- Chapter list with word counts
- Recent chapter summaries

**Section sources**
- [index.ts:70-74](file://apps/cli/src/index.ts#L70-L74)
- [status.ts:1-58](file://apps/cli/src/commands/status.ts#L1-L58)

### Delete Story (`nos delete <story-id>`)
Permanently deletes a story and all its chapters.

**Options:**
- `-f, --force`: Skip confirmation prompt

**Warning:** This action is irreversible.

**Section sources**
- [index.ts:77-82](file://apps/cli/src/index.ts#L77-L82)
- [delete.ts:8-35](file://apps/cli/src/commands/delete.ts#L8-L35)

### Clone Story (`nos clone <story-id> <new-title>`)
Creates a copy of an existing story as a template.

**Features:**
- Copies story settings, characters, and plot threads
- Creates fresh state and canon
- Preserves chapter count and structure

**Section sources**
- [index.ts:85-87](file://apps/cli/src/index.ts#L85-L87)
- [clone.ts:4-53](file://apps/cli/src/commands/clone.ts#L4-L53)

## Writing Commands

### Generate Chapter (`nos generate [story-id]`, alias: `gen`)
Generates the next chapter in the story progression.

**Process:**
1. Loads story data and initializes world state engine
2. Creates generation context with story parameters
3. Loads or initializes vector store for memory
4. Calls AI engine to generate chapter content
5. Updates story state and saves progress

**Output Includes:**
- Chapter title and word count
- Canon violations count
- Memories extracted count
- Progress percentage
- Next steps suggestions

**Section sources**
- [index.ts:91-96](file://apps/cli/src/index.ts#L91-L96)
- [generate.ts:4-91](file://apps/cli/src/commands/generate.ts#L4-L91)

### Continue Writing (`nos continue [story-id]`)
Automatically generates all remaining chapters until completion.

**Process:**
- Continues from current chapter until reaching total chapter count
- Uses the same generation logic as `nos generate`
- Provides progress updates throughout the process

**Section sources**
- [index.ts:99-104](file://apps/cli/src/index.ts#L99-L104)

### Regenerate Chapter (`nos regenerate <story-id> <chapter-number>`, alias: `regen`)
Replaces a specific chapter with a regenerated version.

**Use Cases:**
- Fix inconsistencies
- Improve chapter quality
- Experiment with different approaches

**Section sources**
- [index.ts:107-113](file://apps/cli/src/index.ts#L107-L113)

## Story Analysis

### Read Content (`nos read [story-id] [chapter-number]`)
Reads chapter content or lists available chapters.

**Features:**
- Reads specific chapter when chapter number provided
- Lists all chapters when no number specified
- Displays chapter metadata (word count, title)
- Formats content for easy reading

**Section sources**
- [index.ts:117-121](file://apps/cli/src/index.ts#L117-L121)
- [read.ts:3-48](file://apps/cli/src/commands/read.ts#L3-L48)

### Story Bible (`nos bible [story-id]`)
Displays comprehensive story information including characters and plot threads.

**Content Includes:**
- Story title, theme, genre, setting, tone
- Premise and background
- Character profiles with roles, personalities, goals
- Plot thread information
- Background details for each character

**Section sources**
- [index.ts:134-138](file://apps/cli/src/index.ts#L134-L138)
- [bible.ts:3-54](file://apps/cli/src/commands/bible.ts#L3-L54)

### Structured State (`nos state [story-id]`)
Shows detailed narrative state including character tracking and plot development.

**Information Includes:**
- Progress tracking (current chapter, total chapters, tension)
- Character emotional states, locations, goals
- Knowledge bases and relationships
- Plot thread status and tension levels
- Unresolved questions and recent events

**Section sources**
- [index.ts:141-145](file://apps/cli/src/index.ts#L141-L145)
- [state.ts:3-83](file://apps/cli/src/commands/state.ts#L3-L83)

### Memory Search (`nos memories [story-id] [query]`)
Searches narrative memories for specific content or lists all memories.

**Features:**
- Semantic search using vector embeddings
- Category-based memory organization
- Relevance scoring for search results
- Memory extraction during chapter generation

**Section sources**
- [index.ts:150-153](file://apps/cli/src/index.ts#L150-L153)
- [memories.ts:4-66](file://apps/cli/src/commands/memories.ts#L4-L66)

### Consistency Validation (`nos validate [story-id]`)
Checks story consistency and identifies potential issues.

**Validation Includes:**
- Canon compliance checking
- Character continuity verification
- Plot thread consistency
- Timeline accuracy

**Section sources**
- [index.ts:158-161](file://apps/cli/src/index.ts#L158-L161)

## Export and Utilities

### Export Story (`nos export [story-id]`)
Exports story content to various formats.

**Options:**
- `-f, --format <format>`: markdown|txt (default: markdown)
- `-o, --output <file>`: Custom output filename

**Formats:**
- **Markdown**: Rich formatting with headers, character lists, and chapter separation
- **Text**: Plain text format with uppercase titles and simple separators

**Section sources**
- [index.ts:124-130](file://apps/cli/src/index.ts#L124-L130)
- [export.ts:4-114](file://apps/cli/src/commands/export.ts#L4-L114)

### Helpful Hints (`nos hint [story-id]`)
Provides context-aware suggestions and tips for story development.

**Features:**
- Shows next best actions based on story progress
- Suggests commands based on current situation
- Provides quick tips for different scenarios
- Works with active story when no ID provided

**Section sources**
- [index.ts:164-168](file://apps/cli/src/index.ts#L164-L168)
- [hint.ts:3-47](file://apps/cli/src/commands/hint.ts#L3-L47)

## Configuration

### LLM Configuration (`nos config`)
Configures AI provider settings and model routing.

**Supported Providers:**
- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-4-turbo, text-embedding-3-small
- **DeepSeek**: deepseek-chat, deepseek-reasoner
- **Alibaba Cloud**: qwen-max, qwen-plus, qwen-turbo, text-embedding-v3
- **ByteDance Ark**: doubao-pro-128k, doubao-lite-128k, doubao-embedding

**Task-Based Configuration:**
The CLI supports a sophisticated task-based model configuration system:

1. **Simple/Chat Tasks**: Fast, lightweight tasks (validation, summarization)
2. **Reasoning Tasks**: Complex generation and planning (story generation, scene planning)
3. **Embedding Tasks**: Vector embeddings for memory storage and retrieval

**Configuration Process:**
1. Displays current configuration
2. Interactive setup for each task type
3. Provider selection with model recommendations
4. API key entry with masking
5. Validation and saving

**Legacy Support:**
Backward compatible with older multi-model and single-model configurations.

**Section sources**
- [index.ts:35-41](file://apps/cli/src/index.ts#L35-L41)
- [config.ts:321-377](file://apps/cli/src/commands/config.ts#L321-L377)

## Storage and Persistence

### Data Structure
Stories are stored in `~/.narrative-os/stories/<story-id>/` with the following files:

- `bible.json`: Story premise, characters, setting, plot threads
- `chapters/`: Generated chapter content (JSON format)
- `state.json`: Current narrative state and progress
- `world-state.json`: Character locations, objects, relationships
- `memories/`: Vector embeddings for semantic search
- `canon.json`: Established story facts and rules

**Section sources**
- [README.md:136-142](file://apps/cli/README.md#L136-L142)

## Advanced Features

### Active Story System
The CLI maintains an active story that can be set and used across commands:

```bash
nos use <story-id>    # Set active story
nos generate         # Generate next chapter without specifying ID
nos status           # Show story status without specifying ID
```

**Features:**
- Persists across CLI sessions
- Validated on each command execution
- Provides fallback when story ID not provided

**Section sources**
- [use.ts:77-91](file://apps/cli/src/commands/use.ts#L77-L91)

### Multi-Language Support
The CLI supports both English and Chinese interfaces with automatic language detection.

**Features:**
- Language selection during initialization
- Bilingual prompts and messages
- Cultural adaptation for Chinese users

### Genre and Skill System
Built-in support for 24+ genres with specialized writing skills and plot structures.

**Features:**
- Primary and secondary genre combination
- Automatic skill assignment based on genres
- Customizable writing skills
- Genre-specific pacing patterns

## Troubleshooting

### Common Issues

**Story Not Found Errors:**
- Use `nos list` to verify story exists
- Check story ID spelling and case sensitivity
- Verify story directory exists in storage location

**Configuration Issues:**
- Run `nos config` to reconfigure AI providers
- Verify API keys are valid and have sufficient permissions
- Check network connectivity to AI provider services

**Memory Issues:**
- Ensure sufficient disk space for story storage
- Check vector store initialization during chapter generation
- Verify memory extraction during content processing

**Version Compatibility:**
- Use `nos version` to check installed versions
- Update CLI with `npm install -g @narrative-os/cli@latest`
- Verify engine and extension module compatibility

### Debug Information
Use the version command to gather system information for debugging:

```bash
nos version
```

This displays CLI version, engine version, and installed extension modules, which is helpful when reporting issues.

**Section sources**
- [generate.ts:7-14](file://apps/cli/src/commands/generate.ts#L7-L14)
- [config.ts:321-377](file://apps/cli/src/commands/config.ts#L321-L377)
- [version.ts:64-123](file://apps/cli/src/commands/version.ts#L64-L123)