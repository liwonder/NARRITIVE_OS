/**
 * Narrative Scope Windows - Phase 18
 * 
 * Loads only relevant context for each scene to improve performance
 * and reduce token usage. Extracts subgraph within N hops of active characters.
 */

import type { WorldStateEngine, WorldState } from '../world/worldStateEngine.js';
import type { VectorStore } from '../memory/vectorStore.js';
import type { ConstraintGraph } from '../constraints/constraintGraph.js';

export interface ScopeWindow {
  characters: string[];           // Characters in scope
  locations: string[];            // Locations in scope
  objects: string[];              // Objects in scope
  graphSubgraph: GraphSubgraph;   // Extracted graph subset
  relevantMemories: string[];     // Filtered memories
  constraints: string[];          // Relevant constraints
  hopDistance: number;            // How many hops from center
}

export interface GraphSubgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  type: 'character' | 'location' | 'object' | 'fact' | 'event';
  label: string;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
  properties?: Record<string, unknown>;
}

export interface ScopeBuilderOptions {
  centerCharacters: string[];     // Starting point characters
  centerLocation?: string;        // Starting point location
  maxHops?: number;               // How many hops to include (default: 2)
  maxMemories?: number;           // Max memories to include (default: 10)
  includeConstraints?: boolean;   // Include relevant constraints
}

export class ScopeBuilder {
  private worldState: WorldStateEngine;
  private vectorStore?: VectorStore;
  private constraintGraph?: ConstraintGraph;

  constructor(
    worldState: WorldStateEngine,
    vectorStore?: VectorStore,
    constraintGraph?: ConstraintGraph
  ) {
    this.worldState = worldState;
    this.vectorStore = vectorStore;
    this.constraintGraph = constraintGraph;
  }

  /**
   * Build a scope window for the current scene context
   */
  async buildScope(options: ScopeBuilderOptions): Promise<ScopeWindow> {
    const {
      centerCharacters,
      centerLocation,
      maxHops = 2,
      maxMemories = 10,
      includeConstraints = true
    } = options;

    // Extract subgraph from world state
    const subgraph = this.extractSubgraph(centerCharacters, centerLocation, maxHops);
    
    // Get relevant memories
    const relevantMemories = await this.filterMemories(
      centerCharacters,
      centerLocation,
      maxMemories
    );
    
    // Get relevant constraints
    const constraints = includeConstraints && this.constraintGraph
      ? this.filterConstraints(centerCharacters, subgraph)
      : [];

    // Collect all entities in scope
    const characters = this.collectCharactersInSubgraph(subgraph);
    const locations = this.collectLocationsInSubgraph(subgraph);
    const objects = this.collectObjectsInSubgraph(subgraph);

    return {
      characters,
      locations,
      objects,
      graphSubgraph: subgraph,
      relevantMemories,
      constraints,
      hopDistance: maxHops
    };
  }

  /**
   * Extract subgraph within N hops of center characters
   */
  private extractSubgraph(
    centerCharacters: string[],
    centerLocation: string | undefined,
    maxHops: number
  ): GraphSubgraph {
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];
    const visited = new Set<string>();
    const queue: Array<{ id: string; type: string; hops: number }> = [];

    // Initialize queue with center characters
    for (const charName of centerCharacters) {
      const char = this.worldState.getState().characters[charName];
      if (char && !visited.has(charName)) {
        visited.add(charName);
        queue.push({ id: charName, type: 'character', hops: 0 });
        
        nodes.set(charName, {
          id: charName,
          type: 'character',
          label: char.name,
          properties: {
            location: char.location,
            emotionalState: char.emotionalState,
            alive: char.alive
          }
        });
      }
    }

    // Initialize with center location if provided
    if (centerLocation) {
      const loc = this.worldState.getState().locations[centerLocation];
      if (loc && !visited.has(centerLocation)) {
        visited.add(centerLocation);
        queue.push({ id: centerLocation, type: 'location', hops: 0 });
        
        nodes.set(centerLocation, {
          id: centerLocation,
          type: 'location',
          label: loc.name,
          properties: {
            charactersPresent: loc.charactersPresent,
            objectsPresent: loc.objectsPresent
          }
        });
      }
    }

