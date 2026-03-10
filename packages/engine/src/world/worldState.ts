import type { CharacterAgent } from './characterAgent.js';
import type { WorldEvent, EventResolution } from './eventResolver.js';

export interface Location {
  id: string;
  name: string;
  description: string;
  connectedTo: string[];
  characters: string[];
  items: string[];
  events: string[];
}

export interface WorldState {
  storyId: string;
  currentChapter: number;
  locations: Map<string, Location>;
  characters: Map<string, CharacterAgent>;
  events: WorldEvent[];
  history: string[];
  globalState: Record<string, any>;
}

export class WorldStateManager {
  private state: WorldState;
  
  constructor(storyId: string) {
    this.state = {
      storyId,
      currentChapter: 0,
      locations: new Map(),
      characters: new Map(),
      events: [],
      history: [],
      globalState: {},
    };
  }
  
  /**
   * Initialize world from story bible
   */
  initialize(setting: string, initialCharacters: CharacterAgent[]): void {
    // Create initial location from setting
    const startingLocation: Location = {
      id: 'loc-start',
      name: setting,
      description: `The main setting of the story: ${setting}`,
      connectedTo: [],
      characters: initialCharacters.map(c => c.name),
      items: [],
      events: [],
    };
    
    this.state.locations.set(startingLocation.id, startingLocation);
    
    // Add characters
    for (const character of initialCharacters) {
      this.state.characters.set(character.name, character);
    }
    
    this.addToHistory(`World initialized at ${setting} with ${initialCharacters.length} characters`);
  }
  
  /**
   * Add a new location
   */
  addLocation(
    id: string,
    name: string,
    description: string,
    connectedTo: string[] = []
  ): Location {
    const location: Location = {
      id,
      name,
      description,
      connectedTo,
      characters: [],
      items: [],
      events: [],
    };
    
    this.state.locations.set(id, location);
    this.addToHistory(`Location added: ${name}`);
    
    return location;
  }
  
  /**
   * Connect two locations
   */
  connectLocations(locId1: string, locId2: string): void {
    const loc1 = this.state.locations.get(locId1);
    const loc2 = this.state.locations.get(locId2);
    
    if (loc1 && loc2) {
      if (!loc1.connectedTo.includes(locId2)) {
        loc1.connectedTo.push(locId2);
      }
      if (!loc2.connectedTo.includes(locId1)) {
        loc2.connectedTo.push(locId1);
      }
    }
  }
  
  /**
   * Move character between locations
   */
  moveCharacter(characterName: string, toLocationId: string): boolean {
    const character = this.state.characters.get(characterName);
    const fromLocation = this.getCharacterLocation(characterName);
    const toLocation = this.state.locations.get(toLocationId);
    
    if (!character || !toLocation) return false;
    
    // Remove from old location
    if (fromLocation) {
      fromLocation.characters = fromLocation.characters.filter(c => c !== characterName);
    }
    
    // Add to new location
    if (!toLocation.characters.includes(characterName)) {
      toLocation.characters.push(characterName);
    }
    
    // Update character location
    character.location = toLocation.name;
    
    this.addToHistory(`${characterName} moved to ${toLocation.name}`);
    return true;
  }
  
  /**
   * Get character's current location
   */
  getCharacterLocation(characterName: string): Location | undefined {
    for (const location of this.state.locations.values()) {
      if (location.characters.includes(characterName)) {
        return location;
      }
    }
    return undefined;
  }
  
  /**
   * Add character to world
   */
  addCharacter(character: CharacterAgent): void {
    this.state.characters.set(character.name, character);
    
    // Add to location
    for (const location of this.state.locations.values()) {
      if (location.name === character.location) {
        if (!location.characters.includes(character.name)) {
          location.characters.push(character.name);
        }
        break;
      }
    }
    
    this.addToHistory(`Character added: ${character.name}`);
  }
  
