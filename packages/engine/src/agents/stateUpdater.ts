import { getLLM } from '../llm/client.js';
import type { Chapter, StoryBible } from '../types/index.js';
import type { StoryStructuredState, CharacterState, PlotThreadState } from '../story/structuredState.js';

interface StateUpdateOutput {
  characterUpdates: Array<{
    name: string;
    emotionalState?: string;
    location?: string;
    newKnowledge?: string[];
    relationshipChanges?: Array<{ with: string; status: string }>;
    development?: string;
  }>;
  plotThreadUpdates: Array<{
    id: string;
    status?: 'dormant' | 'active' | 'escalating' | 'resolved';
    tensionChange?: number; // -0.1 to +0.1
    summary?: string;
  }>;
  newQuestions: string[];
  resolvedQuestions: string[];
  recentEvents: string[];
}

const STATE_UPDATE_PROMPT = `You are a narrative state tracker. Analyze the chapter and extract state changes.

## Story Bible

**Title:** {{title}}
**Genre:** {{genre}}

## Characters

{{characters}}

## Current Plot Threads

{{plotThreads}}

## Chapter Content

**Chapter {{chapterNumber}}: {{chapterTitle}}**

{{chapterContent}}

## Current Unresolved Questions

{{unresolvedQuestions}}

## Task

Analyze what changed in this chapter. Output JSON with:

1. **characterUpdates**: How characters changed (emotion, location, knowledge, relationships)
2. **plotThreadUpdates**: How plot threads progressed (status, tension)
3. **newQuestions**: New mysteries or questions raised
4. **resolvedQuestions**: Which current questions were answered
5. **recentEvents**: Key events that happened (2-3 bullet points)

Example output:
{
  "characterUpdates": [
    {
      "name": "Alice",
      "emotionalState": "anxious",
      "location": "the abandoned warehouse",
      "newKnowledge": ["the code is 8472"],
      "relationshipChanges": [{"with": "Bob", "status": "distrustful"}],
      "development": "Alice realizes she can't trust her mentor"
    }
  ],
  "plotThreadUpdates": [
    {
      "id": "missing_brother",
      "status": "escalating",
      "tensionChange": 0.1,
      "summary": "Discovered brother was kidnapped by the syndicate"
    }
  ],
  "newQuestions": ["Who is the mysterious informant?"],
  "resolvedQuestions": ["Where was the brother taken?"],
  "recentEvents": ["Alice broke into the warehouse", "Found the hidden room"]
}`;

export class StateUpdater {
  async extractStateChanges(
    chapter: Chapter,
    bible: StoryBible,
    currentState: StoryStructuredState
  ): Promise<StateUpdateOutput> {
    const characters = Object.values(currentState.characters)
      .map(c => `- ${c.name}: currently ${c.emotionalState}, at ${c.location}`)
      .join('\n') || 'No characters tracked yet.';

    const plotThreads = Object.values(currentState.plotThreads)
      .map(t => `- ${t.name} (${t.status}, tension: ${Math.round(t.tension * 100)}%): ${t.summary}`)
      .join('\n') || 'No active plot threads.';

    const unresolvedQuestions = currentState.unresolvedQuestions.length > 0
      ? currentState.unresolvedQuestions.map(q => `- ${q}`).join('\n')
      : 'None';

    const prompt = STATE_UPDATE_PROMPT
      .replace('{{title}}', bible.title)
      .replace('{{genre}}', bible.genre)
      .replace('{{characters}}', characters)
      .replace('{{plotThreads}}', plotThreads)
      .replace('{{chapterNumber}}', chapter.number.toString())
      .replace('{{chapterTitle}}', chapter.title)
      .replace('{{chapterContent}}', chapter.content.substring(0, 6000))
      .replace('{{unresolvedQuestions}}', unresolvedQuestions);

    const result = await getLLM().completeJSON<StateUpdateOutput>(prompt, {
      temperature: 0.3,
      maxTokens: 2000,
    });

    return result;
  }

  applyUpdates(
    state: StoryStructuredState,
    updates: StateUpdateOutput,
    chapterNumber: number
  ): StoryStructuredState {
    let newState = { ...state };

    // Apply character updates
    for (const update of updates.characterUpdates) {
      if (newState.characters[update.name]) {
        const char = newState.characters[update.name];
        
        if (update.emotionalState) {
          char.emotionalState = update.emotionalState;
        }
        if (update.location) {
          char.location = update.location;
        }
        if (update.newKnowledge) {
          char.knowledge = [...char.knowledge, ...update.newKnowledge];
        }
        if (update.relationshipChanges) {
          for (const rel of update.relationshipChanges) {
            char.relationships[rel.with] = rel.status;
          }
        }
        if (update.development) {
          char.development = [...char.development, update.development];
        }
      }
    }

    // Apply plot thread updates
    for (const update of updates.plotThreadUpdates) {
      if (newState.plotThreads[update.id]) {
        const thread = newState.plotThreads[update.id];
        
        if (update.status) {
          thread.status = update.status;
        }
        if (update.tensionChange !== undefined) {
          thread.tension = Math.max(0, Math.min(1, thread.tension + update.tensionChange));
        }
        if (update.summary) {
          thread.summary = update.summary;
        }
        thread.lastChapter = chapterNumber;
      }
    }

    // Add new questions
    for (const question of updates.newQuestions) {
      if (!newState.unresolvedQuestions.includes(question)) {
        newState.unresolvedQuestions = [...newState.unresolvedQuestions, question];
      }
    }

    // Remove resolved questions
    for (const question of updates.resolvedQuestions) {
      newState.unresolvedQuestions = newState.unresolvedQuestions.filter(q => q !== question);
    }

    // Add recent events
    for (const event of updates.recentEvents) {
      newState.recentEvents = [...newState.recentEvents, event].slice(-10);
    }

    return newState;
  }
}

export const stateUpdater = new StateUpdater();
