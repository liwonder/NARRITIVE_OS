import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.narrative-os');
const CURRENT_STORY_FILE = path.join(CONFIG_DIR, '.current');

/**
 * Get the currently active story ID
 */
export function getCurrentStoryId(): string | null {
  try {
    if (fs.existsSync(CURRENT_STORY_FILE)) {
      return fs.readFileSync(CURRENT_STORY_FILE, 'utf-8').trim();
    }
  } catch (e) {
    // Ignore errors
  }
  return null;
}

/**
 * Set the currently active story ID
 */
export function setCurrentStoryId(storyId: string): void {
  fs.writeFileSync(CURRENT_STORY_FILE, storyId);
}

/**
 * Clear the current story
 */
export function clearCurrentStory(): void {
  try {
    if (fs.existsSync(CURRENT_STORY_FILE)) {
      fs.unlinkSync(CURRENT_STORY_FILE);
    }
  } catch (e) {
    // Ignore errors
  }
}

/**
 * Use command - set active story
 */
export function useCommand(storyId: string | null) {
  if (!storyId) {
    const current = getCurrentStoryId();
    if (current) {
      console.log(`Current active story: ${current}`);
    } else {
      console.log('No active story set. Use "nos use <story-id>" to set one.');
    }
    return;
  }

  // Validate story exists
  const storiesDir = path.join(CONFIG_DIR, 'stories');
  const storyPath = path.join(storiesDir, storyId, 'bible.json');
  
  if (!fs.existsSync(storyPath)) {
    console.error(`❌ Story not found: ${storyId}`);
    console.log('Use "nos list" to see available stories.');
    process.exit(1);
  }

  setCurrentStoryId(storyId);
  console.log(`✅ Set active story: ${storyId}`);
  console.log('You can now run commands without specifying story ID:');
  console.log('  nos generate    # Generate next chapter');
  console.log('  nos status      # Check story status');
  console.log('  nos read        # Read latest chapter');
}

/**
 * Resolve story ID - use provided ID or fall back to current
 */
export function resolveStoryId(providedId: string | undefined): string {
  if (providedId) {
    return providedId;
  }
  
  const current = getCurrentStoryId();
  if (!current) {
    console.error('❌ No story ID provided and no active story set.');
    console.log('Usage: nos <command> [story-id]');
    console.log('Or set an active story: nos use <story-id>');
    process.exit(1);
  }
  
  return current;
}
