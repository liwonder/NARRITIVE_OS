/**
 * World State Engine - Phase 14
 * 
 * The authoritative database of reality in the story.
 * Tracks: characters, locations, objects, relationships, timeline
 * Used to enforce logical consistency (no teleporting, no impossible knowledge)
 */

export interface WorldCharacter {
  name: string;
  alive: boolean;
  location: string;
  knownInformation: string[]; // Facts this character knows
  emotionalState: string;
  goals: string[];
}

export interface WorldLocation {
  name: string;
  description: string;
  charactersPresent: string[];
  objectsPresent: string[];
  connectedTo: string[]; // Other location names
}

export interface WorldObject {
  name: string;
  location: string; // Location name or character name (if held)
  owner?: string;
  discoveredBy: string[];
  properties: Record<string, string>;
}

export interface WorldRelationship {
  characterA: string;
  characterB: string;
  trust: number; // -1.0 to 1.0
  hostility: number; // 0.0 to 1.0
  relationshipType: string; // e.g., "friend", "enemy", "family", "colleague"
}

export interface WorldEvent {
  id: string;
  description: string;
  chapter: number;
  scene?: number;
  timestamp: Date;
  participants: string[];
  location: string;
}

export interface WorldState {
  storyId: string;
  chapter: number;
  scene: number;
  characters: Record<string, WorldCharacter>;
  locations: Record<string, WorldLocation>;
  objects: Record<string, WorldObject>;
  relationships: Record<string, WorldRelationship>; // key: "charA_charB"
  timeline: WorldEvent[];
  lastUpdated: Date;
}

export class WorldStateEngine {
  private state: WorldState;

  constructor(storyId: string) {
    this.state = {
      storyId,
      chapter: 0,
      scene: 0,
      characters: {},
      locations: {},
      objects: {},
      relationships: {},
      timeline: [],
      lastUpdated: new Date()
    };
  }

  // Character operations
  addCharacter(name: string, location: string, emotionalState: string = 'neutral'): WorldCharacter {
    const character: WorldCharacter = {
      name,
      alive: true,
      location,
      knownInformation: [],
      emotionalState,
      goals: []
    };
    this.state.characters[name] = character;
    this.updateLocationCharacters(location, name, 'add');
    this.touch();
    return character;
  }

  moveCharacter(name: string, newLocation: string): void {
    const character = this.state.characters[name];
    if (!character) throw new Error(`Character ${name} not found`);
    
    // Remove from old location
    this.updateLocationCharacters(character.location, name, 'remove');
    
    // Update character location
    character.location = newLocation;
    
    // Add to new location
    this.updateLocationCharacters(newLocation, name, 'add');
    this.touch();
  }

  killCharacter(name: string): void {
    const character = this.state.characters[name];
    if (!character) throw new Error(`Character ${name} not found`);
    
    character.alive = false;
    this.updateLocationCharacters(character.location, name, 'remove');
    this.touch();
  }

  addCharacterKnowledge(name: string, fact: string): void {
    const character = this.state.characters[name];
    if (!character) throw new Error(`Character ${name} not found`);
    
    if (!character.knownInformation.includes(fact)) {
      character.knownInformation.push(fact);
      this.touch();
    }
  }

  setCharacterEmotion(name: string, emotion: string): void {
    const character = this.state.characters[name];
    if (!character) throw new Error(`Character ${name} not found`);
    
    character.emotionalState = emotion;
    this.touch();
  }

  // Location operations
  addLocation(name: string, description: string, connectedTo: string[] = []): WorldLocation {
    const location: WorldLocation = {
      name,
      description,
      charactersPresent: [],
      objectsPresent: [],
      connectedTo
    };
    this.state.locations[name] = location;
    this.touch();
    return location;
  }

  connectLocations(locA: string, locB: string): void {
    if (this.state.locations[locA] && !this.state.locations[locA].connectedTo.includes(locB)) {
      this.state.locations[locA].connectedTo.push(locB);
    }
    if (this.state.locations[locB] && !this.state.locations[locB].connectedTo.includes(locA)) {
      this.state.locations[locB].connectedTo.push(locA);
    }
    this.touch();
  }

  // Object operations
  addObject(name: string, location: string, properties: Record<string, string> = {}): WorldObject {
    const obj: WorldObject = {
      name,
      location,
      discoveredBy: [],
      properties
    };
    this.state.objects[name] = obj;
    
    // Add to location if it's a location
    if (this.state.locations[location]) {
      this.state.locations[location].objectsPresent.push(name);
    }
    this.touch();
    return obj;
  }

