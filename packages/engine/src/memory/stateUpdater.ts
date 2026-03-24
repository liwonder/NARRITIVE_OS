import { getLLM } from '../llm/client.js';
import type { Chapter, StoryBible } from '../types/index.js';
import type { StoryStructuredState, CharacterState, PlotThreadState } from '../story/structuredState.js';
import type { VectorStore, NarrativeMemory } from './vectorStore.js';
import type { CanonStore } from './canonStore.js';
import { ConstraintGraph } from '../constraints/constraintGraph.js';

export interface StateUpdateResult {
  structuredState: StoryStructuredState;
  memoriesAdded: number;
  canonFactsAdded: number;
  graphUpdated: boolean;
  changes: StateChange[];
}

export interface StateChange {
  type: 'character' | 'plot' | 'world' | 'canon' | 'memory';
  description: string;
  chapter: number;
}

export interface UpdateContext {
  chapter: Chapter;
  bible: StoryBible;
  currentState: StoryStructuredState;
  canon: CanonStore;
  vectorStore: VectorStore;
  constraintGraph: ConstraintGraph;
}

const STATE_EXTRACTION_PROMPT = `You are a narrative state extractor. Analyze this chapter and extract all state changes.

## Story Bible

**Title:** {{title}}
**Genre:** {{genre}}

## Chapter {{chapterNumber}}: {{chapterTitle}}

{{chapterContent}}

## Current Character States

{{characters}}

## Current Plot Threads

{{plotThreads}}

## Extraction Task

Extract the following:

1. **Character Changes**: How do EXISTING characters change? (emotion, location, knowledge, relationships, goals)
2. **New Characters**: Any NEW important characters introduced? (major characters only, not background characters)
3. **Plot Thread Changes**: How do plot threads progress? (status, tension, summary updates)
4. **New Facts**: Any new canon facts established?
5. **World Changes**: Any changes to the world setting?

Output JSON:
{
  "characterChanges": [
    {
      "name": "existing character name",
      "emotionalState": "new emotional state or null",
      "location": "new location or null",
      "newKnowledge": ["facts learned"],
      "relationshipChanges": [{"with": "other character", "newStatus": "relationship"}],
      "newGoal": "new goal or null"
    }
  ],
  "newCharacters": [
    {
      "name": "new character name",
      "role": "protagonist|antagonist|supporting",
      "importance": "major|minor|background",
      "personality": ["trait1", "trait2"],
      "goals": ["goal1"],
      "background": "brief background if mentioned",
      "firstAppearanceContext": "how they appear in this chapter"
    }
  ],
  "plotThreadChanges": [
    {
      "id": "thread id",
      "status": "new status or null",
      "tensionDelta": 0.1,
      "newSummary": "updated summary or null"
    }
  ],
  "newFacts": [
    {
      "category": "character|world|plot",
      "subject": "subject",
      "attribute": "attribute",
      "value": "value"
    }
  ],
  "worldChanges": ["any changes to the world"]
}

Rules for newCharacters:
- Only include "major" importance characters (will appear in multiple chapters, drive plot)
- "minor" and "background" characters should be ignored
- Check if name already exists in Current Character States before adding`;

