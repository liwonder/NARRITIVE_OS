import type { CharacterState } from '../story/structuredState.js';

export type NodeType = 'character' | 'location' | 'fact' | 'event' | 'item';

export interface ConstraintNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, any>;
  chapterEstablished?: number;
}

export interface ConstraintEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  properties: Record<string, any>;
}

export interface ConstraintViolation {
  type: 'canon' | 'location' | 'knowledge' | 'timeline' | 'logic';
  severity: 'error' | 'warning';
  description: string;
  nodes: string[];
  suggestedFix?: string;
}

export class ConstraintGraph {
  private nodes: Map<string, ConstraintNode> = new Map();
  private edges: Map<string, ConstraintEdge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();
  
  /**
   * Add a node to the graph
   */
  addNode(node: ConstraintNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Set());
    }
  }
  
  /**
   * Add an edge between nodes
   */
  addEdge(edge: ConstraintEdge): void {
    // Validate nodes exist
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error(`Cannot add edge: node not found (${edge.from} -> ${edge.to})`);
    }
    
    this.edges.set(edge.id, edge);
    
    // Update adjacency list
    const fromSet = this.adjacencyList.get(edge.from);
    if (fromSet) {
      fromSet.add(edge.to);
    }
  }
  
  /**
   * Get a node by ID
   */
  getNode(id: string): ConstraintNode | undefined {
    return this.nodes.get(id);
  }
  
  /**
   * Get all edges from a node
   */
  getEdgesFrom(nodeId: string): ConstraintEdge[] {
    return Array.from(this.edges.values()).filter(e => e.from === nodeId);
  }
  
  /**
   * Get all edges to a node
   */
  getEdgesTo(nodeId: string): ConstraintEdge[] {
    return Array.from(this.edges.values()).filter(e => e.to === nodeId);
  }
  
  /**
   * Get neighbors of a node
   */
  getNeighbors(nodeId: string): ConstraintNode[] {
    const neighborIds = this.adjacencyList.get(nodeId);
    if (!neighborIds) return [];
    
    return Array.from(neighborIds)
      .map(id => this.nodes.get(id))
      .filter((n): n is ConstraintNode => n !== undefined);
  }
  
  /**
   * Add character to graph
   */
  addCharacter(character: CharacterState, chapter: number): void {
    const charNode: ConstraintNode = {
      id: `char-${character.name}`,
      type: 'character',
      label: character.name,
      properties: {
        emotionalState: character.emotionalState,
        location: character.location,
        goals: character.goals,
      },
      chapterEstablished: chapter,
    };
    
    this.addNode(charNode);
    
    // Add location edge
    this.addEdge({
      id: `edge-${character.name}-loc`,
      from: charNode.id,
      to: `loc-${character.location}`,
      type: 'located_at',
      properties: { since: chapter },
    });
    
    // Add knowledge nodes and edges
    for (const knowledge of character.knowledge) {
      const factId = `fact-${this.sanitizeId(knowledge)}`;
      if (!this.nodes.has(factId)) {
        this.addNode({
          id: factId,
          type: 'fact',
          label: knowledge,
          properties: {},
          chapterEstablished: chapter,
        });
      }
      
      this.addEdge({
        id: `edge-${character.name}-knows-${factId}`,
        from: charNode.id,
        to: factId,
        type: 'knows',
        properties: { since: chapter },
      });
    }
  }
  
  /**
   * Add location to graph
   */
  addLocation(name: string, description: string, chapter: number): void {
    const locNode: ConstraintNode = {
      id: `loc-${name}`,
      type: 'location',
      label: name,
      properties: { description },
      chapterEstablished: chapter,
    };
    
    this.addNode(locNode);
  }
  
  /**
   * Add event to graph
   */
  addEvent(
    id: string,
    description: string,
    participants: string[],
    chapter: number
  ): void {
    const eventNode: ConstraintNode = {
      id: `event-${id}`,
      type: 'event',
      label: description,
      properties: { participants },
      chapterEstablished: chapter,
    };
    
    this.addNode(eventNode);
    
    // Connect participants to event
    for (const participant of participants) {
      const charId = `char-${participant}`;
      if (this.nodes.has(charId)) {
        this.addEdge({
          id: `edge-${participant}-participates-${id}`,
          from: charId,
          to: eventNode.id,
          type: 'participates_in',
          properties: { chapter },
        });
      }
    }
  }
  
  /**
   * Update character location
   */
  updateCharacterLocation(characterName: string, newLocation: string, chapter: number): void {
    const charId = `char-${characterName}`;
    const charNode = this.nodes.get(charId);
    
    if (charNode) {
      // Update properties
      charNode.properties.location = newLocation;
      
      // Remove old location edges
      const oldEdges = this.getEdgesFrom(charId).filter(e => e.type === 'located_at');
      for (const edge of oldEdges) {
        this.edges.delete(edge.id);
        const adjSet = this.adjacencyList.get(edge.from);
        if (adjSet) {
          adjSet.delete(edge.to);
        }
      }
      
      // Add new location edge
      this.addEdge({
        id: `edge-${characterName}-loc-${chapter}`,
        from: charId,
        to: `loc-${newLocation}`,
        type: 'located_at',
        properties: { since: chapter },
      });
    }
  }
  
  /**
   * Check for constraint violations
   */
  checkConstraints(currentChapter: number): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    
    // Check location consistency
    violations.push(...this.checkLocationConsistency(currentChapter));
    
    // Check knowledge consistency
    violations.push(...this.checkKnowledgeConsistency(currentChapter));
    
    // Check timeline consistency
    violations.push(...this.checkTimelineConsistency(currentChapter));
    
    // Check logical consistency
    violations.push(...this.checkLogicalConsistency(currentChapter));
    
    return violations;
  }
  
  /**
   * Check location consistency (no teleporting)
   */
  private checkLocationConsistency(currentChapter: number): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    
    for (const node of this.nodes.values()) {
      if (node.type === 'character') {
        const locationEdges = this.getEdgesFrom(node.id).filter(e => e.type === 'located_at');
        
        // Sort by chapter
        const sortedEdges = locationEdges.sort((a, b) => 
          (a.properties.since || 0) - (b.properties.since || 0)
        );
        
        // Check for impossible movements (simplified)
        // In a real implementation, you'd check travel times between locations
        for (let i = 1; i < sortedEdges.length; i++) {
          const prevEdge = sortedEdges[i - 1];
          const currEdge = sortedEdges[i];
          const timeDiff = (currEdge.properties.since || 0) - (prevEdge.properties.since || 0);
          
          // If moved in same chapter, might be suspicious
          if (timeDiff === 0 && currEdge.properties.since === currentChapter) {
            violations.push({
              type: 'location',
              severity: 'warning',
              description: `${node.label} moved from ${prevEdge.to} to ${currEdge.to} instantly`,
              nodes: [node.id],
              suggestedFix: 'Add travel scene or justify rapid movement',
            });
          }
        }
      }
    }
    
    return violations;
  }
  
  /**
   * Check knowledge consistency (no impossible knowledge)
   */
  private checkKnowledgeConsistency(currentChapter: number): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    
    for (const node of this.nodes.values()) {
      if (node.type === 'character') {
        const knowledgeEdges = this.getEdgesFrom(node.id).filter(e => e.type === 'knows');
        
        for (const edge of knowledgeEdges) {
          const factNode = this.nodes.get(edge.to);
          if (factNode && factNode.chapterEstablished) {
            const knownSince = edge.properties.since || currentChapter;
            
            // Check if character knew fact before it was established
            if (knownSince < factNode.chapterEstablished) {
              violations.push({
                type: 'knowledge',
                severity: 'error',
                description: `${node.label} knows "${factNode.label}" before it happened (Ch ${knownSince} vs Ch ${factNode.chapterEstablished})`,
                nodes: [node.id, factNode.id],
                suggestedFix: 'Remove knowledge or adjust timeline',
              });
            }
          }
        }
      }
    }
    
    return violations;
  }
  
  /**
   * Check timeline consistency
   */
  private checkTimelineConsistency(currentChapter: number): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    
    // Check for events that reference future chapters
    for (const node of this.nodes.values()) {
      if (node.type === 'event' && node.chapterEstablished) {
        if (node.chapterEstablished > currentChapter) {
          violations.push({
            type: 'timeline',
            severity: 'error',
            description: `Event "${node.label}" is set in future chapter ${node.chapterEstablished} but we're in chapter ${currentChapter}`,
            nodes: [node.id],
            suggestedFix: 'Adjust event chapter or remove reference',
          });
        }
      }
    }
    
    return violations;
  }
  
  /**
   * Check logical consistency
   */
  private checkLogicalConsistency(currentChapter: number): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    
    // Check for characters participating in events when not present
    for (const node of this.nodes.values()) {
      if (node.type === 'event') {
        const participants = node.properties.participants || [];
        
        for (const participant of participants) {
          const charId = `char-${participant}`;
          const charNode = this.nodes.get(charId);
          
          if (charNode) {
            // Check if character was alive/present at event time
            if (charNode.chapterEstablished && node.chapterEstablished) {
              if (charNode.chapterEstablished > node.chapterEstablished) {
                violations.push({
                  type: 'logic',
                  severity: 'error',
                  description: `${participant} participates in event before they were introduced`,
                  nodes: [charId, node.id],
                  suggestedFix: 'Adjust character introduction or event timing',
                });
              }
            }
          }
        }
      }
    }
    
    return violations;
  }
  
  /**
   * Query what a character knows
   */
  getCharacterKnowledge(characterName: string): ConstraintNode[] {
    const charId = `char-${characterName}`;
    const knowledgeEdges = this.getEdgesFrom(charId).filter(e => e.type === 'knows');
    
    return knowledgeEdges
      .map(edge => this.nodes.get(edge.to))
      .filter((n): n is ConstraintNode => n !== undefined && n.type === 'fact');
  }
  
  /**
   * Query where a character is
   */
  getCharacterLocation(characterName: string): string | undefined {
    const charId = `char-${characterName}`;
    const locationEdge = this.getEdgesFrom(charId).find(e => e.type === 'located_at');
    
    if (locationEdge) {
      const locNode = this.nodes.get(locationEdge.to);
      return locNode?.label;
    }
    
    return undefined;
  }
  
  /**
   * Serialize graph
   */
  serialize(): string {
    return JSON.stringify({
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries()),
    });
  }
  
  /**
   * Load graph from serialized data
   */
  load(data: string): void {
    const parsed = JSON.parse(data);
    this.nodes = new Map(parsed.nodes);
    this.edges = new Map(parsed.edges);
    
    // Rebuild adjacency list
    this.adjacencyList = new Map();
    for (const [id, node] of this.nodes) {
      this.adjacencyList.set(id, new Set());
    }
    for (const edge of this.edges.values()) {
      const set = this.adjacencyList.get(edge.from);
      if (set) {
        set.add(edge.to);
      }
    }
  }
  
  /**
   * Get graph statistics
   */
  getStats(): { nodes: number; edges: number; byType: Record<NodeType, number> } {
    const byType: Record<NodeType, number> = {
      character: 0,
      location: 0,
      fact: 0,
      event: 0,
      item: 0,
    };
    
    for (const node of this.nodes.values()) {
      byType[node.type]++;
    }
    
    return {
      nodes: this.nodes.size,
      edges: this.edges.size,
      byType,
    };
  }
  
  /**
   * Sanitize string for use as ID
   */
  private sanitizeId(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  }
}

export function createConstraintGraph(): ConstraintGraph {
  return new ConstraintGraph();
}
