# CLI Command Reference

<cite>
**Referenced Files in This Document**
- [apps/cli/src/index.ts](file://apps/cli/src/index.ts)
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts)
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts)
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts)
- [apps/cli/src/commands/status.ts](file://apps/cli/src/commands/status.ts)
- [apps/cli/src/commands/continue.ts](file://apps/cli/src/commands/continue.ts)
- [apps/cli/src/commands/list.ts](file://apps/cli/src/commands/list.ts)
- [apps/cli/src/commands/delete.ts](file://apps/cli/src/commands/delete.ts)
- [apps/cli/src/commands/clone.ts](file://apps/cli/src/commands/clone.ts)
- [apps/cli/src/commands/export.ts](file://apps/cli/src/commands/export.ts)
- [apps/cli/src/commands/read.ts](file://apps/cli/src/commands/read.ts)
- [apps/cli/src/commands/bible.ts](file://apps/cli/src/commands/bible.ts)
- [apps/cli/src/commands/state.ts](file://apps/cli/src/commands/state.ts)
- [apps/cli/src/commands/memories.ts](file://apps/cli/src/commands/memories.ts)
- [apps/cli/src/commands/validate.ts](file://apps/cli/src/commands/validate.ts)
- [apps/cli/src/commands/regenerate.ts](file://apps/cli/src/commands/regenerate.ts)
- [apps/cli/src/commands/hint.ts](file://apps/cli/src/commands/hint.ts)
- [apps/cli/src/commands/version.ts](file://apps/cli/src/commands/version.ts)
- [apps/cli/src/config/store.ts](file://apps/cli/src/config/store.ts)
- [packages/engine/src/types/index.ts](file://packages/engine/src/types/index.ts)
- [packages/engine/src/story/state.ts](file://packages/engine/src/story/state.ts)
- [packages/engine/src/story/bible.ts](file://packages/engine/src/story/bible.ts)
- [packages/engine/src/story/structuredState.ts](file://packages/engine/src/story/structuredState.ts)
- [packages/engine/src/agents/stateUpdater.ts](file://packages/engine/src/agents/stateUpdater.ts)
- [packages/engine/src/pipeline/generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts)
- [packages/engine/src/llm/client.ts](file://packages/engine/src/llm/client.ts)
- [packages/engine/src/memory/vectorStore.ts](file://packages/engine/src/memory/vectorStore.ts)
- [apps/cli/package.json](file://apps/cli/package.json)
- [package.json](file://package.json)
- [PROGRESS.md](file://PROGRESS.md)
</cite>

## Update Summary
**Changes Made**
- Enhanced the `init` command section to reflect the new AI-assisted character generation system that replaces manual placeholder creation
- Updated the initialization process documentation to highlight automated character generation using LLM-based prompts
- Added comprehensive documentation for the new character generation workflow including fallback mechanisms
- Enhanced troubleshooting section to cover character generation failures and LLM integration issues
- Updated the interactive prompts system documentation to include character generation feedback
- Added practical examples demonstrating AI-assisted story setup with automated character creation

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
This document provides a comprehensive command reference for the Narrative Operating System CLI (nos). It covers command syntax, parameters, flags, usage patterns, and integration points for all nos commands including the newly added 13 commands: bible, clone, delete, export, hint, list, memories, read, regenerate, state, validate, and version. The system features enhanced structured state persistence, interactive hints system, comprehensive story management capabilities with automated AI-assisted initialization, robust error handling for improved reliability, and advanced storytelling capabilities.

## Project Structure
The CLI is implemented as a TypeScript application using Commander for command parsing and Inquirer for interactive configuration. Commands delegate to the engine package for story generation and rely on a local filesystem store under the user's home directory with enhanced structured state management and memory systems.

```mermaid
graph TB
CLI["CLI Entry<br/>apps/cli/src/index.ts"] --> CMD_CONFIG["Command: config<br/>apps/cli/src/commands/config.ts"]
CLI --> CMD_INIT["Command: init<br/>apps/cli/src/commands/init.ts"]
CLI --> CMD_GENERATE["Command: generate<br/>apps/cli/src/commands/generate.ts"]
CLI --> CMD_STATUS["Command: status<br/>apps/cli/src/commands/status.ts"]
CLI --> CMD_CONTINUE["Command: continue<br/>apps/cli/src/commands/continue.ts"]
CLI --> CMD_LIST["Command: list<br/>apps/cli/src/commands/list.ts"]
CLI --> CMD_DELETE["Command: delete<br/>apps/cli/src/commands/delete.ts"]
CLI --> CMD_CLONE["Command: clone<br/>apps/cli/src/commands/clone.ts"]
CLI --> CMD_EXPORT["Command: export<br/>apps/cli/src/commands/export.ts"]
CLI --> CMD_READ["Command: read<br/>apps/cli/src/commands/read.ts"]
CLI --> CMD_BIBLE["Command: bible<br/>apps/cli/src/commands/bible.ts"]
CLI --> CMD_STATE["Command: state<br/>apps/cli/src/commands/state.ts"]
CLI --> CMD_MEMORIES["Command: memories<br/>apps/cli/src/commands/memories.ts"]
CLI --> CMD_VALIDATE["Command: validate<br/>apps/cli/src/commands/validate.ts"]
CLI --> CMD_REGENERATE["Command: regenerate<br/>apps/cli/src/commands/regenerate.ts"]
CLI --> CMD_HINT["Command: hint<br/>apps/cli/src/commands/hint.ts"]
CLI --> CMD_VERSION["Command: version<br/>apps/cli/src/commands/version.ts"]
CMD_CONFIG --> STORE["Local Store<br/>apps/cli/src/config/store.ts"]
CMD_INIT --> STORE
CMD_GENERATE --> STORE
CMD_STATUS --> STORE
CMD_CONTINUE --> STORE
CMD_LIST --> STORE
CMD_DELETE --> STORE
CMD_CLONE --> STORE
CMD_EXPORT --> STORE
CMD_READ --> STORE
CMD_BIBLE --> STORE
CMD_STATE --> STORE
CMD_MEMORIES --> STORE
CMD_VALIDATE --> STORE
CMD_REGENERATE --> STORE
CMD_INIT --> ENGINE_TYPES["Engine Types<br/>packages/engine/src/types/index.ts"]
CMD_GENERATE --> ENGINE_TYPES
CMD_CONTINUE --> ENGINE_TYPES
CMD_CLONE --> ENGINE_TYPES
CMD_REGENERATE --> ENGINE_TYPES
CMD_VALIDATE --> ENGINE_TYPES
CMD_INIT --> STORY_BIBLE["Story Bible<br/>packages/engine/src/story/bible.ts"]
CMD_GENERATE --> STORY_STATE["Story State<br/>packages/engine/src/story/state.ts"]
CMD_CONTINUE --> STORY_STATE
CMD_STATE --> STRUCTURED_STATE["Structured State<br/>packages/engine/src/story/structuredState.ts"]
CMD_STATE --> STATE_UPDATER["State Updater<br/>packages/engine/src/agents/stateUpdater.ts"]
CMD_CONFIG --> ENGINE_CLIENT["LLM Client<br/>packages/engine/src/llm/client.ts"]
CMD_CONFIG --> VECTOR_STORE["Vector Store<br/>packages/engine/src/memory/vectorStore.ts"]
```

**Diagram sources**
- [apps/cli/src/index.ts:1-161](file://apps/cli/src/index.ts#L1-L161)
- [apps/cli/src/commands/config.ts:1-318](file://apps/cli/src/commands/config.ts#L1-L318)
- [apps/cli/src/commands/init.ts:1-91](file://apps/cli/src/commands/init.ts#L1-L91)
- [apps/cli/src/commands/generate.ts:1-81](file://apps/cli/src/commands/generate.ts#L1-L81)
- [apps/cli/src/commands/status.ts:1-55](file://apps/cli/src/commands/status.ts#L1-L55)
- [apps/cli/src/commands/continue.ts:1-63](file://apps/cli/src/commands/continue.ts#L1-L63)
- [apps/cli/src/commands/list.ts:1-23](file://apps/cli/src/commands/list.ts#L1-L23)
- [apps/cli/src/commands/delete.ts:1-36](file://apps/cli/src/commands/delete.ts#L1-L36)
- [apps/cli/src/commands/clone.ts:1-53](file://apps/cli/src/commands/clone.ts#L1-L53)
- [apps/cli/src/commands/export.ts:1-114](file://apps/cli/src/commands/export.ts#L1-L114)
- [apps/cli/src/commands/read.ts:1-48](file://apps/cli/src/commands/read.ts#L1-L48)
- [apps/cli/src/commands/bible.ts:1-54](file://apps/cli/src/commands/bible.ts#L1-L54)
- [apps/cli/src/commands/state.ts:1-83](file://apps/cli/src/commands/state.ts#L1-L83)
- [apps/cli/src/commands/memories.ts:1-66](file://apps/cli/src/commands/memories.ts#L1-L66)
- [apps/cli/src/commands/validate.ts:1-107](file://apps/cli/src/commands/validate.ts#L1-L107)
- [apps/cli/src/commands/regenerate.ts:1-68](file://apps/cli/src/commands/regenerate.ts#L1-L68)
- [apps/cli/src/commands/hint.ts:1-73](file://apps/cli/src/commands/hint.ts#L1-L73)
- [apps/cli/src/commands/version.ts:1-124](file://apps/cli/src/commands/version.ts#L1-L124)
- [apps/cli/src/config/store.ts:1-195](file://apps/cli/src/config/store.ts#L1-L195)
- [packages/engine/src/types/index.ts:1-150](file://packages/engine/src/types/index.ts#L1-L150)
- [packages/engine/src/story/bible.ts:1-243](file://packages/engine/src/story/bible.ts#L1-L243)
- [packages/engine/src/story/state.ts:1-30](file://packages/engine/src/story/state.ts#L1-L30)
- [packages/engine/src/story/structuredState.ts:1-235](file://packages/engine/src/story/structuredState.ts#L1-L235)
- [packages/engine/src/agents/stateUpdater.ts:1-193](file://packages/engine/src/agents/stateUpdater.ts#L1-L193)
- [packages/engine/src/llm/client.ts:1-249](file://packages/engine/src/llm/client.ts#L1-L249)
- [packages/engine/src/memory/vectorStore.ts:1-258](file://packages/engine/src/memory/vectorStore.ts#L1-L258)

**Section sources**
- [apps/cli/src/index.ts:1-161](file://apps/cli/src/index.ts#L1-L161)
- [apps/cli/package.json:1-50](file://apps/cli/package.json#L1-L50)
- [package.json:1-17](file://package.json#L1-L17)

## Core Components
- CLI entrypoint defines the nos binary, version, and registers commands with their options and actions, including the new 13 commands.
- Commands share a common configuration and storage layer for persistent story data with enhanced structured state management and memory systems.
- Engine types define the data structures used across commands (StoryBible, StoryState, Chapter, GenerationContext, StoryStructuredState).
- **New**: Structured state persistence system automatically initializes and manages character and plot thread states with comprehensive narrative tracking.
- **New**: Interactive hints system provides contextual guidance and quick tips based on story progress and user context.
- **New**: Enhanced init command with AI-assisted character generation via LLM-based prompts, replacing the previous manual placeholder creation approach.
- **New**: Multi-model configuration system supporting separate reasoning, chat, and embedding models with backward compatibility for single-model setups.
- **New**: Task-based model selection system with automatic model assignment based on operation type (generation/planning, validation/summarization, extraction, embedding).
- **New**: Version command provides detailed version information for CLI and engine modules.

Key runtime behaviors:
- Interactive configuration via inquirer prompts.
- AI-assisted story creation via LLM-powered character generation for title, genre, theme, setting, tone, premise, and target chapters.
- Local persistence under ~/.narrative-os/{config.json, stories/<id>/} with automatic structured state initialization.
- Structured state includes character emotional states, locations, relationships, plot thread tensions, and unresolved questions.
- Memory systems support vector-based narrative recall and semantic search with OpenAI embeddings.
- Exit codes: non-zero on errors (e.g., missing story ID, invalid chapter numbers).
- **New**: Contextual help system provides intelligent suggestions based on story state and user actions.
- **New**: Multi-model LLM client automatically selects appropriate models based on task type with embedding support.
- **New**: Version command displays CLI and engine module versions with development mode detection.
- **New**: Character generation fallback system provides default characters when LLM generation fails.

**Section sources**
- [apps/cli/src/index.ts:11-53](file://apps/cli/src/index.ts#L11-L53)
- [apps/cli/src/commands/config.ts:38-182](file://apps/cli/src/commands/config.ts#L38-L182)
- [apps/cli/src/config/store.ts:15-49](file://apps/cli/src/config/store.ts#L15-L49)
- [packages/engine/src/types/index.ts:1-150](file://packages/engine/src/types/index.ts#L1-L150)
- [packages/engine/src/story/structuredState.ts:23-85](file://packages/engine/src/story/structuredState.ts#L23-L85)
- [apps/cli/src/commands/hint.ts:3-47](file://apps/cli/src/commands/hint.ts#L3-L47)
- [apps/cli/src/commands/init.ts:17-90](file://apps/cli/src/commands/init.ts#L17-L90)
- [packages/engine/src/llm/client.ts:39-47](file://packages/engine/src/llm/client.ts#L39-L47)
- [packages/engine/src/memory/vectorStore.ts:1-258](file://packages/engine/src/memory/vectorStore.ts#L1-L258)
- [apps/cli/src/commands/version.ts:64-123](file://apps/cli/src/commands/version.ts#L64-123)

## Architecture Overview
The CLI orchestrates story lifecycle operations backed by the engine with enhanced structured state management and comprehensive story management capabilities. Configuration is applied at startup and injected into environment variables for downstream LLM clients, while structured state provides detailed narrative tracking and memory systems enable sophisticated narrative recall with embedding support.

```mermaid
sequenceDiagram
participant User as "User"
participant CLI as "nos CLI"
participant Init as "init.ts"
participant Config as "config.ts"
participant Version as "version.ts"
participant Store as "store.ts"
participant Engine as "Engine (types/state/bible/structuredState)"
participant LLMClient as "LLM Client"
participant VectorStore as "Vector Store"
User->>CLI : "nos version"
CLI->>Version : "versionCommand()"
Version-->>User : "Display CLI and engine versions"
User->>CLI : "nos config"
CLI->>Config : "configCommand()"
Config->>Config : "loadConfig()/select()/password()"
Config->>Store : "saveConfig()"
Store-->>Config : "write ~/.narrative-os/config.json"
Config-->>User : "Saved provider/model/embedding"
User->>CLI : "nos init [options]"
CLI->>Init : "initCommand()"
Init->>Init : "Interactive prompts for title, genre, theme, setting, tone, premise, chapters"
Init->>Engine : "generateCharacters() via LLM"
Engine->>LLMClient : "complete(prompt, { task : 'generation' })"
LLMClient->>LLMClient : "select reasoning model for character generation"
LLMClient-->>Engine : "Generated character JSON"
Engine-->>Init : "Array of CharacterProfile objects"
Init->>Engine : "createStoryBible()"
Engine-->>Init : "StoryBible with AI-generated characters"
Init->>Engine : "createStoryState()"
Engine-->>Init : "StoryState"
Init->>Store : "saveStory(bible,state,chapters,structuredState)"
Store->>Store : "initializeStructuredState()"
Store-->>Init : "persist stories/<id> with structured-state.json"
Init-->>User : "Story created with AI-generated characters"
User->>CLI : "nos hint [story-id]"
CLI->>CLI : "showHint() with context"
CLI-->>User : "Contextual suggestions"
User->>CLI : "nos generate <story-id>"
CLI->>LLMClient : "complete(prompt, { task : 'generation' })"
LLMClient->>LLMClient : "select reasoning model for generation"
LLMClient-->>User : "Generated chapter"
User->>VectorStore : "VectorStore operations"
VectorStore->>VectorStore : "Generate embeddings using embedding model"
VectorStore-->>User : "Memory search results"
```

**Diagram sources**
- [apps/cli/src/index.ts:18-33](file://apps/cli/src/index.ts#L18-L33)
- [apps/cli/src/commands/config.ts:38-66](file://apps/cli/src/commands/config.ts#L38-L66)
- [apps/cli/src/commands/version.ts:64-123](file://apps/cli/src/commands/version.ts#L64-L123)
- [apps/cli/src/config/store.ts:15-26](file://apps/cli/src/config/store.ts#L15-L26)
- [packages/engine/src/story/bible.ts:153-217](file://packages/engine/src/story/bible.ts#L153-L217)
- [packages/engine/src/story/state.ts:3-12](file://packages/engine/src/story/state.ts#L3-L12)
- [packages/engine/src/story/structuredState.ts:33-85](file://packages/engine/src/story/structuredState.ts#L33-L85)
- [apps/cli/src/config/store.ts:139-151](file://apps/cli/src/config/store.ts#L139-L151)
- [apps/cli/src/commands/hint.ts:3-47](file://apps/cli/src/commands/hint.ts#L3-L47)
- [apps/cli/src/commands/init.ts:68-76](file://apps/cli/src/commands/init.ts#L68-L76)
- [packages/engine/src/llm/client.ts:39-47](file://packages/engine/src/llm/client.ts#L39-L47)
- [packages/engine/src/llm/client.ts:113-125](file://packages/engine/src/llm/client.ts#L113-L125)
- [packages/engine/src/memory/vectorStore.ts:125-177](file://packages/engine/src/memory/vectorStore.ts#L125-L177)

## Detailed Component Analysis

### Command: nos version
Purpose
- Display detailed version information for the CLI and engine modules, including installed extension modules and development mode detection.

Syntax
- nos version
- nos version -v

Options
- --version, -v: Show version information

Behavior
- Displays comprehensive version information including CLI package details, engine module version, and any installed extension modules.
- Shows development mode detection when running from local source.
- Provides installation guidance for updates.
- Handles cases where engine modules are not installed.

Output format
- Formatted table-like display with section headers and version details.
- Lists installed extension modules with their versions when available.

Configuration file location
- No configuration file required

Environment variables set
- None

Exit codes
- 0 on success; non-zero on IO failures.

Common usage
- Check current CLI and engine versions: `nos version`
- Verify installation status and module versions

Advanced usage
- Use in automation scripts to verify environment setup
- Check development vs production mode
- Monitor for updates and module availability

**Section sources**
- [apps/cli/src/index.ts:154-158](file://apps/cli/src/index.ts#L154-L158)
- [apps/cli/src/commands/version.ts:64-123](file://apps/cli/src/commands/version.ts#L64-L123)

### Command: nos config
Purpose
- Interactively configure the LLM provider, model(s), and API key(s). Supports both single-model and multi-model configurations with backward compatibility. Persists configuration to ~/.narrative-os/config.json and applies environment variables for the LLM client. **New**: Now supports separate reasoning, chat, and embedding models with OpenAI, DeepSeek, Alibaba Cloud (Qwen), and ByteDance Ark provider integration.

Syntax
- nos config
- nos config --show

Options
- --show, -s: Show current configuration without interactive setup

Behavior
- **Interactive mode** (default): Prompts for provider selection (OpenAI, DeepSeek, Alibaba Cloud, or ByteDance Ark), model selection based on provider, and API key (masked), then writes configuration.
- **Display mode** (`--show`): Shows current configuration without prompting for interactive setup.
- **New**: Multi-model configuration: User can choose to configure separate reasoning and chat models for different tasks, plus optional embedding model for memory operations.
- **New**: Expanded provider integration: Supports OpenAI with GPT models, DeepSeek with specialized reasoning models, Alibaba Cloud (Qwen) with embedding support, and ByteDance Ark with embedding support.
- **New**: Embedding configuration: Optional provider-specific embeddings setup for vector memory operations.
- **New**: Backward compatibility: Automatically converts legacy single-model configurations to multi-model format.
- Writes configuration and prints a confirmation summary in interactive mode.

Configuration file location
- ~/.narrative-os/config.json

Environment variables set
- **New**: LLM_MODELS_CONFIG: JSON-encoded multi-model configuration for the LLM client
- **Legacy**: LLM_PROVIDER, LLM_MODEL, OPENAI_API_KEY, DEEPSEEK_API_KEY, ALIBABA_API_KEY, ARK_API_KEY (when applicable)
- **New**: Individual API keys are also set for backward compatibility
- **New**: Embedding model configuration accessible via LLM client for vector memory operations

Exit codes
- 0 on success; non-zero on IO or prompt failures.

Common usage
- Initial setup after installing the CLI.
- **New**: Check current configuration without changing it using `nos config --show`.
- **New**: Configure multi-model setup for advanced reasoning and chat separation with optional embeddings.
- **New**: Set up embedding model for memory operations using provider-specific embeddings.

Advanced usage
- Re-run to change provider or model without manual edits.
- Combine with CI setup by exporting environment variables prior to invoking nos generate/continue.
- **New**: Use `nos config --show` in scripts to verify configuration before running story generation commands.
- **New**: Multi-model configurations automatically integrate with the LLM client's task-based model selection.
- **New**: Embedding configuration enables vector memory operations for advanced narrative recall.

**Updated** Enhanced with multi-model configuration support, expanded provider integration, and embedding setup

**Section sources**
- [apps/cli/src/index.ts:34-40](file://apps/cli/src/index.ts#L34-L40)
- [apps/cli/src/commands/config.ts:57-277](file://apps/cli/src/commands/config.ts#L57-L277)
- [apps/cli/src/commands/config.ts:55-90](file://apps/cli/src/commands/config.ts#L55-L90)
- [apps/cli/src/commands/config.ts:100-181](file://apps/cli/src/commands/config.ts#L100-L181)
- [apps/cli/package.json:12-16](file://apps/cli/package.json#L12-L16)
- [packages/engine/src/llm/client.ts:58-78](file://packages/engine/src/llm/client.ts#L58-L78)
- [packages/engine/src/memory/vectorStore.ts:125-177](file://packages/engine/src/memory/vectorStore.ts#L125-L177)

### Command: nos init
Purpose
- Create a new story with AI-assisted character generation via LLM-powered prompts. The CLI now provides dynamic user input for story creation and automatically generates realistic characters using AI, making the initial story setup more intuitive, user-friendly, and narratively rich. Persists initial state and returns the story ID for subsequent operations with automatic structured state initialization.

**Updated** Enhanced with AI-assisted character generation via LLM-based prompts

Syntax
- nos init [options]
- nos init (interactive mode)

Options
- --title <title>, -t <title>: Story title (interactive if omitted)
- --theme <theme>: Story theme (interactive if omitted)
- --genre <genre>, -g <genre>: Genre (interactive if omitted)
- --setting <setting>, -s <setting>: Setting (time/place) (interactive if omitted)
- --tone <tone>: Tone (interactive if omitted)
- --premise <premise>, -p <premise>: Brief premise/synopsis (interactive if omitted)
- --chapters <number>, -c <number>: Target chapter count (default: 5, interactive if omitted)

Interactive Prompts
- **Title**: Required field with validation (non-empty)
- **Genre**: Selection from predefined genres (Science Fiction, Fantasy, Mystery, Thriller, Romance, Historical Fiction, Horror, Literary Fiction, Other)
- **Theme**: Free text with default "Redemption"
- **Setting**: Free text with default "Modern day"
- **Tone**: Free text with default "Dramatic"
- **Premise**: Free text with minimum 10 characters validation
- **Target Chapters**: Number input with min 1, max 50, default 5

AI-Assisted Character Generation
- **Automated Creation**: Characters are generated using LLM-based prompts with story context (title, premise, genre, setting, language)
- **Authentic Names**: Character names are generated appropriate for the specified language and story setting
- **Role Distribution**: Includes exactly one protagonist, one antagonist, and 1-2 supporting characters
- **Personality Traits**: Generated traits create interesting conflicts and drive plot development
- **Goal Alignment**: Character goals align with the story premise and genre
- **Fallback System**: If LLM generation fails, default characters are provided based on language

Output
- Prints story metadata and the next command to generate the first chapter.
- Displays AI-generated characters with their roles and characteristics.
- Shows character count and role distribution.

Storage
- Creates ~/.narrative-os/stories/<id>/ with bible.json, state.json, chapters.json, structured-state.json, and optionally canon.json.
- **New**: Automatically creates structured-state.json with initialized character and plot thread states.
- **New**: Character data includes personality traits, goals, and relationships for narrative depth.

Exit codes
- 0 on success; non-zero if initialization fails.

Interactive Usage Examples
- **Full interactive mode**: `nos init` (prompts for all fields, generates AI characters)
- **Partial interactive mode**: `nos init --title "My Story"` (prompts for remaining fields, generates AI characters)
- **Parameter-driven mode**: `nos init --title "My Story" --genre "Fantasy" --chapters 8` (no prompts, generates AI characters)

**Updated** Added comprehensive AI-assisted character generation system with LLM integration and fallback mechanisms

**Section sources**
- [apps/cli/src/index.ts:42-53](file://apps/cli/src/index.ts#L42-L53)
- [apps/cli/src/commands/init.ts:4-91](file://apps/cli/src/commands/init.ts#L4-L91)
- [packages/engine/src/story/bible.ts:153-217](file://packages/engine/src/story/bible.ts#L153-L217)
- [packages/engine/src/story/state.ts:3-12](file://packages/engine/src/story/state.ts#L3-L12)
- [apps/cli/src/config/store.ts:139-151](file://apps/cli/src/config/store.ts#L139-L151)

### Command: nos generate <story-id>
Purpose
- Generate the next chapter for a given story ID with enhanced structured state tracking. Validates completion state and handles errors gracefully.

Syntax
- nos generate <story-id>

Behavior
- Loads story data from ~/.narrative-os/stories/<id>.
- Checks if the story is complete; if so, prints a completion message.
- **Enhanced**: Automatically initializes structured state if it doesn't exist.
- Builds a GenerationContext with target word count and invokes the engine pipeline.
- **New**: Integrates structured state updates through the StateUpdater agent.
- **New**: Uses multi-model LLM client with task-based model selection (reasoning model for generation).
- **New**: Embedding operations supported for vector memory integration.
- Saves updated state and chapters; prints chapter details and progress.
- On failure, logs an error and exits with non-zero code.

Exit codes
- 0 on success; 1 if story not found or generation fails.

Example
- nos generate abc123def

Automation tip
- Use a shell loop to iterate nos generate until completion.

**Section sources**
- [apps/cli/src/index.ts:79-84](file://apps/cli/src/index.ts#L79-L84)
- [apps/cli/src/commands/generate.ts:4-81](file://apps/cli/src/commands/generate.ts#L4-L81)
- [apps/cli/src/config/store.ts:28-49](file://apps/cli/src/config/store.ts#L28-L49)
- [packages/engine/src/types/index.ts:60-65](file://packages/engine/src/types/index.ts#L60-L65)
- [packages/engine/src/agents/stateUpdater.ts:85-193](file://packages/engine/src/agents/stateUpdater.ts#L85-L193)
- [packages/engine/src/llm/client.ts:113-125](file://packages/engine/src/llm/client.ts#L113-L125)

### Command: nos status [story-id]
Purpose
- Show detailed status for a single story or list all stories when no ID is provided. **Enhanced**: Now displays structured state information.

Syntax
- nos status [story-id]

Behavior
- Without story-id: lists all stories with progress percentage.
- With story-id: prints title, ID, theme, genre, setting, progress, current tension, recent chapter summaries, and chapter titles/word counts.
- **New**: Can display structured state information when available.

Exit codes
- 0 on success; 1 if story not found.

Example
- nos status
- nos status abc123def

**Section sources**
- [apps/cli/src/index.ts:61-64](file://apps/cli/src/index.ts#L61-L64)
- [apps/cli/src/commands/status.ts:3-54](file://apps/cli/src/commands/status.ts#L3-L54)
- [apps/cli/src/config/store.ts:51-75](file://apps/cli/src/config/store.ts#L51-L75)

### Command: nos continue <story-id>
Purpose
- Generate all remaining chapters for a story in a loop until completion with enhanced structured state management.

Syntax
- nos continue <story-id>

Behavior
- Loads story data and verifies it is not complete.
- **Enhanced**: Automatically initializes structured state if it doesn't exist.
- Iteratively generates chapters, integrating structured state updates through the StateUpdater agent.
- **New**: Uses multi-model LLM client with task-based model selection for optimal performance.
- **New**: Embedding operations supported for vector memory integration.
- Saving state and printing per-chapter feedback.
- On any failure, logs the error and exits with non-zero code.

Exit codes
- 0 on success; 1 if story not found or generation fails.

Example
- nos continue abc123def

Batch operations
- Combine with shell scripting to process multiple stories or retry on failure.

**Section sources**
- [apps/cli/src/index.ts:86-92](file://apps/cli/src/index.ts#L86-L92)
- [apps/cli/src/commands/continue.ts:4-63](file://apps/cli/src/commands/continue.ts#L4-L63)
- [apps/cli/src/config/store.ts:28-49](file://apps/cli/src/config/store.ts#L28-L49)
- [packages/engine/src/agents/stateUpdater.ts:85-193](file://packages/engine/src/agents/stateUpdater.ts#L85-L193)
- [packages/engine/src/llm/client.ts:113-125](file://packages/engine/src/llm/client.ts#L113-L125)

### Command: nos list
Purpose
- List all stories in the system with progress information and status indicators.

Syntax
- nos list

Behavior
- Retrieves all stories from the local store.
- Displays each story's ID, title, progress (current/total chapters), and completion status.
- Shows helpful messages when no stories exist.

Output format
- Clean tabular display with progress percentages and completion indicators.

Exit codes
- 0 on success; 1 if storage access fails.

Example
- nos list

**Section sources**
- [apps/cli/src/index.ts:55-59](file://apps/cli/src/index.ts#L55-L59)
- [apps/cli/src/commands/list.ts:1-23](file://apps/cli/src/commands/list.ts#L1-L23)

### Command: nos delete <story-id> [--force]
Purpose
- Permanently delete a story and all its associated data. Requires confirmation unless --force flag is used.

Syntax
- nos delete <story-id> [--force]

Options
- --force: Skip confirmation prompt

Behavior
- Loads the target story and displays deletion summary (title, ID, chapter count).
- Prompts for confirmation unless --force is specified.
- Removes the entire story directory from ~/.narrative-os/stories/<id>.
- Provides success confirmation upon completion.

Exit codes
- 0 on successful deletion; 1 on story not found or permission errors.

Example
- nos delete abc123def
- nos delete abc123def --force

**Section sources**
- [apps/cli/src/index.ts:66-72](file://apps/cli/src/index.ts#L66-L72)
- [apps/cli/src/commands/delete.ts:1-36](file://apps/cli/src/commands/delete.ts#L1-L36)

### Command: nos clone <story-id> <new-title>
Purpose
- Create a copy of an existing story as a template with a new title and fresh state.

Syntax
- nos clone <story-id> <new-title>

Behavior
- Loads the source story and validates its existence.
- Creates a new StoryBible with identical settings but different title and ID.
- Copies all characters and plot threads from the source story.
- Initializes fresh state and creates structured state from the new bible.
- Saves the cloned story and prints summary with new story ID.

Exit codes
- 0 on success; 1 if source story not found.

Example
- nos clone abc123def "New Adventure"

**Section sources**
- [apps/cli/src/index.ts:74-77](file://apps/cli/src/index.ts#L74-L77)
- [apps/cli/src/commands/clone.ts:1-53](file://apps/cli/src/commands/clone.ts#L1-L53)

### Command: nos export <story-id> [--format <format>] [--output <file>]
Purpose
- Export a story to external file formats with configurable output options.

Syntax
- nos export <story-id> [--format <format>] [--output <file>]

Options
- --format/-f: Output format (markdown or txt), default: markdown
- --output/-o: Custom output filename

Behavior
- Loads the target story and validates its existence.
- Supports markdown (default) and plain text formats.
- Generates formatted content with story metadata and all chapters.
- Writes output file to current directory with automatic naming if not specified.

Exit codes
- 0 on success; 1 if story not found or file write fails.

Example
- nos export abc123def
- nos export abc123def --format txt --output my_story.txt

**Section sources**
- [apps/cli/src/index.ts:111-118](file://apps/cli/src/index.ts#L111-L118)
- [apps/cli/src/commands/export.ts:1-114](file://apps/cli/src/commands/export.ts#L1-L114)

### Command: nos read <story-id> [chapter-number]
Purpose
- Read story content either as a chapter listing or specific chapter content.

Syntax
- nos read <story-id> [chapter-number]

Behavior
- Without chapter-number: lists all chapters with titles and word counts.
- With chapter-number: displays the specified chapter content with formatting.
- Handles missing chapters with helpful error messages and available chapter ranges.

Exit codes
- 0 on success; 1 if story not found or chapter not found.

Example
- nos read abc123def
- nos read abc123def 5

**Section sources**
- [apps/cli/src/index.ts:104-110](file://apps/cli/src/index.ts#L104-L110)
- [apps/cli/src/commands/read.ts:1-48](file://apps/cli/src/commands/read.ts#L1-L48)

### Command: nos bible <story-id>
Purpose
- Display comprehensive story bible containing all narrative elements and character information.

Syntax
- nos bible <story-id>

Behavior
- Loads the target story and validates its existence.
- Displays story metadata (title, theme, genre, setting, tone, premise).
- Lists all characters with roles, personalities, goals, and backgrounds.
- Shows all plot threads with statuses and descriptions.
- Provides formatted output with clear section dividers.

Exit codes
- 0 on success; 1 if story not found.

Example
- nos bible abc123def

**Section sources**
- [apps/cli/src/index.ts:121-124](file://apps/cli/src/index.ts#L121-L124)
- [apps/cli/src/commands/bible.ts:1-54](file://apps/cli/src/commands/bible.ts#L1-L54)

### Command: nos state <story-id>
Purpose
- Display detailed structured state information for narrative tracking and analysis.

Syntax
- nos state <story-id>

Behavior
- Loads both story data and structured state for the target story.
- Shows progress metrics (current chapter, total chapters, tension levels).
- Displays comprehensive character states including emotional states, locations, goals, knowledge, and relationships.
- Shows plot thread tracking with statuses, tensions, and summaries.
- Lists unresolved questions and recent narrative events.
- Provides fallback messaging when structured state is not available.

Exit codes
- 0 on success; 1 if story not found.

Example
- nos state abc123def

**Section sources**
- [apps/cli/src/index.ts:126-129](file://apps/cli/src/index.ts#L126-L129)
- [apps/cli/src/commands/state.ts:1-83](file://apps/cli/src/commands/state.ts#L1-L83)

### Command: nos memories <story-id> [query]
Purpose
- Search or browse narrative memories stored in the vector memory system with embedding support.

Syntax
- nos memories <story-id> [query]

Behavior
- Loads vector store data for the target story.
- Without query: lists all memories grouped by category with sample excerpts.
- With query: searches for semantically similar memories and displays relevance scores.
- **New**: Uses configured embedding model for vector memory operations.
- Shows memory categories, chapter numbers, and content excerpts.
- Handles cases where no memories exist for the story.

Exit codes
- 0 on success; 1 if story not found.

Example
- nos memories abc123def
- nos memories abc123def "character meeting"

**Section sources**
- [apps/cli/src/index.ts:131-137](file://apps/cli/src/index.ts#L131-L137)
- [apps/cli/src/commands/memories.ts:1-66](file://apps/cli/src/commands/memories.ts#L1-L66)
- [packages/engine/src/memory/vectorStore.ts:125-177](file://packages/engine/src/memory/vectorStore.ts#L125-L177)

### Command: nos validate <story-id>
Purpose
- Perform comprehensive validation of story consistency and quality standards.

Syntax
- nos validate <story-id>

Behavior
- Loads story data including constraint graphs, vector stores, and structured state.
- Performs chapter-by-chapter validation against narrative constraints and canon.
- Checks for common issues like missing summaries, unusually short chapters, and orphaned facts.
- Reports violations with severity levels (errors vs warnings).
- Provides statistics on story metrics (chapters, canon facts, constraint graph size, memory count).

Exit codes
- 0 on success; 1 if story not found.

Example
- nos validate abc123def

**Section sources**
- [apps/cli/src/index.ts:139-145](file://apps/cli/src/index.ts#L139-L145)
- [apps/cli/src/commands/validate.ts:1-107](file://apps/cli/src/commands/validate.ts#L1-L107)

### Command: nos regenerate <story-id> <chapter-number>
Purpose
- Regenerate a specific chapter while preserving story continuity and narrative consistency.

Syntax
- nos regenerate <story-id> <chapter-number>

Behavior
- Loads the target story and validates chapter existence.
- Initializes or loads vector store for memory consistency.
- Creates generation context based on state before the target chapter.
- **New**: Uses multi-model LLM client with reasoning model for regeneration.
- **New**: Embedding operations supported for vector memory integration.
- Generates replacement chapter with canonical validation.
- Replaces the old chapter and updates story data.
- Displays regeneration results including new title, word count, and any violations.

Exit codes
- 0 on success; 1 if story not found, chapter not found, or regeneration fails.

Example
- nos regenerate abc123def 3

**Section sources**
- [apps/cli/src/index.ts:94-101](file://apps/cli/src/index.ts#L94-L101)
- [apps/cli/src/commands/regenerate.ts:1-68](file://apps/cli/src/commands/regenerate.ts#L1-L68)
- [packages/engine/src/llm/client.ts:113-125](file://packages/engine/src/llm/client.ts#L113-L125)

### Command: nos hint [story-id]
Purpose
- Provide contextual hints and suggestions based on story progress and user context.

Syntax
- nos hint [story-id]

Behavior
- Lists all stories to determine context when no story ID provided.
- Finds active story (in-progress) or uses the most recent story.
- Provides tailored suggestions based on story state:
  - First-time users: guidance for creating their first story with AI-assisted character generation
  - Completed stories: suggestions for export, reading, or cloning
  - Active stories: recommendations for continuing, checking status, or auto-completing
- Displays helpful command references and quick-start tips.

Exit codes
- 0 on success; 1 if no stories exist.

Example
- nos hint
- nos hint abc123def

**Section sources**
- [apps/cli/src/index.ts:147-152](file://apps/cli/src/index.ts#L147-L152)
- [apps/cli/src/commands/hint.ts:1-73](file://apps/cli/src/commands/hint.ts#L1-L73)

## Dependency Analysis
The CLI depends on the engine package for story types, generation logic, structured state management, and memory systems. It persists data locally and reads/writes JSON files including the new structured-state.json and vector-store.json. Configuration is applied at startup and influences environment variables consumed by the engine.

```mermaid
graph LR
CLI_INDEX["apps/cli/src/index.ts"] --> CMD_CONFIG["commands/config.ts"]
CLI_INDEX --> CMD_INIT["commands/init.ts"]
CLI_INDEX --> CMD_GENERATE["commands/generate.ts"]
CLI_INDEX --> CMD_STATUS["commands/status.ts"]
CLI_INDEX --> CMD_CONTINUE["commands/continue.ts"]
CLI_INDEX --> CMD_LIST["commands/list.ts"]
CLI_INDEX --> CMD_DELETE["commands/delete.ts"]
CLI_INDEX --> CMD_CLONE["commands/clone.ts"]
CLI_INDEX --> CMD_EXPORT["commands/export.ts"]
CLI_INDEX --> CMD_READ["commands/read.ts"]
CLI_INDEX --> CMD_BIBLE["commands/bible.ts"]
CLI_INDEX --> CMD_STATE["commands/state.ts"]
CLI_INDEX --> CMD_MEMORIES["commands/memories.ts"]
CLI_INDEX --> CMD_VALIDATE["commands/validate.ts"]
CLI_INDEX --> CMD_REGENERATE["commands/regenerate.ts"]
CLI_INDEX --> CMD_HINT["commands/hint.ts"]
CLI_INDEX --> CMD_VERSION["commands/version.ts"]
CMD_INIT --> STORE["config/store.ts"]
CMD_GENERATE --> STORE
CMD_STATUS --> STORE
CMD_CONTINUE --> STORE
CMD_LIST --> STORE
CMD_DELETE --> STORE
CMD_CLONE --> STORE
CMD_EXPORT --> STORE
CMD_READ --> STORE
CMD_BIBLE --> STORE
CMD_STATE --> STORE
CMD_MEMORIES --> STORE
CMD_VALIDATE --> STORE
CMD_REGENERATE --> STORE
CMD_INIT --> TYPES["engine/types/index.ts"]
CMD_GENERATE --> TYPES
CMD_CONTINUE --> TYPES
CMD_CLONE --> TYPES
CMD_REGENERATE --> TYPES
CMD_VALIDATE --> TYPES
CMD_INIT --> STORY_BIBLE["engine/story/bible.ts"]
CMD_GENERATE --> STORY_STATE["engine/story/state.ts"]
CMD_CONTINUE --> STORY_STATE
CMD_STATE --> STRUCTURED_STATE["engine/story/structuredState.ts"]
CMD_STATE --> STATE_UPDATER["engine/agents/stateUpdater.ts"]
CMD_CONFIG --> ENGINE_CLIENT["engine/llm/client.ts"]
CMD_CONFIG --> VECTOR_STORE["engine/memory/vectorStore.ts"]
STORE --> GENERATE_PIPELINE["engine/pipeline/generateChapter.ts"]
```

**Diagram sources**
- [apps/cli/src/index.ts:1-161](file://apps/cli/src/index.ts#L1-L161)
- [apps/cli/src/commands/config.ts:1-318](file://apps/cli/src/commands/config.ts#L1-L318)
- [apps/cli/src/commands/init.ts:1-91](file://apps/cli/src/commands/init.ts#L1-L91)
- [apps/cli/src/commands/generate.ts:1-81](file://apps/cli/src/commands/generate.ts#L1-L81)
- [apps/cli/src/commands/status.ts:1-55](file://apps/cli/src/commands/status.ts#L1-L55)
- [apps/cli/src/commands/continue.ts:1-63](file://apps/cli/src/commands/continue.ts#L1-L63)
- [apps/cli/src/commands/list.ts:1-23](file://apps/cli/src/commands/list.ts#L1-L23)
- [apps/cli/src/commands/delete.ts:1-36](file://apps/cli/src/commands/delete.ts#L1-L36)
- [apps/cli/src/commands/clone.ts:1-53](file://apps/cli/src/commands/clone.ts#L1-L53)
- [apps/cli/src/commands/export.ts:1-114](file://apps/cli/src/commands/export.ts#L1-L114)
- [apps/cli/src/commands/read.ts:1-48](file://apps/cli/src/commands/read.ts#L1-L48)
- [apps/cli/src/commands/bible.ts:1-54](file://apps/cli/src/commands/bible.ts#L1-L54)
- [apps/cli/src/commands/state.ts:1-83](file://apps/cli/src/commands/state.ts#L1-L83)
- [apps/cli/src/commands/memories.ts:1-66](file://apps/cli/src/commands/memories.ts#L1-L66)
- [apps/cli/src/commands/validate.ts:1-107](file://apps/cli/src/commands/validate.ts#L1-L107)
- [apps/cli/src/commands/regenerate.ts:1-68](file://apps/cli/src/commands/regenerate.ts#L1-L68)
- [apps/cli/src/commands/hint.ts:1-73](file://apps/cli/src/commands/hint.ts#L1-L73)
- [apps/cli/src/commands/version.ts:1-124](file://apps/cli/src/commands/version.ts#L1-L124)
- [apps/cli/src/config/store.ts:1-195](file://apps/cli/src/config/store.ts#L1-L195)
- [packages/engine/src/types/index.ts:1-150](file://packages/engine/src/types/index.ts#L1-L150)
- [packages/engine/src/story/bible.ts:1-243](file://packages/engine/src/story/bible.ts#L1-L243)
- [packages/engine/src/story/state.ts:1-30](file://packages/engine/src/story/state.ts#L1-L30)
- [packages/engine/src/story/structuredState.ts:1-235](file://packages/engine/src/story/structuredState.ts#L1-L235)
- [packages/engine/src/agents/stateUpdater.ts:1-193](file://packages/engine/src/agents/stateUpdater.ts#L1-L193)
- [packages/engine/src/pipeline/generateChapter.ts:1-108](file://packages/engine/src/pipeline/generateChapter.ts#L1-L108)
- [packages/engine/src/llm/client.ts:1-249](file://packages/engine/src/llm/client.ts#L1-L249)
- [packages/engine/src/memory/vectorStore.ts:1-258](file://packages/engine/src/memory/vectorStore.ts#L1-L258)

**Section sources**
- [apps/cli/src/index.ts:1-161](file://apps/cli/src/index.ts#L1-L161)
- [apps/cli/src/commands/config.ts:1-318](file://apps/cli/src/commands/config.ts#L1-L318)
- [apps/cli/src/config/store.ts:1-195](file://apps/cli/src/config/store.ts#L1-L195)
- [packages/engine/src/types/index.ts:1-150](file://packages/engine/src/types/index.ts#L1-L150)

## Performance Considerations
- Each nos generate invocation performs disk I/O to load/save story data; batching via nos continue reduces overhead.
- **Enhanced**: Structured state initialization adds minimal overhead but provides significant narrative tracking benefits.
- **New**: AI-assisted character generation via LLM adds network latency but provides rich, authentic character data.
- **New**: Interactive prompts via Inquirer add minimal runtime overhead but greatly improve user experience.
- **New**: Memory operations (vector store loading/searching) have minimal performance impact but can be optimized by caching frequently accessed data.
- **New**: Validation operations scale with chapter count and constraint complexity; consider running selectively during development.
- **New**: Multi-model configuration adds negligible overhead as models are cached in memory.
- **New**: Task-based model selection ensures optimal performance by using appropriate models for each operation type.
- **New**: Embedding operations use dedicated embedding models for vector memory operations.
- **New**: Provider-specific optimizations (DeepSeek reasoning models, OpenAI embeddings, Alibaba Cloud Qwen) improve performance for specialized tasks.
- **New**: Character generation fallback system provides immediate character data when LLM generation fails.
- Target word count is fixed for generation; adjust story length via --chapters during init to control total work.
- Network latency dominates LLM calls; consider rate limits and provider quotas.
- For large-scale automation, cache configuration and reuse environment variables to avoid repeated file reads.
- **New**: Structured state serialization/deserialization is lightweight JSON operations that do not significantly impact performance.
- **New**: Contextual hints system provides immediate feedback without heavy computation.
- **New**: Configuration display operation is extremely fast as it only reads from local file system without any interactive prompts.
- **New**: Interactive prompts are asynchronous and provide immediate feedback, making the CLI feel responsive even with user input.
- **New**: Multi-model LLM client caches providers and models for efficient access during story generation.
- **New**: Embedding model caching improves vector memory performance for repeated operations.
- **New**: Version command provides instant version information without significant overhead.

## Troubleshooting Guide
Common issues and resolutions
- Story not found
  - Cause: Invalid or missing story ID.
  - Resolution: List stories with nos status; confirm ID; re-run with correct ID.
- Configuration missing
  - Cause: No ~/.narrative-os/config.json.
  - Resolution: Run nos config to set provider, model, and API key.
- **New**: Multi-model configuration issues
  - Cause: Corrupted or incomplete multi-model configuration.
  - Resolution: Run `nos config` to reconfigure; use `nos config --show` to verify setup; check that both reasoning and chat models are properly configured; ensure embedding model is set if needed.
- **New**: Provider-specific issues
  - Cause: DeepSeek API key problems, OpenAI API key problems, Alibaba Cloud API key problems, or ByteDance Ark API key problems.
  - Resolution: Verify API keys for selected provider; check provider-specific model availability; ensure correct base URLs for DeepSeek, Alibaba Cloud, and ByteDance Ark.
- **New**: Embedding configuration issues
  - Cause: Missing API key for embeddings or provider not supporting embeddings.
  - Resolution: Use `nos config --show` to check embedding configuration; if using DeepSeek, configure OpenAI separately for embeddings; verify embedding model availability for Alibaba Cloud or ByteDance Ark.
- **New**: Interactive prompt failures
  - Cause: Terminal not supporting interactive input or interrupted prompts.
  - Resolution: Use parameter-driven mode (e.g., `nos init --title "Story" --genre "Fantasy"`) or fix terminal environment.
- **New**: Configuration display issues
  - Cause: No configuration file exists or is corrupted.
  - Resolution: Run `nos config --show` to see current configuration status; if empty, run `nos config` to set up.
- **New**: Model purpose confusion
  - Cause: Unclear which model is used for which task.
  - Resolution: Use `nos config --show` to see model purposes; reasoning models are used for generation/planning, chat models for validation/summarization, embedding models for vector memory operations.
- **New**: Character generation failures
  - Cause: LLM API errors, network issues, or invalid context during character generation.
  - Resolution: Verify API credentials; retry character generation; check that story context (title, premise, genre, setting) is provided; fallback default characters will be used if LLM generation fails.
- Generation failures
  - Cause: LLM API errors, network issues, or invalid context.
  - Resolution: Verify API credentials; retry; inspect recent summaries via nos status; reduce concurrency.
- Permission errors
  - Cause: Write permissions to ~/.narrative-os.
  - Resolution: Fix directory permissions or run as a user with appropriate access.
- **New**: Structured state corruption
  - Cause: Corrupted structured-state.json file.
  - Resolution: Delete the corrupted file; the system will automatically recreate it from the StoryBible on next generation.
- **New**: Missing structured state
  - Cause: Legacy stories created before structured state feature.
  - Resolution: Run nos generate or nos continue on the story; it will automatically initialize structured state.
- **New**: Memory system issues
  - Cause: Missing or corrupted vector-store.json or embedding model problems.
  - Resolution: Run nos regenerate on problematic chapters to rebuild memory data; check embedding configuration; verify API key if using embeddings.
- **New**: Validation failures
  - Cause: Canon violations or constraint graph issues.
  - Resolution: Review validation output; fix narrative inconsistencies; run nos validate again to confirm resolution.
- **New**: Chapter not found errors
  - Cause: Invalid chapter number or story progression issues.
  - Resolution: Use nos read to check available chapters; verify chapter numbering; use nos regenerate for corrections.
- **New**: Export format issues
  - Cause: Unsupported format or file write permissions.
  - Resolution: Specify supported formats (markdown/txt); check output directory permissions; use --output option for custom filenames.
- **New**: Version command issues
  - Cause: Package information not found or module not installed.
  - Resolution: Ensure CLI and engine modules are properly installed; check npm registry connectivity; use `npm list -g @narrative-os/cli` to verify installation.

Exit codes summary
- 0: Success
- 1: Error (e.g., story not found, generation failure, validation issues)

**Section sources**
- [apps/cli/src/commands/generate.ts:7-10](file://apps/cli/src/commands/generate.ts#L7-L10)
- [apps/cli/src/commands/generate.ts:50-53](file://apps/cli/src/commands/generate.ts#L50-L53)
- [apps/cli/src/commands/status.ts:25-28](file://apps/cli/src/commands/status.ts#L25-L28)
- [apps/cli/src/commands/continue.ts:7-10](file://apps/cli/src/commands/continue.ts#L7-L10)
- [apps/cli/src/commands/continue.ts:42-45](file://apps/cli/src/commands/continue.ts#L42-L45)
- [apps/cli/src/config/store.ts:139-151](file://apps/cli/src/config/store.ts#L139-L151)
- [apps/cli/src/commands/regenerate.ts:17-21](file://apps/cli/src/commands/regenerate.ts#L17-L21)
- [apps/cli/src/commands/export.ts:7-10](file://apps/cli/src/commands/export.ts#L7-L10)
- [apps/cli/src/commands/version.ts:64-123](file://apps/cli/src/commands/version.ts#L64-L123)

## Conclusion
The nos CLI provides a comprehensive and powerful workflow for creating, generating, managing, and validating stories powered by the Narrative Operating System engine. With the addition of 13 new commands, enhanced structured state persistence, interactive hints system, sophisticated memory management, the new AI-assisted initialization process with automated character generation via LLM-based prompts, the revolutionary multi-model configuration system with separate reasoning, chat, and embedding models, and the new version command for detailed version information, it now offers advanced narrative tracking capabilities, comprehensive story management, intelligent assistance, multi-model performance optimization, embedding support for vector memory operations, an intuitive user experience with AI-powered character creation, and detailed version management while maintaining both beginner-friendly workflows and advanced automation scenarios.

## Appendices

### Data Model Overview
The CLI operates on core engine types that define story structure and generation context, now enhanced with structured state management, memory systems, multi-model configuration, and AI-assisted character generation.

```mermaid
classDiagram
class StoryBible {
+string id
+string title
+string theme
+string genre
+string setting
+string tone
+number targetChapters
+string premise
+CharacterProfile[] characters
+PlotThread[] plotThreads
+Date createdAt
+Date updatedAt
}
class CharacterProfile {
+string id
+string name
+string role
+string[] personality
+string[] goals
+string background?
}
class PlotThread {
+string id
+string name
+string description
+string status
+number tension
}
class Chapter {
+string id
+string storyId
+number number
+string title
+string content
+string summary
+number wordCount
+Date generatedAt
}
class StoryState {
+string storyId
+number currentChapter
+number totalChapters
+number currentTension
+string[] activePlotThreads
+ChapterSummary[] chapterSummaries
}
class ChapterSummary {
+number chapterNumber
+string summary
+string[] keyEvents
+map characterChanges
}
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
+string status
+number tension
+number lastChapter
+string[] involvedCharacters
+string summary
}
class GenerationContext {
+bible StoryBible
+state StoryState
+chapterNumber number
+targetWordCount number
}
class VectorMemory {
+number id
+string storyId
+string content
+string category
+number chapterNumber
+number[] embedding?
+Date timestamp
}
class ConstraintGraph {
+Map~string, ConstraintNode~ nodes
+Map~string, ConstraintEdge~ edges
+getStats()
+load(data)
+serialize()
}
class ModelConfig {
+string name
+string provider
+string apiKey
+string baseURL?
+string model
+'reasoning'|'chat'|'fast'|'embedding' purpose
}
class MultiModelConfig {
+ModelConfig[] models
+string defaultModel
}
class LLMClient {
+Map~string, ModelConfig~ models
+Map~string, LLMProvider~ providers
+string defaultModelName
+complete(prompt, config)
+completeJSON(prompt, config)
+getAvailableModels()
+getEmbeddingConfig()
}
class VectorStore {
+HierarchicalNSW index
+Map~number, NarrativeMemory~ memories
+number dimension
+string storyId
+number nextId
+initialize(maxElements)
+addMemory(memory)
+searchSimilar(query, k)
+searchByCategory(query, category, k)
+serialize()
+load(data)
}
StoryBible "1" o-- "many" CharacterProfile
StoryBible "1" o-- "many" PlotThread
StoryState "1" o-- "many" ChapterSummary
StoryStructuredState "1" o-- "many" CharacterState
StoryStructuredState "1" o-- "many" PlotThreadState
GenerationContext --> StoryBible
GenerationContext --> StoryState
VectorMemory --> StoryBible
ConstraintGraph --> StoryBible
LLMClient --> ModelConfig
MultiModelConfig --> ModelConfig
VectorStore --> VectorMemory
```

**Diagram sources**
- [packages/engine/src/types/index.ts:1-150](file://packages/engine/src/types/index.ts#L1-L150)
- [packages/engine/src/story/structuredState.ts:23-235](file://packages/engine/src/story/structuredState.ts#L23-L235)
- [packages/engine/src/memory/vectorStore.ts:1-258](file://packages/engine/src/memory/vectorStore.ts#L1-L258)
- [packages/engine/src/constraints/constraintGraph.ts:1-150](file://packages/engine/src/constraints/constraintGraph.ts#L1-L150)
- [packages/engine/src/types/index.ts:92-113](file://packages/engine/src/types/index.ts#L92-L113)
- [packages/engine/src/llm/client.ts:49-249](file://packages/engine/src/llm/client.ts#L49-L249)

### Storage Layout
Stories are persisted under ~/.narrative-os/stories/<id> with the following files:
- bible.json: StoryBible
- state.json: StoryState
- chapters.json: Chapter[]
- **New**: structured-state.json: StoryStructuredState (automatically initialized)
- **New**: vector-store.json: VectorStore data (for memory with embeddings)
- **New**: constraint-graph.json: ConstraintGraph data (for validation)
- canon.json: CanonStore (optional, extracted if missing)
- **New**: command-history.json: Command execution history for hints system

**Section sources**
- [apps/cli/src/config/store.ts:15-49](file://apps/cli/src/config/store.ts#L15-L49)
- [apps/cli/src/config/store.ts:117-195](file://apps/cli/src/config/store.ts#L117-L195)

### Practical Examples and Workflows

Beginner workflows
- Configure provider and model: nos config
- **New**: Check configuration: nos config --show
- **New**: Check versions: nos version
- **New**: AI-assisted story creation: nos init (prompts for all fields, generates AI characters)
- **New**: Parameter-driven story creation: nos init --title "My Story" --genre "Fantasy" --chapters 8
- Generate chapters one-by-one: nos generate <story-id>
- Check progress: nos status <story-id>
- **New**: View story bible: nos bible <story-id>
- **New**: Get contextual help: nos hint

Power-user techniques
- Batch generation: nos continue <story-id>
- Automation script: loop nos generate until completion; handle exit code 0
- CI integration: pre-set environment variables for providers; run nos continue in a job
- **New**: Advanced narrative tracking: monitor character development and plot thread progression through structured state
- **New**: Memory management: search relevant story elements using nos memories with embedding support
- **New**: Quality assurance: validate story consistency with nos validate
- **New**: Story management: clone templates with nos clone, export finished works with nos export
- **New**: Chapter correction: regenerate specific chapters with nos regenerate
- **New**: Configuration verification: use `nos config --show` in deployment scripts to verify environment setup
- **New**: Version management: use `nos version` to verify CLI and engine versions in deployment scripts
- **New**: Interactive workflow optimization: combine interactive prompts with parameter overrides for partial automation
- **New**: Multi-model optimization: leverage separate reasoning, chat, and embedding models for best performance
- **New**: Task-based model selection: understand how different models are automatically selected for different operations
- **New**: Embedding configuration: set up provider-specific embeddings for vector memory operations
- **New**: Character generation customization: provide rich story context (title, premise, genre, setting) for authentic AI-generated characters

**Section sources**
- [PROGRESS.md:126-137](file://PROGRESS.md#L126-L137)
- [apps/cli/src/commands/continue.ts:22-46](file://apps/cli/src/commands/continue.ts#L22-L46)
- [packages/engine/src/story/structuredState.ts:181-235](file://packages/engine/src/story/structuredState.ts#L181-L235)
- [apps/cli/src/commands/hint.ts:25-46](file://apps/cli/src/commands/hint.ts#L25-L46)
- [apps/cli/src/commands/init.ts:17-90](file://apps/cli/src/commands/init.ts#L17-L90)
- [packages/engine/src/llm/client.ts:39-47](file://packages/engine/src/llm/client.ts#L39-L47)
- [packages/engine/src/memory/vectorStore.ts:125-177](file://packages/engine/src/memory/vectorStore.ts#L125-L177)
- [apps/cli/src/commands/version.ts:64-123](file://apps/cli/src/commands/version.ts#L64-L123)

### Interactive Prompts System Features
**New**: The enhanced CLI now provides a comprehensive interactive prompts system for story creation:

- **Dynamic Field Collection**: Users are prompted for title, genre, theme, setting, tone, premise, and target chapters
- **Input Validation**: Each field includes appropriate validation (required fields, minimum length, numeric ranges)
- **Default Values**: Intelligent defaults for common fields (e.g., "Redemption" for theme, "Modern day" for setting)
- **Genre Selection**: Predefined genre choices with user-friendly options
- **Flexible Input**: Supports both fully interactive mode and partial parameter overrides
- **Responsive Interface**: Asynchronous prompts provide immediate feedback and graceful cancellation
- **AI-Assisted Character Generation**: Automatic character creation using LLM-based prompts with story context

**Section sources**
- [apps/cli/src/commands/init.ts:17-90](file://apps/cli/src/commands/init.ts#L17-L90)
- [apps/cli/src/commands/init.ts:22-35](file://apps/cli/src/commands/init.ts#L22-L35)
- [apps/cli/src/commands/init.ts:57-64](file://apps/cli/src/commands/init.ts#L57-L64)

### AI-Assisted Character Generation Features
**New**: The enhanced CLI now provides sophisticated AI-assisted character generation:

- **LLM-Powered Creation**: Characters are generated using LLM-based prompts with story context (title, premise, genre, setting, language)
- **Authentic Names**: Character names are generated appropriate for the specified language and story setting
- **Role Distribution**: Includes exactly one protagonist, one antagonist, and 1-2 supporting characters
- **Personality Traits**: Generated traits create interesting conflicts and drive plot development
- **Goal Alignment**: Character goals align with the story premise and genre
- **Fallback System**: If LLM generation fails, default characters are provided based on language
- **Language Support**: Supports Chinese, Japanese, Korean, and English character generation
- **Integration**: Characters are automatically added to the StoryBible during initialization

**Section sources**
- [packages/engine/src/story/bible.ts:153-217](file://packages/engine/src/story/bible.ts#L153-L217)
- [packages/engine/src/story/bible.ts:222-242](file://packages/engine/src/story/bible.ts#L222-L242)

### Structured State Management Features
**New**: The enhanced CLI now provides sophisticated narrative tracking through structured state management:

- **Automatic Initialization**: Structured state is automatically created from StoryBible when a story is first generated
- **Character Tracking**: Detailed character states including emotional state, location, relationships, knowledge, and development
- **Plot Thread Management**: Dynamic tracking of plot thread status, tension levels, and involvement
- **Narrative Continuity**: Unresolved questions tracking and recent events logging
- **Integration**: Seamless integration with the StateUpdater agent for automated narrative state management

**Section sources**
- [packages/engine/src/story/structuredState.ts:23-85](file://packages/engine/src/story/structuredState.ts#L23-L85)
- [packages/engine/src/agents/stateUpdater.ts:85-193](file://packages/engine/src/agents/stateUpdater.ts#L85-L193)
- [apps/cli/src/config/store.ts:139-151](file://apps/cli/src/config/store.ts#L139-L151)

### Interactive Hints System Features
**New**: The CLI now includes an intelligent hints system that provides contextual guidance:

- **Context Detection**: Automatically identifies active stories and user context
- **Progress-Based Suggestions**: Tailors advice based on story completion status
- **Quick Command Access**: Provides direct command references for common operations
- **First-Time User Support**: Guides new users through initial setup and AI-assisted character creation
- **Completion Recognition**: Suggests next steps when stories are finished

**Section sources**
- [apps/cli/src/commands/hint.ts:3-47](file://apps/cli/src/commands/hint.ts#L3-L47)
- [apps/cli/src/commands/hint.ts:49-73](file://apps/cli/src/commands/hint.ts#L49-L73)

### Memory System Capabilities
**New**: The CLI integrates advanced memory management for narrative recall with embedding support:

- **Vector Storage**: Semantic memory storage with embeddings for relevant content
- **Search Functionality**: Query-based retrieval of narrative elements
- **Category Organization**: Automatic grouping of memories by narrative categories
- **Chapter Association**: Links memories to specific story chapters
- **Relevance Scoring**: Provides confidence ratings for memory matches
- **Embedding Integration**: Uses configured embedding models for vector operations

**Section sources**
- [apps/cli/src/commands/memories.ts:1-66](file://apps/cli/src/commands/memories.ts#L1-L66)
- [packages/engine/src/memory/vectorStore.ts:1-258](file://packages/engine/src/memory/vectorStore.ts#L1-L258)

### Validation and Quality Assurance
**New**: Comprehensive validation system ensures narrative consistency:

- **Constraint Checking**: Validates against established narrative constraints
- **Canon Compliance**: Ensures factual accuracy and timeline consistency
- **Quality Metrics**: Identifies issues like missing summaries or short chapters
- **Violation Reporting**: Distinguishes between errors and warnings
- **Progressive Validation**: Validates chapters as they're generated

**Section sources**
- [apps/cli/src/commands/validate.ts:1-107](file://apps/cli/src/commands/validate.ts#L1-L107)
- [packages/engine/src/constraints/constraintGraph.ts:1-150](file://packages/engine/src/constraints/constraintGraph.ts#L1-L150)
- [packages/engine/src/constraints/validator.ts:1-200](file://packages/engine/src/constraints/validator.ts#L1-L200)

### Configuration Display Features
**New**: The CLI now provides a convenient way to display current configuration without interactive setup:

- **Non-Interactive Display**: The `--show` flag allows users to quickly check their current configuration
- **Model Purpose Indicators**: Shows reasoning, chat, fast, and embedding model purposes with clear labeling
- **Multi-Model Visualization**: Displays all configured models with their purposes and providers
- **Immediate Feedback**: Shows provider, model, and API key status without any prompts
- **File Path Information**: Displays the exact location of the configuration file
- **Error Handling**: Gracefully handles cases where no configuration exists
- **Script Integration**: Ideal for use in automation scripts and CI/CD pipelines

**Section sources**
- [apps/cli/src/commands/config.ts:55-90](file://apps/cli/src/commands/config.ts#L55-L90)
- [apps/cli/src/commands/config.ts:66-89](file://apps/cli/src/commands/config.ts#L66-L89)
- [apps/cli/src/index.ts:34-40](file://apps/cli/src/index.ts#L34-L40)

### Enhanced Config Command Workflow
**New**: The enhanced config command provides multiple configuration modes:

- **Multi-Model Setup**: Interactive prompts for choosing reasoning and chat models with provider selection
- **Embedding Configuration**: Optional provider-specific embeddings setup for vector memory operations
- **Expanded Provider Integration**: Supports OpenAI, DeepSeek, Alibaba Cloud (Qwen), and ByteDance Ark with appropriate model recommendations
- **Backward Compatibility**: Automatic conversion from legacy single-model configurations
- **Non-Interactive Display**: `nos config --show` provides immediate configuration overview
- **Model Purpose Management**: Clear indication of model purposes (reasoning, chat, fast, embedding)
- **Flexible Integration**: Works seamlessly with automation scripts and CI/CD pipelines

**Section sources**
- [apps/cli/src/commands/config.ts:55-277](file://apps/cli/src/commands/config.ts#L55-L277)
- [apps/cli/src/index.ts:34-40](file://apps/cli/src/index.ts#L34-L40)
- [packages/engine/src/llm/client.ts:58-111](file://packages/engine/src/llm/client.ts#L58-L111)
- [packages/engine/src/memory/vectorStore.ts:125-177](file://packages/engine/src/memory/vectorStore.ts#L125-L177)

### Multi-Model Configuration Features
**New**: Revolutionary multi-model configuration system:

- **Separate Model Types**: Distinct reasoning models for complex creative tasks, chat models for validation, and embedding models for vector memory
- **Task-Based Selection**: Automatic model selection based on operation type (generation/planning vs validation/summarization vs embedding)
- **Backward Compatibility**: Seamless integration with existing single-model configurations
- **Environment Integration**: Multi-model configuration stored in LLM_MODELS_CONFIG environment variable
- **Expanded Provider Support**: OpenAI, DeepSeek, Alibaba Cloud (Qwen), and ByteDance Ark with appropriate model recommendations
- **Purpose Indicators**: Clear model purpose labeling (reasoning, chat, fast, embedding)
- **Default Model Management**: Configurable default model for fallback operations
- **Embedding Support**: Dedicated embedding models for vector memory operations

**Section sources**
- [apps/cli/src/commands/config.ts:8-30](file://apps/cli/src/commands/config.ts#L8-L30)
- [apps/cli/src/commands/config.ts:100-148](file://apps/cli/src/commands/config.ts#L100-L148)
- [packages/engine/src/types/index.ts:92-113](file://packages/engine/src/types/index.ts#L92-L113)
- [packages/engine/src/llm/client.ts:39-47](file://packages/engine/src/llm/client.ts#L39-L47)
- [packages/engine/src/llm/client.ts:113-125](file://packages/engine/src/llm/client.ts#L113-L125)

### Task-Based Model Selection
**New**: Intelligent model selection system:

- **Generation Tasks**: Uses reasoning models for complex creative writing and planning
- **Validation Tasks**: Uses chat models for validation and summarization
- **Extraction Tasks**: Uses chat models for memory/state extraction
- **Embedding Tasks**: Uses embedding models for vector memory operations
- **Default Fallback**: Uses chat models when no specific task is defined
- **Fast Models**: Available for summarization and extraction tasks
- **Automatic Selection**: Transparent model switching based on operation requirements
- **Performance Optimization**: Ensures optimal performance through appropriate model matching

**Section sources**
- [packages/engine/src/llm/client.ts:39-47](file://packages/engine/src/llm/client.ts#L39-L47)
- [packages/engine/src/llm/client.ts:113-125](file://packages/engine/src/llm/client.ts#L113-L125)
- [packages/engine/src/llm/client.ts:182-189](file://packages/engine/src/llm/client.ts#L182-L189)

### Embedding Configuration and Vector Memory
**New**: Advanced embedding support for vector memory operations:

- **Embedding Model Setup**: Optional provider-specific embeddings configuration for vector memory
- **Provider Limitations**: DeepSeek doesn't support embeddings, requiring separate OpenAI configuration; Alibaba Cloud and ByteDance Ark support native embeddings
- **Vector Operations**: Semantic search and memory recall using embedding vectors
- **Dimension Support**: text-embedding-3-small (1536) for optimal performance
- **Fallback Mechanisms**: Mock embeddings for testing environments
- **API Integration**: Direct provider-specific embeddings API integration with error handling
- **Memory Persistence**: Vector store data stored in vector-store.json for efficient retrieval

**Section sources**
- [apps/cli/src/commands/config.ts:126-147](file://apps/cli/src/commands/config.ts#L126-L147)
- [packages/engine/src/memory/vectorStore.ts:21-258](file://packages/engine/src/memory/vectorStore.ts#L21-L258)
- [packages/engine/src/llm/client.ts:192-200](file://packages/engine/src/llm/client.ts#L192-L200)

### Version Command Features
**New**: Comprehensive version information display system:

- **CLI Version**: Shows CLI package name, version, and description
- **Engine Version**: Displays engine module version when installed
- **Extension Modules**: Lists installed extension modules with their versions
- **Development Mode**: Detects and reports local development mode
- **Installation Guidance**: Provides update instructions for latest versions
- **Error Handling**: Gracefully handles missing modules or package information
- **Cross-Platform Support**: Works across different Node.js environments

**Section sources**
- [apps/cli/src/commands/version.ts:64-123](file://apps/cli/src/commands/version.ts#L64-L123)
- [apps/cli/package.json:1-50](file://apps/cli/package.json#L1-L50)

### Enhanced Provider Integration
**New**: Comprehensive provider support system:

- **OpenAI**: Full embedding support with text-embedding-3-small (1536 dimensions)
- **DeepSeek**: Specialized reasoning models (deepseek-reasoner) with separate embedding configuration
- **Alibaba Cloud (Qwen)**: Native embedding support with text-embedding-v3 model
- **ByteDance Ark**: Native embedding support with doubao-embedding model
- **Base URL Configuration**: Provider-specific base URLs for API compatibility
- **Model Recommendations**: Intelligent default model selection based on provider capabilities
- **API Key Management**: Separate API key handling for each provider with masked display

**Section sources**
- [apps/cli/src/commands/config.ts:32-37](file://apps/cli/src/commands/config.ts#L32-L37)
- [apps/cli/src/commands/config.ts:194-207](file://apps/cli/src/commands/config.ts#L194-L207)
- [packages/engine/src/memory/vectorStore.ts:200-218](file://packages/engine/src/memory/vectorStore.ts#L200-L218)

### Character Generation Fallback System
**New**: Robust fallback system for character generation:

- **LLM Generation Failure**: When AI character generation fails, default characters are provided
- **Language-Based Defaults**: Characters are selected based on story language (Chinese, Japanese, Korean, English)
- **Authentic Role Distribution**: Maintains the required character roles even in fallback scenarios
- **Consistent Personality**: Default personality traits align with cultural contexts
- **Goal Alignment**: Default goals are appropriate for the story genre and setting
- **Seamless Integration**: Fallback characters integrate identically with the StoryBible structure

**Section sources**
- [packages/engine/src/story/bible.ts:212-242](file://packages/engine/src/story/bible.ts#L212-L242)