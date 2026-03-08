import { loadStory, listStories } from '../config/store.js';

export function statusCommand(storyId?: string) {
  if (!storyId) {
    const stories = listStories();
    
    if (stories.length === 0) {
      console.log('No stories found. Run "nos init" to create one.');
      return;
    }

    console.log('Stories:\n');
    for (const story of stories) {
      const progress = Math.round((story.currentChapter / story.totalChapters) * 100);
      console.log(`  ${story.id}`);
      console.log(`    Title: ${story.title}`);
      console.log(`    Progress: ${story.currentChapter}/${story.totalChapters} (${progress}%)`);
      console.log('');
    }
    return;
  }

  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  const { bible, state, chapters } = story;
  const progress = Math.round((state.currentChapter / state.totalChapters) * 100);

  console.log(`Story: ${bible.title}`);
  console.log(`ID: ${bible.id}`);
  console.log(`Theme: ${bible.theme}`);
  console.log(`Genre: ${bible.genre}`);
  console.log(`Setting: ${bible.setting}`);
  console.log(`\nProgress: ${state.currentChapter}/${state.totalChapters} (${progress}%)`);
  console.log(`Current Tension: ${(state.currentTension * 100).toFixed(0)}%`);
  
  if (chapters.length > 0) {
    console.log('\nChapters:');
    for (const ch of chapters) {
      console.log(`  ${ch.number}. ${ch.title} (${ch.wordCount} words)`);
    }
  }

  if (state.chapterSummaries.length > 0) {
    console.log('\nRecent Summaries:');
    for (const sum of state.chapterSummaries.slice(-3)) {
      console.log(`  Ch ${sum.chapterNumber}: ${sum.summary.substring(0, 80)}...`);
    }
  }
}