  moveObject(name: string, newLocation: string): void {
    const obj = this.state.objects[name];
    if (!obj) throw new Error(`Object ${name} not found`);
    
    // Remove from old location
    const oldLoc = this.state.locations[obj.location];
    if (oldLoc) {
      oldLoc.objectsPresent = oldLoc.objectsPresent.filter(o => o !== name);
    }
    
    // Update location
    obj.location = newLocation;
    
    // Add to new location
    const newLoc = this.state.locations[newLocation];
    if (newLoc && !newLoc.objectsPresent.includes(name)) {
      newLoc.objectsPresent.push(name);
    }
    this.touch();
  }

  discoverObject(objectName: string, characterName: string): void {
    const obj = this.state.objects[objectName];
    if (!obj) throw new Error(`Object ${objectName} not found`);
    
    if (!obj.discoveredBy.includes(characterName)) {
      obj.discoveredBy.push(characterName);
      this.addCharacterKnowledge(characterName, `discovered:${objectName}`);
      this.touch();
    }
  }

  // Relationship operations
  setRelationship(charA: string, charB: string, type: string, trust: number, hostility: number): void {
    const key = this.getRelationshipKey(charA, charB);
    this.state.relationships[key] = {
      characterA: charA,
      characterB: charB,
      trust,
      hostility,
      relationshipType: type
    };
    this.touch();
  }

  getRelationship(charA: string, charB: string): WorldRelationship | undefined {
    const key = this.getRelationshipKey(charA, charB);
    return this.state.relationships[key];
  }

  // Timeline operations
  addEvent(description: string, participants: string[], location: string): WorldEvent {
    const event: WorldEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description,
      chapter: this.state.chapter,
      scene: this.state.scene,
      timestamp: new Date(),
      participants,
      location
    };
    this.state.timeline.push(event);
    this.touch();
    return event;
  }

  // Validation helpers
  canCharacterKnow(characterName: string, fact: string): boolean {
    const character = this.state.characters[characterName];
    if (!character) return false;
    return character.knownInformation.includes(fact);
  }

  areCharactersInSameLocation(charA: string, charB: string): boolean {
    const a = this.state.characters[charA];
    const b = this.state.characters[charB];
    if (!a || !b) return false;
    return a.location === b.location && a.alive && b.alive;
  }

  isCharacterAlive(name: string): boolean {
    const character = this.state.characters[name];
    return character ? character.alive : false;
  }

  getCharactersAtLocation(location: string): string[] {
    const loc = this.state.locations[location];
    return loc ? loc.charactersPresent.filter(name => this.isCharacterAlive(name)) : [];
  }

  // State management
  setChapterScene(chapter: number, scene: number): void {
    this.state.chapter = chapter;
    this.state.scene = scene;
    this.touch();
  }

  getState(): WorldState {
    return { ...this.state };
  }

  loadState(state: WorldState): void {
    this.state = state;
  }

  exportToJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  // Format for prompts
  formatForPrompt(): string {
    const lines: string[] = [];
    
    lines.push('## World State');
    lines.push('');
    
    // Characters
    lines.push('### Characters');
    Object.values(this.state.characters).forEach(char => {
      const status = char.alive ? '' : ' [DECEASED]';
      lines.push(`- ${char.name}: at ${char.location}, feeling ${char.emotionalState}${status}`);
    });
    lines.push('');
    
    // Locations
    lines.push('### Locations');
    Object.values(this.state.locations).forEach(loc => {
      const chars = loc.charactersPresent.filter(c => this.isCharacterAlive(c));
      if (chars.length > 0) {
        lines.push(`- ${loc.name}: ${chars.join(', ')} present`);
      }
    });
    lines.push('');
    
    // Recent events (last 5)
    lines.push('### Recent Events');
    this.state.timeline.slice(-5).forEach(event => {
      lines.push(`- ${event.description}`);
    });
    
    return lines.join('\n');
  }

  // Private helpers
  private updateLocationCharacters(locationName: string, characterName: string, action: 'add' | 'remove'): void {
    const location = this.state.locations[locationName];
    if (!location) return;
    
    if (action === 'add') {
      if (!location.charactersPresent.includes(characterName)) {
        location.charactersPresent.push(characterName);
      }
    } else {
      location.charactersPresent = location.charactersPresent.filter(c => c !== characterName);
    }
  }

  private getRelationshipKey(charA: string, charB: string): string {
    // Normalize key order for consistency
    return [charA, charB].sort().join('_');
  }

  private touch(): void {
    this.state.lastUpdated = new Date();
  }
}

// Factory function
export function createWorldStateEngine(storyId: string): WorldStateEngine {
  return new WorldStateEngine(storyId);
}
