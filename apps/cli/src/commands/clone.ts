import { createStoryBible, createStoryState, extractCanonFromBible, initializeCharactersFromBible, initializePlotThreadsFromBible, createStructuredState } from '@narrative-os/engine';
import { loadStory, saveStory, saveStructuredState } from '../config/store.js';

export function cloneCommand(storyId: string, newTitle: string) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  const { bible, state } = story;
  
  // Create new bible with same settings but new title
  const newBible = createStoryBible(
    newTitle,
    bible.theme,
    bible.genre,
    bible.setting,
    bible.tone,
    bible.premise,
    state.totalChapters
  );
  
  // Copy characters
  for (const char of bible.characters) {
    newBible.characters.push({ ...char });
  }
  
  // Copy plot threads
  for (const thread of bible.plotThreads) {
    newBible.plotThreads.push({ ...thread });
  }
  
  // Create fresh state
  const newState = createStoryState(newBible.id, state.totalChapters);
  const canon = extractCanonFromBible(newBible);
  
  // Save the cloned story
  saveStory(newBible, newState, [], canon);
  
  // Initialize structured state
  let structuredState = createStructuredState(newBible.id);
  structuredState = initializeCharactersFromBible(structuredState, newBible);
  structuredState = initializePlotThreadsFromBible(structuredState, newBible);
  saveStructuredState(newBible.id, structuredState);
  
  console.log(`✅ Story cloned: ${newTitle}`);
  console.log(`Original: ${bible.title} (${storyId})`);
  console.log(`New ID: ${newBible.id}`);
  console.log(`\nNext: Run "nos generate ${newBible.id}" to start writing.`);
}
