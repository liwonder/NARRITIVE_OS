import { listStories, loadStory } from '../config/store.js';

export function showHint(context?: { storyId?: string; afterCommand?: string }) {
  const stories = listStories();
  
  console.log('\n💡 Quick Tips:\n');
  
  if (stories.length === 0) {
    console.log('  You have no stories yet.');
    console.log('  Create one:  nos init --title "My Story"');
    return;
  }
  
  // Find an active story (not complete)
  const activeStory = stories.find(s => s.currentChapter < s.totalChapters);
  const storyId = context?.storyId || activeStory?.id || stories[0].id;
  const story = loadStory(storyId);
  
  if (!story) return;
  
  const { state } = story;
  const isComplete = state.currentChapter >= state.totalChapters;
  
  // Show hints based on context
  if (context?.afterCommand === 'init') {
    console.log(`  Your story "${story.bible.title}" is ready!`);
    console.log(`  Generate Chapter 1:  nos generate ${storyId}`);
  } else if (isComplete) {
    console.log(`  Story "${story.bible.title}" is complete! 🎉`);
    console.log(`  Export to file:      nos export ${storyId}`);
    console.log(`  Read the story:      nos read ${storyId}`);
    console.log(`  Clone as template:   nos clone ${storyId} "New Version"`);
  } else {
    console.log(`  Continue "${story.bible.title}" (${state.currentChapter}/${state.totalChapters} chapters)`);
    console.log(`  Generate next:       nos generate ${storyId}`);
    console.log(`  Auto-complete:       nos continue ${storyId}`);
    console.log(`  Check status:        nos status ${storyId}`);
  }
  
  console.log('');
  console.log('  Other useful commands:');
  console.log('    nos list              List all stories');
  console.log('    nos bible <id>        View story bible');
  console.log('    nos memories <id>     Search memories');
  console.log('    nos validate <id>     Check consistency');
  console.log('    nos --help            Show all commands');
}

export function showWelcome() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║          📝 Narrative OS - AI Story Engine             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const stories = listStories();
  
  if (stories.length === 0) {
    console.log('Welcome! Let\'s create your first story.\n');
    console.log('💡 Quick Start:');
    console.log('   nos init --title "My Adventure" --chapters 10');
    console.log('\nOr explore options:');
    console.log('   nos init --help');
  } else {
    console.log(`You have ${stories.length} story(s).\n`);
    console.log('💡 Quick Commands:');
    console.log('   nos list              See all stories');
    console.log('   nos status            Check story status');
    console.log('   nos generate <id>     Write next chapter');
    console.log('   nos --help            All commands');
  }
  
  console.log('');
}
