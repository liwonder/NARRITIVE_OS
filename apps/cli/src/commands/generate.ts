import { generateChapter, updateStoryState, type GenerationContext } from '@narrative-os/engine';
import { loadStory, saveStory } from '../config/store.js';

export async function generateCommand(storyId: string) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  const { bible, state, chapters, canon } = story;
  
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

  try {
    const result = await generateChapter(context, { canon });
    
    const newChapters = [...chapters, result.chapter];
    const newState = updateStoryState(state, result.summary);
    
    saveStory(bible, newState, newChapters, canon);

    console.log(`\nChapter ${result.chapter.number} generated!`);
    console.log(`Title: ${result.chapter.title}`);
    console.log(`Words: ${result.chapter.wordCount}`);
    if (result.violations.length > 0) {
      console.log(`⚠️  Canon violations: ${result.violations.length}`);
    }
    console.log(`Summary: ${result.summary.summary}`);
    console.log(`\nProgress: ${newState.currentChapter}/${state.totalChapters}`);
    
    if (newState.currentChapter < state.totalChapters) {
      console.log(`\nNext: Run "nos generate ${storyId}" for Chapter ${nextChapterNumber + 1}`);
    } else {
      console.log('\nStory complete!');
    }
  } catch (error) {
    console.error('Generation failed:', error);
    process.exit(1);
  }
}
