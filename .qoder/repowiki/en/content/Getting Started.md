# Getting Started

<cite>
**Referenced Files in This Document**
- [apps/cli/src/index.ts](file://apps/cli/src/index.ts)
- [apps/cli/package.json](file://apps/cli/package.json)
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts)
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts)
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts)
- [apps/cli/src/commands/status.ts](file://apps/cli/src/commands/status.ts)
- [apps/cli/src/config/store.ts](file://apps/cli/src/config/store.ts)
- [packages/engine/src/index.ts](file://packages/engine/src/index.ts)
- [packages/engine/src/llm/client.ts](file://packages/engine/src/llm/client.ts)
- [packages/engine/src/pipeline/generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts)
- [packages/engine/src/story/bible.ts](file://packages/engine/src/story/bible.ts)
- [packages/engine/src/story/state.ts](file://packages/engine/src/story/state.ts)
- [packages/engine/src/types/index.ts](file://packages/engine/src/types/index.ts)
- [package.json](file://package.json)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [turbo.json](file://turbo.json)
</cite>

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
This guide helps you install and use the Narrative Operating System CLI tool (“nos”) to create and grow stories powered by AI. You will configure your LLM provider, initialize a story with rich metadata and characters, and generate chapters iteratively. We also cover environment setup, workspace installation via PNPM, and troubleshooting common issues.

Prerequisites:
- Basic command-line familiarity
- Understanding of TypeScript fundamentals (classes, interfaces, modules)
- Access to an OpenAI or DeepSeek API key

## Project Structure
The project is a PNPM workspace with two main areas:
- apps/cli: The nos CLI application
- packages/engine: The narrative engine that powers story creation, chapter generation, and LLM orchestration

```mermaid
graph TB
subgraph "Workspace"
PNPM["pnpm-workspace.yaml"]
RootPkg["package.json"]
Turbo["turbo.json"]
end
subgraph "CLI App"
CLIIndex["apps/cli/src/index.ts"]
CLIConfig["apps/cli/src/commands/config.ts"]
CLIInit["apps/cli/src/commands/init.ts"]
CLIGen["apps/cli/src/commands/generate.ts"]
CLIStatus["apps/cli/src/commands/status.ts"]
CLIStore["apps/cli/src/config/store.ts"]
end
subgraph "Engine Package"
EngineIndex["packages/engine/src/index.ts"]
EngineTypes["packages/engine/src/types/index.ts"]
EngineLLM["packages/engine/src/llm/client.ts"]
EngineGen["packages/engine/src/pipeline/generateChapter.ts"]
EngineBible["packages/engine/src/story/bible.ts"]
EngineState["packages/engine/src/story/state.ts"]
end
PNPM --> RootPkg
RootPkg --> Turbo
CLIIndex --> CLIConfig
CLIIndex --> CLIInit
CLIIndex --> CLIGen
CLIIndex --> CLIStatus
CLIInit --> EngineIndex
CLIGen --> EngineIndex
CLIStore --> EngineIndex
EngineGen --> EngineLLM
EngineGen --> EngineBible
EngineGen --> EngineState
```

**Diagram sources**
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L4)
- [package.json](file://package.json#L1-L17)
- [turbo.json](file://turbo.json#L1-L19)
- [apps/cli/src/index.ts](file://apps/cli/src/index.ts#L1-L54)
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts#L1-L84)
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts#L1-L50)
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts#L1-L55)
- [apps/cli/src/commands/status.ts](file://apps/cli/src/commands/status.ts#L1-L55)
- [apps/cli/src/config/store.ts](file://apps/cli/src/config/store.ts#L1-L78)
- [packages/engine/src/index.ts](file://packages/engine/src/index.ts#L1-L23)
- [packages/engine/src/llm/client.ts](file://packages/engine/src/llm/client.ts#L1-L106)
- [packages/engine/src/pipeline/generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L1-L76)
- [packages/engine/src/story/bible.ts](file://packages/engine/src/story/bible.ts#L1-L73)
- [packages/engine/src/story/state.ts](file://packages/engine/src/story/state.ts#L1-L30)
- [packages/engine/src/types/index.ts](file://packages/engine/src/types/index.ts#L1-L90)

**Section sources**
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L4)
- [package.json](file://package.json#L1-L17)
- [turbo.json](file://turbo.json#L1-L19)
- [apps/cli/src/index.ts](file://apps/cli/src/index.ts#L1-L54)

## Core Components
- CLI entrypoint defines the nos commands and wires configuration application.
- Configuration command stores provider, model, and API keys in a user-local config file.
- Init command creates a story bible, adds characters, initializes state, and persists the story.
- Generate command produces the next chapter, validates against canon, updates state, and persists results.
- Status command lists or prints details for a given story.
- Store module manages per-story directories and JSON persistence.
- Engine exports story creation, state management, LLM client, and the chapter generation pipeline.

**Section sources**
- [apps/cli/src/index.ts](file://apps/cli/src/index.ts#L1-L54)
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts#L1-L84)
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts#L1-L50)
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts#L1-L55)
- [apps/cli/src/commands/status.ts](file://apps/cli/src/commands/status.ts#L1-L55)
- [apps/cli/src/config/store.ts](file://apps/cli/src/config/store.ts#L1-L78)
- [packages/engine/src/index.ts](file://packages/engine/src/index.ts#L1-L23)

## Architecture Overview
The CLI orchestrates user actions and delegates to the engine for story and chapter lifecycle management. The engine encapsulates LLM interactions, story metadata, and the generation pipeline.

```mermaid
sequenceDiagram
participant User as "User"
participant CLI as "nos CLI"
participant Store as "Store (persist)"
participant Engine as "Engine"
participant LLM as "LLM Provider"
User->>CLI : "nos config"
CLI->>CLI : "Prompt provider/model/API key"
CLI->>Store : "Write ~/.narrative-os/config.json"
CLI-->>User : "Saved"
User->>CLI : "nos init [options]"
CLI->>Engine : "createStoryBible()"
CLI->>Engine : "addCharacter() x2"
CLI->>Engine : "createStoryState()"
CLI->>Store : "saveStory(bible, state, chapters=[])"
CLI-->>User : "Story created with ID"
User->>CLI : "nos generate <story-id>"
CLI->>Store : "loadStory(<story-id>)"
CLI->>Engine : "generateChapter(context)"
Engine->>LLM : "writer prompts"
LLM-->>Engine : "content"
Engine->>Engine : "completeness check + optional canon validation"
Engine->>Engine : "summarize"
Engine->>Store : "saveStory(updated state, chapters, canon)"
Engine-->>CLI : "result {chapter, summary, violations}"
CLI-->>User : "Chapter generated and progress"
```

**Diagram sources**
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts#L38-L66)
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts#L23-L48)
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts#L4-L53)
- [apps/cli/src/config/store.ts](file://apps/cli/src/config/store.ts#L15-L26)
- [packages/engine/src/pipeline/generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L20-L71)
- [packages/engine/src/llm/client.ts](file://packages/engine/src/llm/client.ts#L31-L81)

## Detailed Component Analysis

### Installation and Workspace Setup
- Use PNPM workspace to build and develop the CLI and engine.
- Build the entire workspace or focus on the CLI during development.

Steps:
- Install PNPM globally if not present.
- From the repository root, install dependencies and link workspaces.
- Build the workspace or run the CLI in development mode.

Verification:
- Running the CLI binary should print help and version info.

**Section sources**
- [package.json](file://package.json#L5-L10)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L4)
- [apps/cli/package.json](file://apps/cli/package.json#L7-L11)

### Initial Configuration (LLM Providers)
- The CLI writes a user-local configuration file containing provider, model, and API key.
- On startup, the CLI reads the config and sets environment variables consumed by the engine’s LLM client.

Supported providers and models:
- OpenAI: gpt-4o, gpt-4o-mini, gpt-4-turbo
- DeepSeek: deepseek-chat, deepseek-reasoner

Environment variables set:
- LLM_PROVIDER, LLM_MODEL
- OPENAI_API_KEY for OpenAI
- DEEPSEEK_API_KEY for DeepSeek

Verification:
- After running the configuration command, confirm the config file exists and contains the selected provider and model.
- Confirm environment variables are applied by running the CLI again.

**Section sources**
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts#L14-L22)
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts#L72-L83)
- [packages/engine/src/llm/client.ts](file://packages/engine/src/llm/client.ts#L46-L65)

### First Story Creation Workflow
- Initialize a story with metadata (title, theme, genre, setting, tone, premise) and target chapter count.
- Add characters (e.g., protagonist and antagonist) with roles, personality traits, and goals.
- Persist the story and receive a story ID for subsequent generation.

Practical example parameters:
- Title: “The Memory Cartographer”
- Theme: “Identity and legacy”
- Genre: “Speculative Fiction”
- Setting: “Neo-Athens, 2157”
- Tone: “Melancholic, hopeful”
- Premise: “A memory architect discovers a hidden archive that rewrites the past.”
- Target chapters: 5–10

Next step:
- Use the story ID to generate the first chapter.

**Section sources**
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts#L15-L21)
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts#L23-L48)
- [packages/engine/src/story/bible.ts](file://packages/engine/src/story/bible.ts#L3-L26)
- [packages/engine/src/story/bible.ts](file://packages/engine/src/story/bible.ts#L28-L48)

### Generating Chapters
- The CLI loads the story, checks if the story is complete, and prepares a generation context.
- The engine generates content, validates completeness, optionally validates against canon, summarizes, and persists results.
- Progress is printed, including chapter title, word count, and summary.

Typical flow:
- Run “nos generate <story-id>” to produce the next chapter.
- Repeat until the story reaches the target chapter count.

**Section sources**
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts#L4-L53)
- [packages/engine/src/pipeline/generateChapter.ts](file://packages/engine/src/pipeline/generateChapter.ts#L20-L71)
- [packages/engine/src/llm/client.ts](file://packages/engine/src/llm/client.ts#L78-L95)

### Managing Stories (List and Inspect)
- List all stories or inspect a specific story’s details, progress, and recent summaries.
- Useful for verifying persistence and tracking completion.

**Section sources**
- [apps/cli/src/commands/status.ts](file://apps/cli/src/commands/status.ts#L3-L54)
- [apps/cli/src/config/store.ts](file://apps/cli/src/config/store.ts#L51-L75)

### Persistence and Data Model
- Stories are stored under a user-local directory with per-story JSON files for bible, state, chapters, and optional canon.
- The engine can also extract a default canon from the story bible.

**Section sources**
- [apps/cli/src/config/store.ts](file://apps/cli/src/config/store.ts#L15-L26)
- [apps/cli/src/config/store.ts](file://apps/cli/src/config/store.ts#L28-L49)
- [packages/engine/src/index.ts](file://packages/engine/src/index.ts#L21-L22)

## Dependency Analysis
The CLI depends on the engine package and uses the commander library for CLI parsing. The engine encapsulates LLM configuration, story modeling, and the generation pipeline.

```mermaid
graph LR
CLI["CLI (apps/cli)"] --> CMDConfig["config.ts"]
CLI --> CMDInit["init.ts"]
CLI --> CMDGen["generate.ts"]
CLI --> CMDStatus["status.ts"]
CLI --> Store["store.ts"]
CLI --> Engine["@narrative-os/engine"]
Engine --> Types["types/index.ts"]
Engine --> LLM["llm/client.ts"]
Engine --> Gen["pipeline/generateChapter.ts"]
Engine --> Bible["story/bible.ts"]
Engine --> State["story/state.ts"]
```

**Diagram sources**
- [apps/cli/src/index.ts](file://apps/cli/src/index.ts#L3-L7)
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts#L1-L3)
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts#L1-L2)
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts#L1-L2)
- [apps/cli/src/commands/status.ts](file://apps/cli/src/commands/status.ts#L1-L1)
- [apps/cli/src/config/store.ts](file://apps/cli/src/config/store.ts#L1-L5)
- [packages/engine/src/index.ts](file://packages/engine/src/index.ts#L1-L23)

**Section sources**
- [apps/cli/package.json](file://apps/cli/package.json#L12-L16)
- [packages/engine/src/index.ts](file://packages/engine/src/index.ts#L1-L23)

## Performance Considerations
- Generation cost and latency depend on the selected model and prompt length. Larger models may increase token usage.
- The generator retries to ensure completeness up to a configured limit; this increases runtime but improves quality.
- Persisting frequently after each chapter keeps data safe but adds disk I/O overhead.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Story not found when generating:
  - Verify the story ID exists by listing stories or checking the local storage directory.
  - Ensure the story was created with the init command and persisted successfully.
- Configuration errors:
  - Re-run the configuration command to set provider, model, and API key.
  - Confirm environment variables are set by the CLI’s applyConfig routine.
- LLM provider failures:
  - Check that the API key is valid and the model is supported by the provider.
  - Confirm network connectivity and rate limits.
- Workspace build issues:
  - Ensure PNPM is installed and the workspace is linked.
  - Rebuild the engine and CLI packages if changes are not reflected.

Verification steps:
- Use the status command to list stories and confirm progress.
- Confirm the presence of story JSON files in the local stories directory.

**Section sources**
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts#L7-L10)
- [apps/cli/src/commands/status.ts](file://apps/cli/src/commands/status.ts#L4-L21)
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts#L72-L83)
- [packages/engine/src/llm/client.ts](file://packages/engine/src/llm/client.ts#L46-L65)

## Conclusion
You now have the essentials to install the CLI, configure an LLM provider, initialize a story, and generate chapters iteratively. Use the status command to track progress and rely on the engine’s built-in validation and summarization to maintain narrative coherence. As you become more comfortable, explore advanced options in the init command and experiment with different models and prompts.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Quick Start Checklist
- Install PNPM and workspace dependencies.
- Configure provider and API key via the CLI.
- Initialize a story with desired metadata and characters.
- Generate the first chapter and iterate until completion.
- Use status to monitor progress.

**Section sources**
- [apps/cli/src/index.ts](file://apps/cli/src/index.ts#L18-L43)
- [apps/cli/src/commands/config.ts](file://apps/cli/src/commands/config.ts#L38-L66)
- [apps/cli/src/commands/init.ts](file://apps/cli/src/commands/init.ts#L15-L48)
- [apps/cli/src/commands/generate.ts](file://apps/cli/src/commands/generate.ts#L4-L53)
- [apps/cli/src/commands/status.ts](file://apps/cli/src/commands/status.ts#L3-L54)