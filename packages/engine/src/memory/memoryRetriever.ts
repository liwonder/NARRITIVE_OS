import { VectorStore, NarrativeMemory, MemorySearchResult } from './vectorStore.js';
import { getLLM } from '../llm/client.js';
import type { StoryBible, StoryState } from '../types/index.js';

export interface RetrievalContext {
  bible: StoryBible;
  state: StoryState;
  currentChapter: number;
  query?: string;
}

export interface RetrievedMemory {
  memory: NarrativeMemory;
  relevance: number;
  reason: string;
}

export class MemoryRetriever {
  private vectorStore: VectorStore;

  constructor(vectorStore: VectorStore) {
    this.vectorStore = vectorStore;
  }

  async retrieveForChapter(context: RetrievalContext, k: number = 5): Promise<RetrievedMemory[]> {
    const { bible, state, currentChapter, query } = context;

    // Generate a contextual query if none provided
    const searchQuery = query || this.generateContextualQuery(bible, state, currentChapter);

    // Search for similar memories
    const results = await this.vectorStore.searchSimilar(searchQuery, k * 2);

    // Filter out memories from the current chapter (can't recall what hasn't happened yet)
    const pastMemories = results.filter(r => r.memory && r.memory.chapterNumber !== undefined && r.memory.chapterNumber < currentChapter);

    // Re-rank and filter for relevance
    const ranked = await this.rerankMemories(searchQuery, pastMemories, k);

    return ranked;
  }

  async retrieveForCharacter(characterName: string, context: string, k: number = 3): Promise<RetrievedMemory[]> {
    const query = `Character ${characterName}: ${context}`;
    
    const results = await this.vectorStore.searchByCategory(query, 'character', k * 2);
    
    // Filter for memories actually about this character
    const characterMemories = results.filter(r => 
      r.memory.content.toLowerCase().includes(characterName.toLowerCase())
    );

    return characterMemories.slice(0, k).map(r => ({
      memory: r.memory,
      relevance: r.score,
      reason: 'Character-relevant memory',
    }));
  }

  async retrieveForPlotThread(plotThreadId: string, bible: StoryBible, k: number = 3): Promise<RetrievedMemory[]> {
    const plotThread = bible.plotThreads.find(p => p.id === plotThreadId);
    if (!plotThread) return [];

    const query = `Plot thread "${plotThread.name}": ${plotThread.description}`;
    
    const results = await this.vectorStore.searchByCategory(query, 'plot', k * 2);

    return results.slice(0, k).map(r => ({
      memory: r.memory,
      relevance: r.score,
      reason: `Relevant to plot thread: ${plotThread.name}`,
    }));
  }

  async retrieveRelevantEvents(query: string, k: number = 5): Promise<RetrievedMemory[]> {
    const results = await this.vectorStore.searchByCategory(query, 'event', k);

    return results.map(r => ({
      memory: r.memory,
      relevance: r.score,
      reason: 'Relevant past event',
    }));
  }

  formatMemoriesForPrompt(memories: RetrievedMemory[]): string {
    if (memories.length === 0) {
      return '';
    }

    const sections: string[] = [];
    
    // Group by category
    const byCategory = this.groupByCategory(memories);

    for (const [category, items] of Object.entries(byCategory)) {
      if (items.length > 0) {
        sections.push(`### ${this.capitalize(category)} Memories\n${items.map(m => `- ${m.memory.content} (Ch. ${m.memory.chapterNumber})`).join('\n')}`);
      }
    }

    return `## Relevant Past Memories\n\n${sections.join('\n\n')}`;
  }

  private generateContextualQuery(bible: StoryBible, state: StoryState, currentChapter: number): string {
    const progress = currentChapter / bible.targetChapters;
    const activeThreads = bible.plotThreads
      .filter(p => state.activePlotThreads.includes(p.id))
      .map(p => p.name)
      .join(', ');

    return `Chapter ${currentChapter} of ${bible.title}. Genre: ${bible.genre}. ` +
           `Story progress: ${Math.round(progress * 100)}%. ` +
           `Active plot threads: ${activeThreads}. ` +
           `Premise: ${bible.premise.substring(0, 200)}`;
  }

  private async rerankMemories(
    query: string, 
    candidates: MemorySearchResult[], 
    topK: number
  ): Promise<RetrievedMemory[]> {
    // Simple re-ranking: use the vector similarity score directly
    // In a more sophisticated version, we could use an LLM to judge relevance
    
    return candidates
      .slice(0, topK)
      .map(r => ({
        memory: r.memory,
        relevance: r.score,
        reason: this.inferRelevanceReason(r.memory),
      }));
  }

  private inferRelevanceReason(memory: NarrativeMemory): string {
    switch (memory.category) {
      case 'event':
        return 'Relevant past event';
      case 'character':
        return 'Character background or development';
      case 'world':
        return 'World-building detail';
      case 'plot':
        return 'Plot-relevant information';
      default:
        return 'Relevant memory';
    }
  }

  private groupByCategory(memories: RetrievedMemory[]): Record<string, RetrievedMemory[]> {
    const grouped: Record<string, RetrievedMemory[]> = {
      event: [],
      character: [],
      world: [],
      plot: [],
    };

    for (const memory of memories) {
      const cat = memory.memory.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(memory);
    }

    return grouped;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export function createMemoryRetriever(vectorStore: VectorStore): MemoryRetriever {
  return new MemoryRetriever(vectorStore);
}