export class StateUpdaterPipeline {
  /**
   * Run the complete post-chapter update pipeline
   */
  async update(context: UpdateContext): Promise<StateUpdateResult> {
    const { chapter, bible, currentState, canon, vectorStore, constraintGraph } = context;
    
    const changes: StateChange[] = [];
    let memoriesAdded = 0;
    let canonFactsAdded = 0;
    
    // Step 1: Extract state changes using LLM
    const extraction = await this.extractChanges(chapter, bible, currentState);
    
    // Step 2: Add new major characters to bible
    const newCharactersAdded: string[] = [];
    for (const newChar of extraction.newCharacters) {
      if (newChar.importance === 'major' && !this.characterExistsInBible(bible, newChar.name)) {
        bible.characters.push({
          id: this.generateId(),
          name: newChar.name,
          role: newChar.role,
          personality: newChar.personality,
          goals: newChar.goals,
          background: newChar.background
        });
        newCharactersAdded.push(newChar.name);
        changes.push({
          type: 'character',
          description: `New character added to bible: ${newChar.name} (${newChar.role})`,
          chapter: chapter.number,
        });
      }
    }
    
    // Step 3: Update structured state
    let newState = { ...currentState };
    newState.chapter = chapter.number;
    
    // Apply character changes
    for (const change of extraction.characterChanges) {
      if (newState.characters[change.name]) {
        const char = newState.characters[change.name];
        
        if (change.emotionalState) {
          char.emotionalState = change.emotionalState;
          changes.push({
            type: 'character',
            description: `${change.name} emotional state → ${change.emotionalState}`,
            chapter: chapter.number,
          });
        }
        
        if (change.location) {
          const oldLocation = char.location;
          char.location = change.location;
          changes.push({
            type: 'character',
            description: `${change.name} moved: ${oldLocation} → ${change.location}`,
            chapter: chapter.number,
          });
          
          // Update constraint graph
          constraintGraph.updateCharacterLocation(change.name, change.location, chapter.number);
        }
        
        if (change.newKnowledge) {
          char.knowledge = [...char.knowledge, ...change.newKnowledge];
          
          // Add to constraint graph
          for (const knowledge of change.newKnowledge) {
            const factId = `fact-${this.sanitizeId(knowledge)}`;
            if (!constraintGraph.getNode(factId)) {
              constraintGraph.addNode({
                id: factId,
                type: 'fact',
                label: knowledge,
                properties: {},
                chapterEstablished: chapter.number,
              });
            }
            
            constraintGraph.addEdge({
              id: `edge-${change.name}-knows-${factId}`,
              from: `char-${change.name}`,
              to: factId,
              type: 'knows',
              properties: { since: chapter.number },
            });
          }
        }
        
        if (change.relationshipChanges) {
          for (const rel of change.relationshipChanges) {
            char.relationships[rel.with] = rel.newStatus;
          }
        }
        
        if (change.newGoal) {
          char.goals = [...char.goals, change.newGoal];
        }
      }
    }
    
    // Apply plot thread changes
    for (const change of extraction.plotThreadChanges) {
      if (newState.plotThreads[change.id]) {
        const thread = newState.plotThreads[change.id];
        
        if (change.status) {
          thread.status = change.status;
        }
        
        if (change.tensionDelta) {
          thread.tension = Math.max(0, Math.min(1, thread.tension + change.tensionDelta));
        }
        
        if (change.newSummary) {
          thread.summary = change.newSummary;
        }
        
        thread.lastChapter = chapter.number;
        
        changes.push({
          type: 'plot',
          description: `${thread.name} updated: ${change.status || 'progress'}`,
          chapter: chapter.number,
        });
      }
    }
    
    // Step 3: Add new canon facts
    for (const fact of extraction.newFacts) {
      // In real implementation, would add to canon store
      canonFactsAdded++;
      changes.push({
        type: 'canon',
        description: `Canon: ${fact.subject} ${fact.attribute} = ${fact.value}`,
        chapter: chapter.number,
      });
    }
    
    // Step 4: Extract and add narrative memories
    const memories = await this.extractMemories(chapter, bible);
    for (const memory of memories) {
      await vectorStore.addMemory({
        storyId: chapter.storyId,
        chapterNumber: chapter.number,
        content: memory.content,
        category: memory.category,
        timestamp: new Date(),
      });
      memoriesAdded++;
    }
    
    changes.push({
      type: 'memory',
      description: `${memoriesAdded} narrative memories extracted`,
      chapter: chapter.number,
    });
    
    // Step 5: Add event to constraint graph
    constraintGraph.addEvent(
      `ch${chapter.number}`,
      chapter.summary,
      Object.keys(newState.characters),
      chapter.number
    );
    
    // Step 6: Update recent events
    newState.recentEvents = [...newState.recentEvents, chapter.summary].slice(-10);
    
    return {
      structuredState: newState,
      memoriesAdded,
      canonFactsAdded,
      graphUpdated: true,
      changes,
    };
  }
  
