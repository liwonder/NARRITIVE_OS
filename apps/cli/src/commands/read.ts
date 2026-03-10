import { loadStory } from '../config/store.js';

export function readCommand(storyId: string, chapterNumber?: number) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  const { bible, chapters } = story;
  
  if (chapters.length === 0) {
    console.log(`Story "${bible.title}" has no chapters yet.`);
    console.log(`Run "nos generate ${storyId}" to write Chapter 1.`);
    return;
  }
  
  if (chapterNumber) {
    // Read specific chapter
    const chapter = chapters.find(ch => ch.number === chapterNumber);
    
    if (!chapter) {
      console.error(`Chapter ${chapterNumber} not found.`);
      console.log(`Available chapters: 1-${chapters.length}`);
      process.exit(1);
    }
    
    console.log(`\n# Chapter ${chapter.number}: ${chapter.title}`);
    console.log(`Word count: ${chapter.wordCount}`);
    console.log('─'.repeat(60));
    console.log('');
    console.log(chapter.content);
    console.log('');
    console.log('─'.repeat(60));
  } else {
    // List all chapters
    console.log(`\nStory: ${bible.title}`);
    console.log(`Total chapters: ${chapters.length}\n`);
    
    for (const chapter of chapters) {
      console.log(`  Chapter ${chapter.number}: ${chapter.title} (${chapter.wordCount} words)`);
    }
    
    console.log(`\nUse "nos read ${storyId} <chapter-number>" to read a specific chapter.`);
  }
}
