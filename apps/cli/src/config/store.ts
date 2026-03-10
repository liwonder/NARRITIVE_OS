import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { StoryBible, StoryState, Chapter, CanonStore } from '@narrative-os/engine';
import { extractCanonFromBible } from '@narrative-os/engine';

const DATA_DIR = join(homedir(), '.narrative-os');
const STORIES_DIR = join(DATA_DIR, 'stories');

function ensureDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(STORIES_DIR)) mkdirSync(STORIES_DIR, { recursive: true });
}

export function saveStory(bible: StoryBible, state: StoryState, chapters: Chapter[], canon?: CanonStore) {
  ensureDirs();
  const storyDir = join(STORIES_DIR, bible.id);
  if (!existsSync(storyDir)) mkdirSync(storyDir, { recursive: true });

  writeFileSync(join(storyDir, 'bible.json'), JSON.stringify(bible, null, 2));
  writeFileSync(join(storyDir, 'state.json'), JSON.stringify(state, null, 2));
  writeFileSync(join(storyDir, 'chapters.json'), JSON.stringify(chapters, null, 2));
  
  const canonToSave = canon || extractCanonFromBible(bible);
  writeFileSync(join(storyDir, 'canon.json'), JSON.stringify(canonToSave, null, 2));
}

export function loadStory(storyId: string): { bible: StoryBible; state: StoryState; chapters: Chapter[]; canon: CanonStore } | null {
  const storyDir = join(STORIES_DIR, storyId);
  if (!existsSync(storyDir)) return null;

  try {
    const bible = JSON.parse(readFileSync(join(storyDir, 'bible.json'), 'utf-8'));
    const state = JSON.parse(readFileSync(join(storyDir, 'state.json'), 'utf-8'));
    const chapters = JSON.parse(readFileSync(join(storyDir, 'chapters.json'), 'utf-8'));
    
    let canon: CanonStore;
    const canonPath = join(storyDir, 'canon.json');
    if (existsSync(canonPath)) {
      canon = JSON.parse(readFileSync(canonPath, 'utf-8'));
    } else {
      canon = extractCanonFromBible(bible);
    }
    
    return { bible, state, chapters, canon };
  } catch {
    return null;
  }
}

export function listStories(): { id: string; title: string; currentChapter: number; totalChapters: number }[] {
  ensureDirs();
  const stories = [];
  
  for (const dir of existsSync(STORIES_DIR) ? readdirSync(STORIES_DIR) : []) {
    const storyPath = join(STORIES_DIR, dir);
    const statePath = join(storyPath, 'state.json');
    const biblePath = join(storyPath, 'bible.json');
    
    if (existsSync(statePath) && existsSync(biblePath)) {
      try {
        const state = JSON.parse(readFileSync(statePath, 'utf-8'));
        const bible = JSON.parse(readFileSync(biblePath, 'utf-8'));
        stories.push({
          id: dir,
          title: bible.title,
          currentChapter: state.currentChapter,
          totalChapters: state.totalChapters,
        });
      } catch {}
    }
  }
  
  return stories;
}

// Vector store persistence
export function saveVectorStore(storyId: string, data: string): void {
  ensureDirs();
  const storyDir = join(STORIES_DIR, storyId);
  if (!existsSync(storyDir)) mkdirSync(storyDir, { recursive: true });
  
  writeFileSync(join(storyDir, 'vector-store.json'), data);
}

export function loadVectorStore(storyId: string): string | null {
  const storyDir = join(STORIES_DIR, storyId);
  const vectorPath = join(storyDir, 'vector-store.json');
  
  if (!existsSync(vectorPath)) return null;
  
  try {
    return readFileSync(vectorPath, 'utf-8');
  } catch {
    return null;
  }
}


