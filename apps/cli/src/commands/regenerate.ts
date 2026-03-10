import { generateChapter, updateStoryState, type GenerationContext, getVectorStore } from '@narrative-os/engine';
import { loadStory, saveStory, saveVectorStore, loadVectorStore } from '../config/store.js';

export async function regenerateCommand(storyId: string, chapterNumber: number) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  const { bible, state, chapters, canon } = story;
  
  // Find the chapter to regenerate
  const chapterIndex = chapters.findIndex(ch => ch.number === chapterNumber);
  
  if (chapterIndex === -1) {
    console.error(`Chapter ${chapterNumber} not found.`);
    console.log(`Available chapters: 1-${chapters.length}`);
    process.exit(1);
  }

  console.log(`Regenerating Chapter ${chapterNumber}...`);
  console.log(`Current title: ${chapters[chapterIndex].title}\n`);

  // Load or initialize vector store
  const vectorStore = getVectorStore(storyId);
  const existingData = loadVectorStore(storyId);
  if (existingData) {
    await vectorStore.load(existingData);
  } else {
    await vectorStore.initialize();
  }

  // Create context - use state as it was BEFORE this chapter
  const context: GenerationContext = {
    bible,
    state: {
      ...state,
      currentChapter: chapterNumber - 1, // Pretend we're at previous chapter
    },
    chapterNumber,
    targetWordCount: 1500,
  };

  try {
    const result = await generateChapter(context, { canon, vectorStore });
    
    // Replace the old chapter
    const newChapters = [...chapters];
    newChapters[chapterIndex] = result.chapter;
    
    saveStory(bible, state, newChapters, canon);
    saveVectorStore(storyId, vectorStore.serialize());

    console.log(`\n✅ Chapter ${chapterNumber} regenerated!`);
    console.log(`New title: ${result.chapter.title}`);
    console.log(`Words: ${result.chapter.wordCount}`);
    if (result.violations.length > 0) {
      console.log(`⚠️  Canon violations: ${result.violations.length}`);
    }
    console.log(`\nSummary: ${result.summary.summary}`);
  } catch (error) {
    console.error('Regeneration failed:', error);
    process.exit(1);
  }
}