  /**
   * Extract state changes from chapter
   */
  private async extractChanges(
    chapter: Chapter,
    bible: StoryBible,
    state: StoryStructuredState
  ): Promise<{
    characterChanges: Array<{
      name: string;
      emotionalState?: string;
      location?: string;
      newKnowledge?: string[];
      relationshipChanges?: Array<{ with: string; newStatus: string }>;
      newGoal?: string;
    }>;
    newCharacters: Array<{
      name: string;
      role: 'protagonist' | 'antagonist' | 'supporting';
      importance: 'major' | 'minor' | 'background';
      personality: string[];
      goals: string[];
      background?: string;
      firstAppearanceContext: string;
    }>;
    plotThreadChanges: Array<{
      id: string;
      status?: 'dormant' | 'active' | 'escalating' | 'resolved';
      tensionDelta?: number;
      newSummary?: string;
    }>;
    newFacts: Array<{
      category: 'character' | 'world' | 'plot';
      subject: string;
      attribute: string;
      value: string;
    }>;
    worldChanges: string[];
  }> {
    const characters = Object.values(state.characters)
      .map(c => `- ${c.name}: ${c.emotionalState}, at ${c.location}`)
      .join('\n');
    
    const plotThreads = Object.values(state.plotThreads)
      .map(t => `- ${t.name} (${t.status}, ${Math.round(t.tension * 100)}% tension)`)
      .join('\n');
    
    const prompt = STATE_EXTRACTION_PROMPT
      .replace('{{title}}', bible.title)
      .replace('{{genre}}', bible.genre)
      .replace('{{chapterNumber}}', chapter.number.toString())
      .replace('{{chapterTitle}}', chapter.title)
      .replace('{{chapterContent}}', chapter.content.substring(0, 5000))
      .replace('{{characters}}', characters)
      .replace('{{plotThreads}}', plotThreads);
    
    const result = await getLLM().completeJSON<{
      characterChanges: any[];
      newCharacters: any[];
      plotThreadChanges: any[];
      newFacts: any[];
      worldChanges: string[];
    }>(prompt, {
      temperature: 0.3,
      maxTokens: 2000,
    });
    
    return result;
  }
  
  /**
   * Extract narrative memories from chapter
   */
  private async extractMemories(
    chapter: Chapter,
    bible: StoryBible
  ): Promise<Array<{ content: string; category: NarrativeMemory['category'] }>> {
    // Simplified memory extraction
    // In real implementation, would use MemoryExtractor agent
    const memories: Array<{ content: string; category: NarrativeMemory['category'] }> = [];
    
    // Extract key events from summary
    if (chapter.summary) {
      memories.push({
        content: chapter.summary,
        category: 'event',
      });
    }
    
    // Add chapter title as memory
    memories.push({
      content: `Chapter ${chapter.number}: ${chapter.title}`,
      category: 'plot',
    });
    
    return memories;
  }
  
  /**
   * Quick update without LLM (for testing)
   */
  async quickUpdate(context: UpdateContext): Promise<StateUpdateResult> {
    const { chapter, currentState, vectorStore, constraintGraph } = context;
    
    const changes: StateChange[] = [];
    let newState = { ...currentState };
    newState.chapter = chapter.number;
    
    // Add basic memories
    await vectorStore.addMemory({
      storyId: chapter.storyId,
      chapterNumber: chapter.number,
      content: chapter.summary,
      category: 'event',
      timestamp: new Date(),
    });
    
    await vectorStore.addMemory({
      storyId: chapter.storyId,
      chapterNumber: chapter.number,
      content: `Chapter ${chapter.number}: ${chapter.title}`,
      category: 'plot',
      timestamp: new Date(),
    });
    
    changes.push({
      type: 'memory',
      description: `2 memories added (quick mode)`,
      chapter: chapter.number,
    });
    
    // Update recent events
    newState.recentEvents = [...newState.recentEvents, chapter.summary].slice(-10);
    
    // Add to constraint graph
    constraintGraph.addEvent(
      `ch${chapter.number}`,
      chapter.summary,
      Object.keys(newState.characters),
      chapter.number
    );
    
    return {
      structuredState: newState,
      memoriesAdded: 2,
      canonFactsAdded: 0,
      graphUpdated: true,
      changes,
    };
  }
  
  /**
   * Format update result
   */
  formatResult(result: StateUpdateResult): string {
    const lines: string[] = ['## State Update Result'];
    
    lines.push(`\n**Memories Added:** ${result.memoriesAdded}`);
    lines.push(`**Canon Facts Added:** ${result.canonFactsAdded}`);
    lines.push(`**Graph Updated:** ${result.graphUpdated ? '✅' : '❌'}`);
    
    if (result.changes.length > 0) {
      lines.push('\n**Changes:**');
      
      const byType: Record<string, StateChange[]> = {
        character: [],
        plot: [],
        world: [],
        canon: [],
        memory: [],
      };
      
      for (const change of result.changes) {
        byType[change.type].push(change);
      }
      
      for (const [type, changes] of Object.entries(byType)) {
        if (changes.length > 0) {
          lines.push(`\n*${type.charAt(0).toUpperCase() + type.slice(1)}:*`);
          for (const change of changes) {
            lines.push(`  - ${change.description}`);
          }
        }
      }
    }
    
    return lines.join('\n');
  }
  
  private sanitizeId(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  }
  
  private characterExistsInBible(bible: StoryBible, name: string): boolean {
    return bible.characters.some(c => 
      c.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const stateUpdaterPipeline = new StateUpdaterPipeline();
