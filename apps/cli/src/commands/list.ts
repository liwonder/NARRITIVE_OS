import { listStories } from '../config/store.js';

export function listCommand() {
  const stories = listStories();
  
  if (stories.length === 0) {
    console.log('No stories found. Run "nos init" to create one.');
    return;
  }

  console.log(`Found ${stories.length} story(s):\n`);
  
  for (const story of stories) {
    const progress = Math.round((story.currentChapter / story.totalChapters) * 100);
    const status = story.currentChapter >= story.totalChapters ? '✅ Complete' : '⏳ In Progress';
    console.log(`  ${story.id}`);
    console.log(`    Title: ${story.title}`);
    console.log(`    Progress: ${story.currentChapter}/${story.totalChapters} (${progress}%)`);
    console.log(`    Status: ${status}`);
    console.log('');
  }
}
