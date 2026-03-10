import type { CharacterAgent } from './characterAgent.js';
import type { CharacterDecision } from './characterAgent.js';

export interface WorldEvent {
  id: string;
  type: 'interaction' | 'conflict' | 'discovery' | 'movement' | 'environmental';
  description: string;
  participants: string[];
  location: string;
  chapter: number;
  resolved: boolean;
  outcome?: string;
}

export interface EventResolution {
  event: WorldEvent;
  outcome: string;
  affectedCharacters: string[];
  consequences: string[];
  newEvents?: string[];
}

export interface ConflictResolution {
  winner?: string;
  compromise: boolean;
  outcome: string;
  damage: string[];
}

export class EventResolver {
  /**
   * Resolve character decisions into world events
   */
  resolveDecisions(
    decisions: CharacterDecision[],
    currentChapter: number
  ): WorldEvent[] {
    const events: WorldEvent[] = [];
    
    // Group decisions by location
    const locationGroups = new Map<string, CharacterDecision[]>();
    for (const decision of decisions) {
      // Note: location would need to be passed in or tracked
      const location = 'current location'; // Simplified
      const existing = locationGroups.get(location) || [];
      existing.push(decision);
      locationGroups.set(location, existing);
    }
    
    // Check for interactions between characters at same location
    for (const [location, locationDecisions] of locationGroups) {
      if (locationDecisions.length >= 2) {
        // Check for mutual interactions
        for (let i = 0; i < locationDecisions.length; i++) {
          for (let j = i + 1; j < locationDecisions.length; j++) {
            const d1 = locationDecisions[i];
            const d2 = locationDecisions[j];
            
            // Check if they're interacting with each other
            if (d1.target === d2.character && d2.target === d1.character) {
              events.push({
                id: `event-${Date.now()}-${events.length}`,
                type: 'interaction',
                description: `${d1.character} and ${d2.character} interact`,
                participants: [d1.character, d2.character],
                location,
                chapter: currentChapter,
                resolved: false,
              });
            }
          }
        }
      }
      
      // Add individual actions as events
      for (const decision of locationDecisions) {
        if (!events.some(e => e.participants.includes(decision.character))) {
          events.push({
            id: `event-${Date.now()}-${events.length}`,
            type: this.categorizeAction(decision.action),
            description: `${decision.character}: ${decision.action}`,
            participants: [decision.character],
            location,
            chapter: currentChapter,
            resolved: false,
          });
        }
      }
    }
    
    return events;
  }
  
  /**
   * Categorize an action into event type
   */
  private categorizeAction(action: string): WorldEvent['type'] {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('fight') || actionLower.includes('attack') || actionLower.includes('confront')) {
      return 'conflict';
    }
    if (actionLower.includes('find') || actionLower.includes('discover') || actionLower.includes('learn')) {
      return 'discovery';
    }
    if (actionLower.includes('go') || actionLower.includes('move') || actionLower.includes('travel')) {
      return 'movement';
    }
    if (actionLower.includes('weather') || actionLower.includes('storm') || actionLower.includes('dark')) {
      return 'environmental';
    }
    
    return 'interaction';
  }
  
  /**
   * Resolve a conflict between characters
   */
  resolveConflict(
    event: WorldEvent,
    participants: CharacterAgent[]
  ): ConflictResolution {
    // Simple resolution based on emotional state and personality
    const scores = participants.map(p => {
      let score = 5; // base
      
      // Emotional state affects capability
      if (p.emotionalState.includes('angry') || p.emotionalState.includes('furious')) {
        score += 2;
      }
      if (p.emotionalState.includes('fear') || p.emotionalState.includes('terrified')) {
        score -= 2;
      }
      if (p.emotionalState.includes('calm') || p.emotionalState.includes('focused')) {
        score += 1;
      }
      
      // Personality traits
      if (p.personality.some(t => t.includes('strong') || t.includes('brave'))) {
        score += 1;
      }
      if (p.personality.some(t => t.includes('weak') || t.includes('timid'))) {
        score -= 1;
      }
      
      return { name: p.name, score };
    });
    
    // Determine outcome
    scores.sort((a, b) => b.score - a.score);
    const winner = scores[0];
    const loser = scores[scores.length - 1];
    const scoreDiff = winner.score - loser.score;
    
    if (scoreDiff < 2) {
      // Close match - compromise
      return {
        compromise: true,
        outcome: 'Both sides reach a compromise',
        damage: ['Minor injuries', 'Tension remains'],
      };
    }
    
    return {
      winner: winner.name,
      compromise: false,
      outcome: `${winner.name} prevails over ${loser.name}`,
      damage: [`${loser.name} is defeated`, 'Physical or emotional consequences'],
    };
  }
  
  /**
   * Resolve an event and determine consequences
   */
  resolveEvent(
    event: WorldEvent,
    participants: CharacterAgent[]
  ): EventResolution {
    let outcome = '';
    const consequences: string[] = [];
    const newEvents: string[] = [];
    
    switch (event.type) {
      case 'conflict':
        const conflictResult = this.resolveConflict(event, participants);
        outcome = conflictResult.outcome;
        consequences.push(...conflictResult.damage);
        if (conflictResult.winner) {
          consequences.push(`${conflictResult.winner} gains advantage`);
        }
        break;
        
      case 'discovery':
        outcome = `${participants[0]?.name} makes an important discovery`;
        consequences.push('New knowledge gained', 'Future possibilities opened');
        break;
        
      case 'interaction':
        if (participants.length >= 2) {
          outcome = `${participants.map(p => p.name).join(' and ')} have a meaningful interaction`;
          consequences.push('Relationship development', 'Information exchange');
        } else {
          outcome = `${participants[0]?.name} takes action`;
          consequences.push('Progress toward goal');
        }
        break;
        
      case 'movement':
        outcome = `${participants[0]?.name} changes location`;
        consequences.push('New environment', 'New opportunities or dangers');
        break;
        
      case 'environmental':
        outcome = 'Environmental event affects the scene';
        consequences.push('All participants must react', 'Situation becomes more complex');
        break;
    }
    
    return {
      event: { ...event, resolved: true, outcome },
      outcome,
      affectedCharacters: participants.map(p => p.name),
      consequences,
      newEvents,
    };
  }
  
  /**
   * Process all pending events
   */
  processEvents(
    events: WorldEvent[],
    agents: Map<string, CharacterAgent>
  ): EventResolution[] {
    const resolutions: EventResolution[] = [];
    
    for (const event of events.filter(e => !e.resolved)) {
      const participants = event.participants
        .map(name => agents.get(name))
        .filter((agent): agent is CharacterAgent => agent !== undefined);
      
      if (participants.length > 0) {
        const resolution = this.resolveEvent(event, participants);
        resolutions.push(resolution);
      }
    }
    
    return resolutions;
  }
  
  /**
   * Generate narrative description of event resolution
   */
  narrateResolution(resolution: EventResolution): string {
    const lines: string[] = [];
    
    lines.push(`**${resolution.event.description}**`);
    lines.push(`Outcome: ${resolution.outcome}`);
    
    if (resolution.consequences.length > 0) {
      lines.push('Consequences:');
      for (const consequence of resolution.consequences) {
        lines.push(`  - ${consequence}`);
      }
    }
    
    return lines.join('\n');
  }
}

export const eventResolver = new EventResolver();
