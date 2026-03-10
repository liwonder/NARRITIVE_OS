import { getVectorStore } from '@narrative-os/engine';
import { loadVectorStore } from '../config/store.js';

export async function memoriesCommand(storyId: string, query?: string) {
  // Load vector store
  const vectorStore = getVectorStore(storyId);
  const existingData = loadVectorStore(storyId);
  
  if (existingData) {
    await vectorStore.load(existingData);
  } else {
    console.log('No memories found for this story.');
    return;
  }

  const allMemories = vectorStore.getAllMemories();
  
  if (allMemories.length === 0) {
    console.log('No memories found for this story.');
    return;
  }

  if (query) {
    // Search memories
    console.log(`Searching memories for: "${query}"\n`);
    const results = await vectorStore.searchSimilar(query, 10);
    
    console.log(`Found ${results.length} relevant memories:\n`);
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      console.log(`${i + 1}. [${r.memory.category}] Chapter ${r.memory.chapterNumber}`);
      console.log(`   ${r.memory.content.substring(0, 80)}...`);
      console.log(`   Relevance: ${(1 - r.score).toFixed(3)}`);
      console.log('');
    }
  } else {
    // List all memories
    console.log(`Total memories: ${allMemories.length}\n`);
    
    // Group by category
    const byCategory: Record<string, typeof allMemories> = {};
    for (const mem of allMemories) {
      if (!byCategory[mem.category]) {
        byCategory[mem.category] = [];
      }
      byCategory[mem.category].push(mem);
    }
    
    for (const [category, memories] of Object.entries(byCategory)) {
      console.log(`\n## ${category.toUpperCase()} (${memories.length})`);
      console.log('─'.repeat(60));
      
      for (const mem of memories.slice(0, 5)) { // Show first 5 per category
        console.log(`\n  Chapter ${mem.chapterNumber}:`);
        console.log(`  ${mem.content.substring(0, 100)}...`);
      }
      
      if (memories.length > 5) {
        console.log(`\n  ... and ${memories.length - 5} more`);
      }
    }
  }
  
  console.log('');
}
