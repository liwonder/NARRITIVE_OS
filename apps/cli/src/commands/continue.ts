import { generateChapter, updateStoryState, type GenerationContext } from '@narrative-os/engine';
import { loadStory, saveStory } from '../config/store.js';

export async function continueCommand(storyId: string) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  let { bible, state, chapters, canon } = story;
  
  if (state.currentChapter >= state.totalChapters) {
    console.log('Story is already complete!');
    return;
  }

  console.log(`Continuing story: ${bible.title}`);
  console.log(`Generating chapters ${state.currentChapter + 1} to ${state.totalChapters}...\n`);

  while (state.currentChapter < state.totalChapters) {
    const nextChapterNumber = state.currentChapter + 1;
    
    const context: GenerationContext = {
      bible,
      state,
      chapterNumber: nextChapterNumber,
      targetWordCount: 1500,
    };

    try {
      const result = await generateChapter(context, { canon });
      
      chapters = [...chapters, result.chapter];
      state = updateStoryState(state, result.summary);
      
      saveStory(bible, state, chapters, canon);

      const violationWarn = result.violations.length > 0 ? ` [${result.violations.length} violations]` : '';
      console.log(`✓ Chapter ${result.chapter.number}: ${result.chapter.title} (${result.chapter.wordCount} words)${violationWarn}`);
    } catch (error) {
      console.error(`\nFailed at Chapter ${nextChapterNumber}:`, error);
      process.exit(1);
    }
  }

  console.log('\nStory complete!');
  console.log(`Total: ${chapters.length} chapters`);
  console.log(`Total words: ${chapters.reduce((sum, ch) => sum + ch.wordCount, 0)}`);
}
