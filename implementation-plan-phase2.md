# Narrative OS Extended Implementation Plan - Phase 2

Based on discussions from round_009 to round_019, this plan extends the core engine into a full narrative simulation platform.

## Phase 11: Plugin Ecosystem Foundation

**Goal:** Create extensible plugin system for skills, genres, and characters

### 11.1 Gallery Modules (3 packages)

Create three npm packages as content registries:

```
@narrative-os/skills      - Writing technique plugins
@narrative-os/genres      - Genre convention packs
@narrative-os/characters  - Character archetype templates
```

**Key Features:**
- Skill interface: `apply(context) → instructions[]`
- Genre interface: `tropes[], scenePatterns[]`
- Character interface: `personality[], goals[], dialogueStyle[]`
- Registry pattern for dynamic loading
- Local pack override support

**Files to Create:**
- `packages/skills/src/registry.ts`
- `packages/skills/src/skills/suspense.ts`
- `packages/skills/src/skills/dialogue.ts`
- `packages/genres/src/registry.ts`
- `packages/genres/src/genres/thriller.ts`
- `packages/characters/src/registry.ts`
- `packages/characters/src/characters/noirDetective.ts`

### 11.2 Plugin Manager

Create plugin loading system:

```typescript
// engine/plugin/pluginManager.ts
- Auto-discover @narrative-os/* packages
- Load skills/genres/characters from registry
- Merge local packs with gallery packs
- Priority: local > gallery > default
```

### 11.3 CLI Integration

Add plugin flags to CLI:

```bash
nos init --genre thriller --skills suspense,dialogue
nos generate <id> --skill cliffhanger
```

---

## Phase 12: Scene-Level Generation

**Goal:** Replace chapter-level generation with scene-by-scene generation

### 12.1 Scene Architecture

**New Pipeline:**
```
Story Director → Chapter Planner → Scene Planner → Scene Generator (loop) → Chapter Assembler
```

**Scene Object:**
```typescript
interface Scene {
  id: number
  location: string
  characters: string[]
  purpose: string
  tension: number
  conflict?: string
  type?: 'dialogue' | 'action' | 'reveal' | 'investigation'
}
```

### 12.2 Scene Generator

Create new generation pipeline:

**Files:**
- `engine/scene/sceneGenerator.ts` - Generate individual scenes
- `engine/scene/sceneValidator.ts` - Validate scene consistency
- `engine/scene/sceneAssembler.ts` - Combine scenes into chapter
- `engine/scene/sceneOutcomeExtractor.ts` - Extract state updates

**Scene Writer Prompt:**
```
Write a single scene.

Scene Information:
Location: {{location}}
Characters: {{characters}}
Purpose: {{purpose}}
Conflict: {{conflict}}
Target Tension: {{tension}}

Previous Scene Summary: {{previous_summary}}
Active Skills: {{skills}}

Write immersive narrative prose.
End naturally for next scene to continue.
```

### 12.3 Memory Updates Per Scene

Update memory after every scene (not just chapter):
- Extract events from scene
- Update vector store
- Update structured state
- Character knowledge tracking

---

## Phase 13: Character Agents

**Goal:** Convert characters into autonomous agents with memory and goals

### 13.1 Character Agent Model

```typescript
interface CharacterAgent {
  name: string
  personality: string[]
  goals: string[]
  knowledge: string[]
  emotionalState: Record<string, number>
  memories: string[]
}
```

### 13.2 Character Decision Engine

**Files:**
- `engine/agents/characterAgent.ts` - Character reasoning
- `engine/agents/characterMemory.ts` - Personal memory per character
- `engine/agents/emotionEngine.ts` - Emotional state tracking

**Decision Prompt:**
```
You are {{character}}.
Personality: {{personality}}
Goals: {{goals}}
Current Emotion: {{emotion}}

Scene Context:
Location: {{location}}
Other Characters: {{others}}
Purpose: {{purpose}}

What action do you take?
Return JSON: { intent, dialogue_goal, emotion }
```

### 13.3 Multi-Character Scenes

Run character reasoning sequentially:
```
Kai agent reasoning → Rhea agent reasoning → Merge intentions → Scene Composer
```

### 13.4 Scene Composer

Generate final scene using character intentions:
```
Character Intentions:
Kai: inspect terminal secretly, nervous curiosity
Rhea: watch Kai suspiciously, confront if necessary

Write narrative scene...
```

---

## Phase 14: Story World State Engine

**Goal:** Create authoritative database of story reality

### 14.1 World State Data Model

```typescript
interface WorldState {
  characters: Record<string, CharacterState>
  locations: Record<string, LocationState>
  objects: Record<string, ObjectState>
  relationships: Record<string, RelationshipState>
  timeline: TimelineEvent[]
}
```

