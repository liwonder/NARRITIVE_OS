/**
 * World State Updater Agent - Phase 14
 * 
 * Extracts world state changes from scene/chapter content
 * Updates the WorldStateEngine with new facts
 */

import { getLLM } from '../llm/client.js';
import type { WorldStateEngine, WorldState } from '../world/worldStateEngine.js';
import type { StoryBible } from '../types/index.js';

export interface WorldStateUpdate {
  characterMoves?: { character: string; from: string; to: string }[];
  characterDeaths?: string[];
  objectMoves?: { object: string; from: string; to: string }[];
  discoveries?: { character: string; object?: string; location?: string; fact?: string }[];
  relationshipChanges?: { charA: string; charB: string; trustDelta?: number; hostilityDelta?: number }[];
  emotionalChanges?: { character: string; newEmotion: string }[];
  newEvents?: string[];
}

export interface WorldStateUpdaterInput {
  content: string;
  bible: StoryBible;
  currentState: WorldState;
  chapterNumber: number;
  sceneNumber?: number;
}

const WORLD_STATE_UPDATE_PROMPT = `You are a world state extractor. Analyze the scene/chapter content and extract changes to the story world.

## Current World State

{{currentState}}

## Scene/Chapter Content

{{content}}

## Your Task

Extract all changes to the world state from this content. Consider:

1. **Character Movements**: Did any character move to a new location?
2. **Character Deaths**: Did any character die?
3. **Object Movements**: Did any object change location or ownership?
4. **Discoveries**: Did any character discover something (object, location, fact)?
5. **Relationship Changes**: Did relationships between characters change?
6. **Emotional Changes**: Did any character's emotional state change significantly?
7. **New Events**: What important events occurred?

Return a JSON object with the updates:

{
  "characterMoves": [
    {"character": "Name", "from": "Old Location", "to": "New Location"}
  ],
  "characterDeaths": ["Character Name"],
  "objectMoves": [
    {"object": "Object Name", "from": "Old Location", "to": "New Location"}
  ],
  "discoveries": [
    {"character": "Name", "object": "optional", "location": "optional", "fact": "optional"}
  ],
  "relationshipChanges": [
    {"charA": "Name", "charB": "Name", "trustDelta": 0.1, "hostilityDelta": -0.1}
  ],
  "emotionalChanges": [
    {"character": "Name", "newEmotion": "emotion description"}
  ],
  "newEvents": [
    "Description of event that occurred"
  ]
}

Only include fields that have actual changes. Return empty arrays if no changes of that type occurred.

Return ONLY the JSON object.`;

export class WorldStateUpdater {
  async extractUpdates(input: WorldStateUpdaterInput): Promise<WorldStateUpdate> {
    const { content, bible, currentState, chapterNumber, sceneNumber } = input;
    
    const llm = getLLM();
    
    // Format current state for prompt
    const stateLines: string[] = [];
    
    stateLines.push('### Characters');
    Object.values(currentState.characters).forEach(char => {
      if (char.alive) {
        stateLines.push(`- ${char.name}: at ${char.location}, feeling ${char.emotionalState}`);
      }
    });
    
    stateLines.push('\n### Objects');
    Object.values(currentState.objects).forEach(obj => {
      stateLines.push(`- ${obj.name}: at ${obj.location}`);
    });
    
    stateLines.push('\n### Locations');
    Object.values(currentState.locations).forEach(loc => {
      const chars = loc.charactersPresent.filter(c => currentState.characters[c]?.alive);
      if (chars.length > 0) {
        stateLines.push(`- ${loc.name}: ${chars.join(', ')} present`);
      }
    });
    
    const prompt = WORLD_STATE_UPDATE_PROMPT
      .replace('{{currentState}}', stateLines.join('\n'))
      .replace('{{content}}', content.substring(0, 3000)); // Limit content length
    
    try {
      const response = await llm.complete(prompt, {
        temperature: 0.3,
        maxTokens: 1500
      });
      
      // Clean and parse JSON
      const cleaned = response.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
      const updates: WorldStateUpdate = JSON.parse(cleaned);
      
      return updates;
    } catch (error) {
      console.error('Failed to extract world state updates:', error);
      return {}; // Return empty update on failure
    }
  }

  applyUpdates(engine: WorldStateEngine, updates: WorldStateUpdate): void {
    // Apply character movements
    if (updates.characterMoves) {
      for (const move of updates.characterMoves) {
        try {
          engine.moveCharacter(move.character, move.to);
        } catch (e) {
          console.warn(`Failed to move character ${move.character}:`, e);
        }
      }
    }

    // Apply character deaths
    if (updates.characterDeaths) {
      for (const name of updates.characterDeaths) {
        try {
          engine.killCharacter(name);
        } catch (e) {
          console.warn(`Failed to kill character ${name}:`, e);
        }
      }
    }

    // Apply object movements
    if (updates.objectMoves) {
      for (const move of updates.objectMoves) {
        try {
          engine.moveObject(move.object, move.to);
        } catch (e) {
          console.warn(`Failed to move object ${move.object}:`, e);
        }
      }
    }

    // Apply discoveries
    if (updates.discoveries) {
      for (const discovery of updates.discoveries) {
        try {
          if (discovery.object) {
            engine.discoverObject(discovery.object, discovery.character);
          }
          if (discovery.fact) {
            engine.addCharacterKnowledge(discovery.character, discovery.fact);
          }
        } catch (e) {
          console.warn(`Failed to apply discovery:`, e);
        }
      }
    }

    // Apply relationship changes
    if (updates.relationshipChanges) {
      for (const change of updates.relationshipChanges) {
        try {
          const current = engine.getRelationship(change.charA, change.charB);
          const newTrust = Math.max(-1, Math.min(1, 
            (current?.trust || 0) + (change.trustDelta || 0)
          ));
          const newHostility = Math.max(0, Math.min(1, 
            (current?.hostility || 0) + (change.hostilityDelta || 0)
          ));
          engine.setRelationship(
            change.charA, 
            change.charB, 
            current?.relationshipType || 'neutral',
            newTrust,
            newHostility
          );
        } catch (e) {
          console.warn(`Failed to update relationship:`, e);
        }
      }
    }

    // Apply emotional changes
    if (updates.emotionalChanges) {
      for (const change of updates.emotionalChanges) {
        try {
          engine.setCharacterEmotion(change.character, change.newEmotion);
        } catch (e) {
          console.warn(`Failed to update emotion for ${change.character}:`, e);
        }
      }
    }

    // Add events
    if (updates.newEvents) {
      for (const eventDesc of updates.newEvents) {
        try {
          // Extract participants from the state
          const participants = Object.keys(engine.getState().characters)
            .filter(name => eventDesc.includes(name));
          const location = engine.getState().characters[participants[0]]?.location || 'unknown';
          engine.addEvent(eventDesc, participants, location);
        } catch (e) {
          console.warn(`Failed to add event:`, e);
        }
      }
    }
  }

  async updateFromScene(
    engine: WorldStateEngine,
    content: string,
    bible: StoryBible,
    chapterNumber: number,
    sceneNumber?: number
  ): Promise<void> {
    const updates = await this.extractUpdates({
      content,
      bible,
      currentState: engine.getState(),
      chapterNumber,
      sceneNumber
    });
    
    this.applyUpdates(engine, updates);
  }
}

export const worldStateUpdater = new WorldStateUpdater();
