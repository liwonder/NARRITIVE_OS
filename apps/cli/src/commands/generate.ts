import { generateChapter, updateStoryState, type GenerationContext, getVectorStore, createWorldStateEngine } from '@narrative-os/engine';
import { loadStory, saveStory, saveVectorStore, loadVectorStore } from '../config/store.js';

export async function generateCommand(storyId: string) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`❌ Story not found: ${storyId}\n`);
    console.log('💡 Try one of these:');
    console.log('   • List all stories:    nos list');
    console.log('   • Create new story:    nos init --title "My Story"');
    console.log('   • Check story status:  nos status');
    process.exit(1);
  }

  const { bible, state, chapters, canon, worldState } = story;
  
  // Initialize world state engine
  const worldStateEngine = createWorldStateEngine(storyId);
  if (worldState) {
    // Load existing world state
    worldStateEngine.loadState(worldState);
  }
  
  if (state.currentChapter >= state.totalChapters) {
    console.log('Story is complete!');
    return;
  }

  const nextChapterNumber = state.currentChapter + 1;

  const context: GenerationContext = {
    bible,
    state,
    chapterNumber: nextChapterNumber,
    targetWordCount: 1500,
  };

  // Load or initialize vector store for memory
  const vectorStore = getVectorStore(storyId);
  const existingData = loadVectorStore(storyId);
  if (existingData) {
    await vectorStore.load(existingData);
  } else {
    await vectorStore.initialize();
  }

  try {
    const result = await generateChapter(context, { canon, vectorStore, worldStateEngine });
    
    const newChapters = [...chapters, result.chapter];
    const newState = updateStoryState(state, result.summary);
    
    // Use updated canon and world state if available
    const updatedCanon = result.updatedCanon || canon;
    const updatedWorldState = result.updatedWorldState || worldStateEngine.getState();
    saveStory(bible, newState, newChapters, updatedCanon, undefined, updatedWorldState);
    
    // Save vector store
    saveVectorStore(storyId, vectorStore.serialize());

    console.log(`\n✅ Chapter ${result.chapter.number} generated!`);
    console.log(`   Title: ${result.chapter.title}`);
    console.log(`   Words: ${result.chapter.wordCount}`);
    if (result.violations.length > 0) {
      console.log(`   ⚠️  Canon violations: ${result.violations.length}`);
    }
    if (result.memoriesExtracted > 0) {
      console.log(`   🧠 Memories extracted: ${result.memoriesExtracted}`);
    }
    console.log(`   Summary: ${result.summary.summary}`);
    
    const progress = Math.round((newState.currentChapter / state.totalChapters) * 100);
    console.log(`\n📊 Progress: ${newState.currentChapter}/${state.totalChapters} (${progress}%)`);
    
    console.log(`\n💡 Next steps:`);
    if (newState.currentChapter < state.totalChapters) {
      console.log(`   • Generate next chapter:  nos generate ${storyId}`);
      console.log(`   • Read this chapter:      nos read ${storyId} ${result.chapter.number}`);
      console.log(`   • Auto-generate rest:     nos continue ${storyId}`);
    } else {
      console.log(`   🎉 Story complete!`);
      console.log(`   • Export to file:         nos export ${storyId}`);
      console.log(`   • Read full story:        nos read ${storyId}`);
    }
  } catch (error) {
    console.error('Generation failed:', error);
    process.exit(1);
  }
}
