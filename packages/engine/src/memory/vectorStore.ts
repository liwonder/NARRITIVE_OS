import { getLLM } from '../llm/client.js';
import { HierarchicalNSW } from 'hnswlib-node';

export interface NarrativeMemory {
  id: number;
  storyId: string;
  chapterNumber: number;
  content: string;
  category: 'event' | 'character' | 'world' | 'plot';
  timestamp: Date;
  embedding?: number[];
}

export interface MemorySearchResult {
  memory: NarrativeMemory;
  score: number;
}

export class VectorStore {
  private index: HierarchicalNSW | null = null;
  private memories: Map<number, NarrativeMemory> = new Map();
  private dimension: number = 1536; // text-embedding-3-small dimension
  private storyId: string;
  private nextId: number = 0;

  constructor(storyId: string) {
    this.storyId = storyId;
  }

  async initialize(maxElements: number = 10000): Promise<void> {
    this.index = new HierarchicalNSW('cosine', this.dimension);
    this.index.initIndex(maxElements, 16, 200);
    this.nextId = 0;
    this.memories.clear();
  }

  /**
   * Resize the index to accommodate more memories
   */
  resizeIndex(newMaxElements: number): void {
    if (!this.index) {
      throw new Error('VectorStore not initialized. Call initialize() first.');
    }
    
    if (newMaxElements <= this.memories.size) {
      return; // No need to resize
    }
    
    this.index.resizeIndex(newMaxElements);
  }

  /**
   * Ensure capacity for upcoming memories
   */
  ensureCapacity(additionalMemories: number): void {
    const requiredCapacity = this.memories.size + additionalMemories;
    const currentCapacity = this.index?.getMaxElements() || 0;
    
    if (requiredCapacity > currentCapacity) {
      // Add 50% more capacity or use required, whichever is larger
      const newCapacity = Math.max(Math.floor(currentCapacity * 1.5), requiredCapacity);
      this.resizeIndex(newCapacity);
    }
  }

  async addMemory(memory: Omit<NarrativeMemory, 'id' | 'embedding'>): Promise<NarrativeMemory> {
    if (!this.index) {
      throw new Error('VectorStore not initialized. Call initialize() first.');
    }

    // Auto-resize if we're near capacity (add 50% more)
    const currentCapacity = this.index.getMaxElements();
    if (this.memories.size >= currentCapacity - 1) {
      this.resizeIndex(Math.floor(currentCapacity * 1.5));
    }

    const id = this.nextId++;
    
    // Generate embedding using OpenAI
    const embedding = await this.generateEmbedding(memory.content);
    
    const fullMemory: NarrativeMemory = {
      ...memory,
      id,
      embedding,
    };

    // Add to HNSW index
    this.index.addPoint(embedding, id);
    this.memories.set(id, fullMemory);

    return fullMemory;
  }

  async searchSimilar(query: string, k: number = 5): Promise<MemorySearchResult[]> {
    if (!this.index) {
      throw new Error('VectorStore not initialized. Call initialize() first.');
    }

    const queryEmbedding = await this.generateEmbedding(query);
    const results = this.index.searchKnn(queryEmbedding, k);

    return results.neighbors.map((id: number, i: number) => ({
      memory: this.memories.get(id)!,
      score: results.distances[i],
    }));
  }

  async searchByCategory(query: string, category: NarrativeMemory['category'], k: number = 5): Promise<MemorySearchResult[]> {
    const results = await this.searchSimilar(query, k * 2);
    return results
      .filter(r => r.memory.category === category)
      .slice(0, k);
  }

  getMemoriesByChapter(chapterNumber: number): NarrativeMemory[] {
    return Array.from(this.memories.values())
      .filter(m => m.chapterNumber === chapterNumber);
  }

  getAllMemories(): NarrativeMemory[] {
    return Array.from(this.memories.values());
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Check if we should use mock embeddings (for testing without OpenAI)
    if (process.env.USE_MOCK_EMBEDDINGS === 'true') {
      return this.generateMockEmbedding(text);
    }

    // For embeddings, we need an OpenAI-compatible client
    // Try to get API key from environment
    const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.log('  [VectorStore] No API key found, using mock embeddings');
      return this.generateMockEmbedding(text);
    }

    // Determine base URL - use DeepSeek if that's what we have a key for
    const isDeepSeek = !process.env.OPENAI_API_KEY && !!process.env.DEEPSEEK_API_KEY;
    const baseURL = isDeepSeek ? 'https://api.deepseek.com' : undefined;
    
    // Create a temporary OpenAI client for embeddings
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({
      apiKey,
      baseURL,
    });
    
    try {
      const response = await client.embeddings.create({
        model: isDeepSeek ? 'deepseek-chat' : 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      // Fall back to mock embeddings if the API fails (e.g., DeepSeek doesn't support embeddings)
      console.log('  [VectorStore] Using mock embeddings (API unavailable)');
      return this.generateMockEmbedding(text);
    }
  }

  private generateMockEmbedding(text: string): number[] {
    // Generate a deterministic mock embedding based on text content
    // This is NOT for production - just for testing without OpenAI API
    const embedding: number[] = [];
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
      seed += text.charCodeAt(i);
    }
    
    for (let i = 0; i < this.dimension; i++) {
      // Simple pseudo-random based on seed
      seed = (seed * 9301 + 49297) % 233280;
      embedding.push((seed / 233280) * 2 - 1); // Range: -1 to 1
    }
    
    // Normalize the vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }

  // Serialize for persistence
  serialize(): string {
    return JSON.stringify({
      storyId: this.storyId,
      nextId: this.nextId,
      memories: Array.from(this.memories.entries()),
    });
  }

  // Deserialize from saved state
  async load(data: string): Promise<void> {
    const parsed = JSON.parse(data);
    this.memories = new Map(parsed.memories);
    this.nextId = parsed.nextId || this.memories.size;
    
    // Rebuild HNSW index
    await this.initialize();
    for (const [id, memory] of this.memories) {
      if (memory.embedding) {
        this.index!.addPoint(memory.embedding, id);
      }
    }
  }
}

// Factory for story-specific stores
const stores: Map<string, VectorStore> = new Map();

export function getVectorStore(storyId: string): VectorStore {
  if (!stores.has(storyId)) {
    stores.set(storyId, new VectorStore(storyId));
  }
  return stores.get(storyId)!;
}

export function clearVectorStore(storyId: string): void {
  stores.delete(storyId);
}