  /**
   * Get characters at a location
   */
  getCharactersAtLocation(locationId: string): CharacterAgent[] {
    const location = this.state.locations.get(locationId);
    if (!location) return [];
    
    return location.characters
      .map(name => this.state.characters.get(name))
      .filter((c): c is CharacterAgent => c !== undefined);
  }
  
  /**
   * Add event to world
   */
  addEvent(event: WorldEvent): void {
    this.state.events.push(event);
    
    // Add to location
    const location = Array.from(this.state.locations.values())
      .find(l => l.name === event.location);
    if (location) {
      location.events.push(event.id);
    }
    
    this.addToHistory(`Event: ${event.description}`);
  }
  
  /**
   * Process event resolutions and update world
   */
  applyResolutions(resolutions: EventResolution[]): void {
    for (const resolution of resolutions) {
      // Update event
      const eventIndex = this.state.events.findIndex(e => e.id === resolution.event.id);
      if (eventIndex >= 0) {
        this.state.events[eventIndex] = resolution.event;
      }
      
      // Add to history
      this.addToHistory(`Resolved: ${resolution.outcome}`);
      
      // Apply consequences to characters
      for (const characterName of resolution.affectedCharacters) {
        const character = this.state.characters.get(characterName);
        if (character) {
          // Could update emotional state, knowledge, etc. based on consequences
          // For now, just log it
        }
      }
    }
  }
  
  /**
   * Advance to next chapter
   */
  advanceChapter(): void {
    this.state.currentChapter++;
    this.addToHistory(`Chapter ${this.state.currentChapter} begins`);
  }
  
  /**
   * Set global state value
   */
  setGlobalState(key: string, value: any): void {
    this.state.globalState[key] = value;
  }
  
  /**
   * Get global state value
   */
  getGlobalState(key: string): any {
    return this.state.globalState[key];
  }
  
  /**
   * Add entry to world history
   */
  private addToHistory(entry: string): void {
    const timestamp = `Ch${this.state.currentChapter}`;
    this.state.history.push(`[${timestamp}] ${entry}`);
  }
  
  /**
   * Get world state summary
   */
  getSummary(): string {
    const lines: string[] = ['## World State'];
    
    lines.push(`\n**Current Chapter:** ${this.state.currentChapter}`);
    lines.push(`**Locations:** ${this.state.locations.size}`);
    lines.push(`**Characters:** ${this.state.characters.size}`);
    lines.push(`**Active Events:** ${this.state.events.filter(e => !e.resolved).length}`);
    
    // Location summary
    lines.push('\n### Locations');
    for (const location of this.state.locations.values()) {
      lines.push(`- **${location.name}**: ${location.characters.length} characters`);
    }
    
    // Character summary
    lines.push('\n### Character Locations');
    for (const character of this.state.characters.values()) {
      lines.push(`- ${character.name}: ${character.location} (${character.emotionalState})`);
    }
    
    // Recent history
    lines.push('\n### Recent History');
    for (const entry of this.state.history.slice(-5)) {
      lines.push(`- ${entry}`);
    }
    
    return lines.join('\n');
  }
  
  /**
   * Get full world state
   */
  getState(): WorldState {
    return this.state;
  }
  
  /**
   * Serialize world state
   */
  serialize(): string {
    return JSON.stringify({
      storyId: this.state.storyId,
      currentChapter: this.state.currentChapter,
      locations: Array.from(this.state.locations.entries()),
      characters: Array.from(this.state.characters.entries()),
      events: this.state.events,
      history: this.state.history,
      globalState: this.state.globalState,
    });
  }
  
  /**
   * Deserialize world state
   */
  load(data: string): void {
    const parsed = JSON.parse(data);
    this.state = {
      storyId: parsed.storyId,
      currentChapter: parsed.currentChapter,
      locations: new Map(parsed.locations),
      characters: new Map(parsed.characters),
      events: parsed.events,
      history: parsed.history,
      globalState: parsed.globalState,
    };
  }
}

export function createWorldStateManager(storyId: string): WorldStateManager {
  return new WorldStateManager(storyId);
}
