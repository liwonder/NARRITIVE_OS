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
    
    // Step 1 & 3: Split content into segments and extract from beginning/end specially
    const segments = this.segmentContent(content);
    const allUpdates: WorldStateUpdate[] = [];
    
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
    
    const stateContext = stateLines.join('\n');
    
    // Extract updates from each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isFirstSegment = i === 0;
      const isLastSegment = i === segments.length - 1;
      
      try {
        const prompt = this.buildEnhancedPrompt(
          stateContext,
          segment,
          isFirstSegment,
          isLastSegment
        );
        
        const response = await llm.complete(prompt, {
          temperature: 0.3,
          maxTokens: 1500
        });
        
        // Clean and parse JSON
        const cleaned = response.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
        const updates: WorldStateUpdate = JSON.parse(cleaned);
        allUpdates.push(updates);
      } catch (error) {
        console.warn(`Failed to extract updates from segment ${i + 1}/${segments.length}:`, error);
      }
    }
    
    // Merge all updates
    const mergedUpdates = this.mergeUpdates(allUpdates);
    
    // Step 4: Validate location continuity
    return this.validateAndFixLocationContinuity(mergedUpdates, currentState, content);
  }
  
  /**
   * Step 1: Segment content into chunks for processing
   * Ensures no segment exceeds 2500 characters
   * Also extracts beginning (first 500 chars) and end (last 500 chars) specially
   */
  private segmentContent(content: string): string[] {
    const segments: string[] = [];
    const maxSegmentLength = 2500;
    const specialSegmentLength = 500;
    
    // Always include beginning and end as special segments
    const beginning = content.substring(0, specialSegmentLength);
    const end = content.substring(Math.max(specialSegmentLength, content.length - specialSegmentLength));
    
    segments.push(`[CHAPTER BEGINNING]\n${beginning}`);
    
    // Split middle content into segments
    const middleStart = specialSegmentLength;
    const middleEnd = content.length - specialSegmentLength;
    
    if (middleStart < middleEnd) {
      const middleContent = content.substring(middleStart, middleEnd);
      
      for (let i = 0; i < middleContent.length; i += maxSegmentLength) {
        segments.push(middleContent.substring(i, i + maxSegmentLength));
      }
    }
    
    segments.push(`[CHAPTER END]\n${end}`);
    
    return segments;
  }
  
  /**
   * Step 2: Build enhanced prompt with explicit location tracking instructions
   */
  private buildEnhancedPrompt(
    stateContext: string,
    segment: string,
    isFirstSegment: boolean,
    isLastSegment: boolean
  ): string {
    let specialInstructions = '';
    
    if (isFirstSegment) {
      specialInstructions = `
**CRITICAL - CHAPTER BEGINNING:**
- The first segment shows where characters START this chapter
- If a character appears at a location different from their current state, they MUST have moved here
- Record this as a characterMove from their previous location to this new location`;
    }
    
    if (isLastSegment) {
      specialInstructions = `
**CRITICAL - CHAPTER ENDING:**
- The last segment shows where characters END this chapter
- This location will be the starting point for the NEXT chapter
- Record all final positions as characterMoves to ensure continuity`;
    }
    
    return `You are a world state extractor. Analyze the content and extract changes to the story world.

## Current World State

${stateContext}

## Content to Analyze

${segment}

## Your Task

Extract ALL changes to the world state. Be thorough and explicit.

**CRITICAL LOCATION TRACKING INSTRUCTIONS:**
1. **Character Movements**: Track EVERY location change, even implied ones
   - Explicit: "他走到龙王庙" → record move
   - Implicit: "他在龙王庙醒来" → record move from previous location
   - Transition: "第二天，他在城西" → record move
   
2. **Scene Transitions**: Watch for time jumps or scene changes
   - "第二天"、"几日后"、"与此同时" often indicate location changes
   - Characters appearing in new locations without explanation = move

3. **Beginning and End Positions**: 
   - Where does each character start this segment?
   - Where does each character end this segment?
   - Any difference = movement${specialInstructions}

Return a JSON object with the updates:

{
  "characterMoves": [
    {"character": "Name", "from": "Previous Location", "to": "New Location"}
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
  }
  
  /**
   * Merge updates from multiple segments
   */
  private mergeUpdates(updates: WorldStateUpdate[]): WorldStateUpdate {
    const merged: WorldStateUpdate = {
      characterMoves: [],
      characterDeaths: [],
      objectMoves: [],
      discoveries: [],
      relationshipChanges: [],
      emotionalChanges: [],
      newEvents: []
    };
    
    for (const update of updates) {
      if (update.characterMoves) merged.characterMoves!.push(...update.characterMoves);
      if (update.characterDeaths) merged.characterDeaths!.push(...update.characterDeaths);
      if (update.objectMoves) merged.objectMoves!.push(...update.objectMoves);
      if (update.discoveries) merged.discoveries!.push(...update.discoveries);
      if (update.relationshipChanges) merged.relationshipChanges!.push(...update.relationshipChanges);
      if (update.emotionalChanges) merged.emotionalChanges!.push(...update.emotionalChanges);
      if (update.newEvents) merged.newEvents!.push(...update.newEvents);
    }
    
    // Remove duplicates from characterMoves (keep last occurrence)
    if (merged.characterMoves) {
      const seen = new Set<string>();
      merged.characterMoves = merged.characterMoves.reverse().filter(move => {
        const key = `${move.character}:${move.to}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).reverse();
    }
    
    return merged;
  }
  
  /**
   * Step 4: Validate location continuity and fix if needed
   */
  private validateAndFixLocationContinuity(
    updates: WorldStateUpdate,
    currentState: WorldState,
    content: string
  ): WorldStateUpdate {
    // Build final positions from updates
    const finalPositions: Map<string, string> = new Map();
    
    // Start with current positions
    Object.values(currentState.characters).forEach(char => {
      if (char.alive) {
        finalPositions.set(char.name, char.location);
      }
    });
    
    // Apply moves
    if (updates.characterMoves) {
      for (const move of updates.characterMoves) {
        finalPositions.set(move.character, move.to);
      }
    }
    
    // Check for implied moves from content
    // If content shows character at location X but no move recorded, add it
    const protagonist = Object.values(currentState.characters).find(c => c.alive)?.name;
    if (protagonist) {
      const impliedLocation = this.detectLocationFromText(content, protagonist);
      if (impliedLocation && impliedLocation !== finalPositions.get(protagonist)) {
        console.log(`  [WorldStateUpdater] Detected implied location change for ${protagonist}: ${finalPositions.get(protagonist)} → ${impliedLocation}`);
        
        if (!updates.characterMoves) {
          updates.characterMoves = [];
        }
        
        updates.characterMoves.push({
          character: protagonist,
          from: finalPositions.get(protagonist) || 'unknown',
          to: impliedLocation
        });
      }
    }
    
    return updates;
  }
  
  /**
   * Detect character location from text content
   * Simple heuristic: look for "character + at/in/在 + location" patterns
   */
  private detectLocationFromText(content: string, characterName: string): string | null {
    // Look for patterns like "character在location" or "character在location醒来"
    // Use non-capturing group (?:) for alternatives to avoid including action words in match
    const patterns = [
      new RegExp(`${characterName}在([^，。！？；、]{2,20}?)(?:醒来|睡|躺|坐|站|等|发现|看到)`),
      new RegExp(`${characterName}在([^，。！？；、]{2,20})`),
      new RegExp(`${characterName}[^，。！？；、]{0,10}在([^，。！？；、]{2,20})`),
    ];
    
    // Check end of content first (final location)
    const endContent = content.substring(Math.max(0, content.length - 1000));
    
    for (const pattern of patterns) {
      const match = endContent.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
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
            engine.discoverObject(discovery.object, discovery.character, discovery.location);
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