**State Types:**
```typescript
CharacterState: { name, alive, location, knownInformation[], emotionalState }
LocationState: { name, description, charactersPresent[] }
ObjectState: { name, location, discoveredBy[], owner? }
RelationshipState: { characterA, characterB, trust, hostility }
TimelineEvent: { chapter, description, timestamp }
```

### 14.2 World State Engine

**Files:**
- `engine/world/worldStateEngine.ts` - Core state management
- `engine/world/stateUpdater.ts` - Apply scene outcomes to state
- `engine/world/stateValidator.ts` - Check consistency

**Storage:**
```
.story/
  world_state.json      - Structured world facts
  character_memory.json - Per-character memories
  timeline.json         - Event history
```

### 14.3 Scene Integration

**Before Generation:**
```
Retrieve world state → Retrieve character memories → Generate scene
```

**After Generation:**
```
Extract state changes → Update world state → Update memories
```

---

## Phase 15: Graph World Model

**Goal:** Represent world as graph for better querying

### 15.1 Graph Data Model

```typescript
interface Node {
  id: string
  type: 'character' | 'location' | 'object' | 'event'
  properties: Record<string, any>
}

interface Edge {
  from: string
  to: string
  relation: string
  properties?: Record<string, any>
}
```

### 15.2 Graph Engine

**Files:**
- `engine/graph/worldGraphEngine.ts` - Graph storage and queries
- `engine/graph/graphQueries.ts` - Common query functions
- `engine/graph/graphUpdater.ts` - Apply updates

**Core Queries:**
```typescript
getLocation(character): string
getCharactersInLocation(location): string[]
getRelationships(character): Edge[]
getKnownObjects(character): string[]
getNeighbors(node, depth): Subgraph
```

### 15.3 Graph Storage

**Option 1 (Start):** JSON file
```json
{
  "nodes": [...],
  "edges": [...]
}
```

**Option 2 (Future):** SQLite or Neo4j

### 15.4 Graph Updates

Extract graph changes from scenes:
```
New edges: Kai ─ discovered ─ HiddenTerminal
Updates: Kai ─ located_in ─ ArchiveRoom
```

---

## Phase 16: Narrative Constraints Graph (NCG)

**Goal:** Define story rules and plot dependencies

### 16.1 NCG vs World Graph

```
NCG = Rules (what MUST be true)
World Graph = Reality (what IS true)
```

**NCG Examples:**
```
RevealIdentity ─ requires ─ HiddenTerminalDiscovery
KaiDeath ─ forbidden_before ─ Chapter20
SecretReveal ─ prerequisite_for ─ FinalConfrontation
```

### 16.2 Constraint Engine

**Files:**
- `engine/constraints/constraintsGraph.ts` - Constraint storage
- `engine/constraints/constraintValidator.ts` - Check rules
- `engine/constraints/constraintEngine.ts` - Evaluate satisfaction

### 16.3 Director Integration

Director decision flow:
```
Scan world graph for tensions
↓
Check constraints graph
↓
Remove forbidden scenes
↓
Select best opportunity
```

---

## Phase 17: Tension Detection Engine

**Goal:** Automatically identify compelling scene opportunities

### 17.1 Tension Types

```
1. Conflict Tension   - Hostile characters in same location
2. Secret Tension     - Character knows secret others don't
3. Goal Collision     - Characters with opposing goals
4. Discovery Tension  - Undiscovered objects in location
```

### 17.2 Detection Rules

**Files:**
- `engine/tension/tensionEngine.ts` - Main detection
- `engine/tension/rules/conflictRule.ts`
- `engine/tension/rules/secretRule.ts`
- `engine/tension/rules/goalCollisionRule.ts`
- `engine/tension/rules/discoveryRule.ts`

**Rule Interface:**
```typescript
interface TensionRule {
  name: string
  detect(graph): TensionOpportunity[]
}

interface TensionOpportunity {
  type: string
  characters: string[]
  location?: string
  description: string
  tensionScore: number
}
```

### 17.3 Opportunity Scoring

```typescript
score = hostility * 0.4 + goalConflict * 0.4 + novelty * 0.2
```

### 17.4 Director Integration

```
Graph updated → Scan tension rules → Store opportunities → Director selects
```

---

## Phase 18: Narrative Scope Windows

**Goal:** Load only relevant context for each scene

### 18.1 Scope Window Content

```typescript
interface ScopeWindow {
  characters: string[]
  location: string
  graphSubgraph: { nodes, edges }
  relevantMemories: string[]
  constraints: Constraint[]
}
```

### 18.2 Scope Builder

**Files:**
- `engine/scope/scopeBuilder.ts` - Build scope windows
- `engine/scope/graphSubgraph.ts` - Extract graph subset
- `engine/scope/memoryFilter.ts` - Filter memories
- `engine/scope/constraintFilter.ts` - Filter constraints

### 18.3 Subgraph Extraction

