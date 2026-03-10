import { loadStory, loadStructuredState } from '../config/store.js';

export function stateCommand(storyId: string) {
  const story = loadStory(storyId);
  const structuredState = loadStructuredState(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  const { bible, state } = story;
  
  console.log(`\n# Story State: ${bible.title}`);
  console.log('─'.repeat(60));
  
  console.log(`\n## Progress`);
  console.log(`  Current Chapter: ${state.currentChapter} / ${state.totalChapters}`);
  const progress = Math.round((state.currentChapter / state.totalChapters) * 100);
  console.log(`  Progress: ${progress}%`);
  console.log(`  Current Tension: ${(state.currentTension * 100).toFixed(0)}%`);
  
  if (structuredState) {
    console.log(`\n## Characters`);
    console.log('─'.repeat(60));
    
    const characters = Object.values(structuredState.characters);
    if (characters.length === 0) {
      console.log('  No character states tracked.');
    } else {
      for (const char of characters) {
        console.log(`\n  ${char.name}`);
        console.log(`    Emotional State: ${char.emotionalState}`);
        console.log(`    Location: ${char.location}`);
        console.log(`    Goals: ${char.goals.join(', ')}`);
        if (char.knowledge.length > 0) {
          console.log(`    Knowledge: ${char.knowledge.length} facts`);
        }
        if (Object.keys(char.relationships).length > 0) {
          console.log(`    Relationships: ${Object.entries(char.relationships).map(([k, v]) => `${k} (${v})`).join(', ')}`);
        }
      }
    }
    
    console.log(`\n## Plot Threads`);
    console.log('─'.repeat(60));
    
    const threads = Object.values(structuredState.plotThreads);
    if (threads.length === 0) {
      console.log('  No plot threads tracked.');
    } else {
      for (const thread of threads) {
        console.log(`\n  ${thread.name}`);
        console.log(`    Status: ${thread.status}`);
        console.log(`    Tension: ${(thread.tension * 100).toFixed(0)}%`);
        console.log(`    Last Chapter: ${thread.lastChapter}`);
        console.log(`    Summary: ${thread.summary.substring(0, 60)}...`);
      }
    }
    
    if (structuredState.unresolvedQuestions.length > 0) {
      console.log(`\n## Unresolved Questions`);
      console.log('─'.repeat(60));
      for (const q of structuredState.unresolvedQuestions) {
        console.log(`  • ${q}`);
      }
    }
    
    if (structuredState.recentEvents.length > 0) {
      console.log(`\n## Recent Events`);
      console.log('─'.repeat(60));
      for (const e of structuredState.recentEvents.slice(-5)) {
        console.log(`  • ${e.substring(0, 80)}...`);
      }
    }
  } else {
    console.log('\n  No structured state available.');
    console.log('  Generate some chapters to track state.');
  }
  
  console.log('');
}