    // BFS to extract subgraph
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.hops >= maxHops) continue;

      // Process based on node type
      if (current.type === 'character') {
        this.expandCharacterNode(current.id, current.hops, visited, queue, nodes, edges);
      } else if (current.type === 'location') {
        this.expandLocationNode(current.id, current.hops, visited, queue, nodes, edges);
      } else if (current.type === 'object') {
        this.expandObjectNode(current.id, current.hops, visited, queue, nodes, edges);
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges
    };
  }

  private expandCharacterNode(
    charId: string,
    currentHops: number,
    visited: Set<string>,
    queue: Array<{ id: string; type: string; hops: number }>,
    nodes: Map<string, GraphNode>,
    edges: GraphEdge[]
  ): void {
    const char = this.worldState.getState().characters[charId];
    if (!char) return;

    // Connect to location
    if (char.location && !visited.has(char.location)) {
      visited.add(char.location);
      queue.push({ id: char.location, type: 'location', hops: currentHops + 1 });
      
      const loc = this.worldState.getState().locations[char.location];
      if (loc) {
        nodes.set(char.location, {
          id: char.location,
          type: 'location',
          label: loc.name,
          properties: {
            description: loc.description,
            connectedTo: loc.connectedTo
          }
        });
      }
      
      edges.push({
        from: charId,
        to: char.location,
        type: 'located_in'
      });
    }

    // Connect to known objects
    for (const [objName, obj] of Object.entries(this.worldState.getState().objects)) {
      if (obj.discoveredBy.includes(charId) && !visited.has(objName)) {
        visited.add(objName);
        queue.push({ id: objName, type: 'object', hops: currentHops + 1 });
        
        nodes.set(objName, {
          id: objName,
          type: 'object',
          label: obj.name,
          properties: {
            location: obj.location,
            discoveredBy: obj.discoveredBy
          }
        });
        
        edges.push({
          from: charId,
          to: objName,
          type: 'discovered'
        });
      }
    }

    // Connect to other characters in same location
    const loc = this.worldState.getState().locations[char.location];
    if (loc) {
      for (const otherChar of loc.charactersPresent) {
        if (otherChar !== charId && !visited.has(otherChar)) {
          visited.add(otherChar);
          queue.push({ id: otherChar, type: 'character', hops: currentHops + 1 });
          
          const other = this.worldState.getState().characters[otherChar];
          if (other) {
            nodes.set(otherChar, {
              id: otherChar,
              type: 'character',
              label: other.name,
              properties: {
                emotionalState: other.emotionalState,
                alive: other.alive
              }
            });
          }
          
          edges.push({
            from: charId,
            to: otherChar,
            type: 'co_located'
          });
        }
      }
    }
  }

  private expandLocationNode(
    locId: string,
    currentHops: number,
    visited: Set<string>,
    queue: Array<{ id: string; type: string; hops: number }>,
    nodes: Map<string, GraphNode>,
    edges: GraphEdge[]
  ): void {
    const loc = this.worldState.getState().locations[locId];
    if (!loc) return;

    // Connect to connected locations
    for (const connectedLoc of loc.connectedTo) {
      if (!visited.has(connectedLoc)) {
        visited.add(connectedLoc);
        queue.push({ id: connectedLoc, type: 'location', hops: currentHops + 1 });
        
        const connected = this.worldState.getState().locations[connectedLoc];
        if (connected) {
          nodes.set(connectedLoc, {
            id: connectedLoc,
            type: 'location',
            label: connected.name,
            properties: {
              description: connected.description
            }
          });
        }
        
        edges.push({
          from: locId,
          to: connectedLoc,
          type: 'connected_to'
        });
      }
    }

    // Connect to objects in location
    for (const objName of loc.objectsPresent) {
      if (!visited.has(objName)) {
        visited.add(objName);
        queue.push({ id: objName, type: 'object', hops: currentHops + 1 });
        
        const obj = this.worldState.getState().objects[objName];
        if (obj) {
          nodes.set(objName, {
            id: objName,
            type: 'object',
            label: obj.name,
            properties: {
              discoveredBy: obj.discoveredBy
            }
          });
        }
        
        edges.push({
          from: locId,
          to: objName,
          type: 'contains'
        });
      }
    }
  }

  private expandObjectNode(
    objId: string,
    currentHops: number,
    visited: Set<string>,
    queue: Array<{ id: string; type: string; hops: number }>,
    nodes: Map<string, GraphNode>,
    edges: GraphEdge[]
  ): void {
    const obj = this.worldState.getState().objects[objId];
    if (!obj) return;

    // Object location already handled in expandLocationNode
    // Could expand to related objects or facts here
  }

  /**
   * Filter memories based on scope entities
   */
  private async filterMemories(
    characters: string[],
    location: string | undefined,
    maxMemories: number
  ): Promise<string[]> {
    if (!this.vectorStore) return [];

    // Build query from scope entities
    const queryTerms = [...characters];
    if (location) queryTerms.push(location);

    const query = queryTerms.join(' ');
    
    try {
      const results = await this.vectorStore.searchSimilar(query, maxMemories);
      return results.map(r => r.memory.content);
    } catch (e) {
      console.warn('Failed to filter memories:', e);
      return [];
    }
  }

  /**
   * Filter constraints based on scope
   */
  private filterConstraints(
    characters: string[],
    subgraph: GraphSubgraph
  ): string[] {
    if (!this.constraintGraph) return [];

    // Get constraint violations for characters in scope
    const violations: string[] = [];
    
    // Check each character's constraints by looking at their nodes in the graph
    for (const charName of characters) {
      const charNode = this.constraintGraph.getNode(charName);
      if (charNode) {
        const edges = this.constraintGraph.getEdgesFrom(charName);
        for (const edge of edges) {
          // Check for constraint violations based on edge types
          if (edge.type === 'forbidden' || edge.type === 'requires') {
            violations.push(`${charName}: ${edge.type} constraint with ${edge.to}`);
          }
        }
      }
    }

    return violations;
  }

  // Helper methods to collect entities
  private collectCharactersInSubgraph(subgraph: GraphSubgraph): string[] {
    return subgraph.nodes
      .filter(n => n.type === 'character')
      .map(n => n.id);
  }

  private collectLocationsInSubgraph(subgraph: GraphSubgraph): string[] {
    return subgraph.nodes
      .filter(n => n.type === 'location')
      .map(n => n.id);
  }

  private collectObjectsInSubgraph(subgraph: GraphSubgraph): string[] {
    return subgraph.nodes
      .filter(n => n.type === 'object')
      .map(n => n.id);
  }

  /**
   * Format scope window for LLM prompt
   */
  formatForPrompt(scope: ScopeWindow): string {
    const lines: string[] = [];
    
    lines.push('## Scene Context (Relevant Only)');
    lines.push('');
    
    // Characters in scope
    if (scope.characters.length > 0) {
      lines.push('### Characters Present');
      for (const charId of scope.characters) {
        const char = this.worldState.getState().characters[charId];
        if (char) {
          lines.push(`- ${char.name}: at ${char.location}, feeling ${char.emotionalState}`);
        }
      }
      lines.push('');
    }
    
    // Locations in scope
    if (scope.locations.length > 0) {
      lines.push('### Nearby Locations');
      for (const locId of scope.locations) {
        const loc = this.worldState.getState().locations[locId];
        if (loc) {
          const chars = loc.charactersPresent
            .filter(c => this.worldState.getState().characters[c]?.alive)
            .join(', ');
          lines.push(`- ${loc.name}${chars ? `: ${chars}` : ''}`);
        }
      }
      lines.push('');
    }
    
    // Relevant memories
    if (scope.relevantMemories.length > 0) {
      lines.push('### Relevant Memories');
      for (const memory of scope.relevantMemories.slice(0, 5)) {
        lines.push(`- ${memory}`);
      }
      lines.push('');
    }
    
    return lines.join('\n');
  }
}

export function createScopeBuilder(
  worldState: WorldStateEngine,
  vectorStore?: VectorStore,
  constraintGraph?: ConstraintGraph
): ScopeBuilder {
  return new ScopeBuilder(worldState, vectorStore, constraintGraph);
}
