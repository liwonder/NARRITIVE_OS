import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { loadStory } from '../config/store.js';

const STORIES_DIR = join(homedir(), '.narrative-os', 'stories');

export function deleteCommand(storyId: string, force: boolean = false) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  console.log(`Story: ${story.bible.title}`);
  console.log(`ID: ${storyId}`);
  console.log(`Chapters: ${story.state.currentChapter}/${story.state.totalChapters}`);
  
  if (!force) {
    console.log('\n⚠️  This will permanently delete the story and all its chapters.');
    console.log('Use --force to skip this confirmation.');
    process.exit(1);
  }

  const storyDir = join(STORIES_DIR, storyId);
  
  if (existsSync(storyDir)) {
    rmSync(storyDir, { recursive: true, force: true });
    console.log(`\n✅ Story "${story.bible.title}" deleted.`);
  } else {
    console.error(`Story directory not found: ${storyDir}`);
    process.exit(1);
  }
}