Extract nodes within 2 hops of active characters:
```
Kai ─ distrusts ─ Rhea
Kai ─ located_in ─ ArchiveRoom
HiddenTerminal ─ located_in ─ ArchiveRoom
↓
Subgraph: Kai, Rhea, ArchiveRoom, HiddenTerminal
```

### 18.4 Memory Filtering

Query vector store with:
```
Kai, ArchiveRoom, HiddenTerminal
```

Return only relevant memories.

### 18.5 Performance Benefits

```
Without scope: 2000+ graph edges, 6000+ tokens
With scope: 20-40 edges, 500-800 tokens
```

---

## Phase 19: Agent Skill Interface

**Goal:** Make NarrativeOS callable by other AI agents

### 19.1 Service Layer

Extract CLI logic into service:
```typescript
// engine/service/narrativeService.ts
export async function generateChapter(input)
export async function generateScene(input)
export async function planStory(input)
export async function evaluateEngagement(input)
```

### 19.2 Skill Package

Create `@narrative-os/agent-skill`:
```typescript
export const skills = [
  generateChapterSkill,
  generateSceneSkill,
  planStorySkill
]
```

### 19.3 HTTP Tool Server (Optional)

```typescript
// server.ts
app.post('/generate-chapter', async (req, res) => {
  const chapter = await generateChapter(req.body)
  res.json({ chapter })
})
```

---

## Phase 20: Reader Engagement Evaluation

**Goal:** Evaluate and improve chapter quality

### 20.1 Engagement Agent

Add to pipeline after validator:
```
write chapter → validator → engagement evaluator → memory update
```

**Evaluation Prompt:**
```
Evaluate reader engagement for this chapter.

Score (0-10):
- Curiosity
- Emotional investment
- Tension
- Character interest

Return JSON with scores and suggestions.
```

### 20.2 Feedback Loop

Low engagement → Director injects:
```
- Add conflict
- Introduce new question
- Increase stakes
```

---

## Final Architecture

```
NarrativeOS

┌─────────────────────────────────────────┐
│  Narrative Constraints Graph            │
│  (story rules, plot dependencies)       │
├─────────────────────────────────────────┤
│  World Graph Engine                     │
│  (characters, locations, relationships) │
├─────────────────────────────────────────┤
│  Scope Window Engine                    │
│  (context filtering)                    │
├─────────────────────────────────────────┤
│  Tension Detection Engine               │
│  (scene opportunities)                  │
├─────────────────────────────────────────┤
│  Character Agents                       │
│  (decision making, emotions)            │
├─────────────────────────────────────────┤
│  Story Director                         │
│  (scene selection, planning)            │
├─────────────────────────────────────────┤
│  Scene Generator                        │
│  Scene Validator                        │
│  Engagement Evaluator                   │
├─────────────────────────────────────────┤
│  Memory Engine (Vector + Structured)    │
├─────────────────────────────────────────┤
│  Plugin System                          │
│  (skills, genres, characters)           │
├─────────────────────────────────────────┤
│  Interfaces                             │
│  CLI | Agent Skill API | HTTP Server    │
└─────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Foundation (Must Have)
These are **fundamental** - the engine cannot work properly without them:

1. **Scene-level generation (Phase 12)** - Biggest quality improvement
2. **World State Engine (Phase 14)** - Prevents long-story collapse
3. **Scope Windows (Phase 18)** - Required for performance

### Phase 2: Ecosystem (Important)
These add **extensibility and depth**:

4. **Plugin System (Phase 11)** - Skills, genres, characters
5. **Character Agents (Phase 13)** - Better dialogue and decisions
6. **Engagement Evaluation (Phase 20)** - Quality feedback loop

### Phase 3: Advanced (Optional)
These are **nice-to-have optimizations** - engine works fine without them:

7. **Graph World Model (Phase 15)** - Better than JSON state, but not required
8. **Narrative Constraints Graph (Phase 16)** - Story rules, adds structure
9. **Tension Detection (Phase 17)** - Automatic scene suggestions
10. **Agent Skill Interface (Phase 19)** - For other AI agents to call NarrativeOS

**Recommendation:** Build Phase 1 first. The engine will be powerful with just those 3 phases. Add Phase 2 for extensibility. Phase 3 is for future optimization.

---

## New npm Packages to Create

| Package | Purpose |
|---------|---------|
| `@narrative-os/skills` | Writing technique plugins |
| `@narrative-os/genres` | Genre convention packs |
| `@narrative-os/characters` | Character archetypes |
| `@narrative-os/agent-skill` | Agent framework integration |

---

## Success Metrics

- **Quality:** Stories maintain consistency past 50+ chapters
- **Performance:** Scene generation < 5 seconds with scope windows
- **Extensibility:** Third-party plugins can be created
- **Integration:** Other AI agents can call NarrativeOS
