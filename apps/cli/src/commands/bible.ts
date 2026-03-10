import { loadStory, saveStory } from '../config/store.js';

export function bibleCommand(storyId: string) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  const { bible } = story;
  
  console.log(`\n# ${bible.title}`);
  console.log('─'.repeat(60));
  console.log(`\n**Theme:** ${bible.theme}`);
  console.log(`**Genre:** ${bible.genre}`);
  console.log(`**Setting:** ${bible.setting}`);
  console.log(`**Tone:** ${bible.tone}`);
  console.log(`\n**Premise:**`);
  console.log(bible.premise);
  
  console.log('\n## Characters');
  console.log('─'.repeat(60));
  
  if (bible.characters.length === 0) {
    console.log('No characters defined.');
  } else {
    for (const char of bible.characters) {
      console.log(`\n### ${char.name}`);
      console.log(`  Role: ${char.role}`);
      console.log(`  Personality: ${char.personality.join(', ')}`);
      console.log(`  Goals: ${char.goals.join(', ')}`);
      if (char.background) {
        console.log(`  Background: ${char.background}`);
      }
    }
  }
  
  console.log('\n## Plot Threads');
  console.log('─'.repeat(60));
  
  if (bible.plotThreads.length === 0) {
    console.log('No plot threads defined.');
  } else {
    for (const thread of bible.plotThreads) {
      console.log(`\n- ${thread.name}`);
      console.log(`  Status: ${thread.status}`);
      console.log(`  Description: ${thread.description}`);
    }
  }
  
  console.log('');
}
