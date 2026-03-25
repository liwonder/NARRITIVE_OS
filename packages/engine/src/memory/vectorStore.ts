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
  private dimension: number = 1536; // Default: text-embedding-3-small dimension
  private storyId: string;
  private nextId: number = 0;
  private isInitialized: boolean = false;

  constructor(storyId: string) {
    this.storyId = storyId;
  }

  async initialize(maxElements: number = 10000): Promise<void> {
    // Delay initialization until we know the embedding dimension
    this.isInitialized = false;
    this.nextId = 0;
    this.memories.clear();
  }

  private ensureInitialized(embedding: number[]): void {
    if (!this.isInitialized) {
      // Detect dimension from first embedding
      this.dimension = embedding.length;
      this.index = new HierarchicalNSW('cosine', this.dimension);
      this.index.initIndex(10000, 16, 200);
      this.isInitialized = true;
    }
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
    const id = this.nextId++;
    
    // Generate embedding first to detect dimension
    const embedding = await this.generateEmbedding(memory.content);
    
    // Initialize index with correct dimension if not already done
    this.ensureInitialized(embedding);

    // Auto-resize if we're near capacity (add 50% more)
    if (this.index) {
      const currentCapacity = this.index.getMaxElements();
      if (this.memories.size >= currentCapacity - 1) {
        this.resizeIndex(Math.floor(currentCapacity * 1.5));
      }
    }
    
    const fullMemory: NarrativeMemory = {
      ...memory,
      id,
      embedding,
    };

    // Add to HNSW index
    this.index!.addPoint(embedding, id);
    this.memories.set(id, fullMemory);

    return fullMemory;
  }

  async searchSimilar(query: string, k: number = 5): Promise<MemorySearchResult[]> {
    if (!this.index) {
      // No memories added yet, return empty
      return [];
    }

    const queryEmbedding = await this.generateEmbedding(query);
    
    // Ensure dimensions match
    if (queryEmbedding.length !== this.dimension) {
      console.warn(`[VectorStore] Query embedding dimension ${queryEmbedding.length} doesn't match index dimension ${this.dimension}`);
      return [];
    }
    
    const results = this.index.searchKnn(queryEmbedding, k);

    return results.neighbors
      .map((id: number, i: number) => {
        const memory = this.memories.get(id);
        if (!memory) {
          console.warn(`[VectorStore] Memory with id ${id} not found in map`);
          return null;
        }
        return {
          memory,
          score: results.distances[i],
        };
      })
      .filter((result): result is MemorySearchResult => result !== null);
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

    // Try to get embedding config from LLM client
    const { getLLM } = await import('../llm/client.js');
    const llm = getLLM();
    const embedConfig = llm.getEmbeddingConfig();

    if (embedConfig) {
      // Use configured embedding model
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({
        apiKey: embedConfig.apiKey,
        baseURL: embedConfig.baseURL,
      });
      
      try {
        const response = await client.embeddings.create({
          model: embedConfig.model,
          input: text,
        });
        return response.data[0].embedding;
      } catch (error: any) {
        console.log(`  [VectorStore] Embedding API failed: ${error.message || error}`);
        console.log(`    Model: ${embedConfig.model}, Provider: ${embedConfig.provider}`);
        return this.generateMockEmbedding(text);
      }
    }

    // Fallback: try environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('  [VectorStore] No embedding config found, using mock embeddings');
      return this.generateMockEmbedding(text);
    }

    // Create OpenAI client for embeddings
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    
    try {
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
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
    
    // Reset initialization state but DON'T clear memories
    this.isInitialized = false;
    this.index = null;
    
    // Rebuild HNSW index with first embedding to detect dimension
    for (const [id, memory] of this.memories) {
      if (memory.embedding) {
        this.ensureInitialized(memory.embedding);
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
