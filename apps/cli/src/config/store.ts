import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { StoryBible, StoryState, Chapter, CanonStore, StoryStructuredState, WorldStateEngineState } from '@narrative-os/engine';
import { extractCanonFromBible, createStructuredState, initializeCharactersFromBible, initializePlotThreadsFromBible } from '@narrative-os/engine';

const DATA_DIR = join(homedir(), '.narrative-os');
const STORIES_DIR = join(DATA_DIR, 'stories');

function ensureDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(STORIES_DIR)) mkdirSync(STORIES_DIR, { recursive: true });
}

export function saveStory(
  bible: StoryBible,
  state: StoryState,
  chapters: Chapter[],
  canon?: CanonStore,
  structuredState?: StoryStructuredState,
  worldState?: WorldStateEngineState
) {
  ensureDirs();
  const storyDir = join(STORIES_DIR, bible.id);
  if (!existsSync(storyDir)) mkdirSync(storyDir, { recursive: true });

  writeFileSync(join(storyDir, 'bible.json'), JSON.stringify(bible, null, 2));
  writeFileSync(join(storyDir, 'state.json'), JSON.stringify(state, null, 2));
  
  // Save chapters to individual files in chapters/ directory
  const chaptersDir = join(storyDir, 'chapters');
  if (!existsSync(chaptersDir)) mkdirSync(chaptersDir, { recursive: true });
  
  for (const chapter of chapters) {
    const chapterFile = join(chaptersDir, `chapter-${chapter.number}.json`);
    writeFileSync(chapterFile, JSON.stringify(chapter, null, 2));
  }
  
  // Also save chapters index for quick lookup
  const chapterIndex = chapters.map(c => ({ number: c.number, title: c.title, wordCount: c.wordCount }));
  writeFileSync(join(storyDir, 'chapters-index.json'), JSON.stringify(chapterIndex, null, 2));
  
  const canonToSave = canon || extractCanonFromBible(bible);
  writeFileSync(join(storyDir, 'canon.json'), JSON.stringify(canonToSave, null, 2));
  
  // Save structured state if provided
  if (structuredState) {
    writeFileSync(join(storyDir, 'structured-state.json'), JSON.stringify(structuredState, null, 2));
  }
  
  // Phase 14: Save world state if provided
  if (worldState) {
    writeFileSync(join(storyDir, 'world-state.json'), JSON.stringify(worldState, null, 2));
  }
}

export function loadStory(storyId: string): { bible: StoryBible; state: StoryState; chapters: Chapter[]; canon: CanonStore; structuredState: StoryStructuredState | null; worldState: WorldStateEngineState | null } | null {
  const storyDir = join(STORIES_DIR, storyId);
  if (!existsSync(storyDir)) return null;

  try {
    const bible = JSON.parse(readFileSync(join(storyDir, 'bible.json'), 'utf-8'));
    const state = JSON.parse(readFileSync(join(storyDir, 'state.json'), 'utf-8'));
    
    // Load chapters from individual files
    const chapters: Chapter[] = [];
    const chaptersDir = join(storyDir, 'chapters');
    
    // Try to load from new format (individual files)
    if (existsSync(chaptersDir)) {
      const chapterFiles = readdirSync(chaptersDir)
        .filter(f => f.startsWith('chapter-') && f.endsWith('.json'))
        .sort((a, b) => {
          const numA = parseInt(a.match(/chapter-(\d+)\.json/)?.[1] || '0');
          const numB = parseInt(b.match(/chapter-(\d+)\.json/)?.[1] || '0');
          return numA - numB;
        });
      
      for (const file of chapterFiles) {
        const chapterPath = join(chaptersDir, file);
        const chapter = JSON.parse(readFileSync(chapterPath, 'utf-8'));
        chapters.push(chapter);
      }
    } else {
      // Fallback: try to load from old format (chapters.json)
      const oldChaptersPath = join(storyDir, 'chapters.json');
      if (existsSync(oldChaptersPath)) {
        const oldChapters = JSON.parse(readFileSync(oldChaptersPath, 'utf-8'));
        chapters.push(...oldChapters);
        // Migrate to new format
        saveStory(bible, state, chapters);
      }
    }
    
    let canon: CanonStore;
    const canonPath = join(storyDir, 'canon.json');
    if (existsSync(canonPath)) {
      canon = JSON.parse(readFileSync(canonPath, 'utf-8'));
    } else {
      canon = extractCanonFromBible(bible);
    }
    
    // Load structured state
    let structuredState: StoryStructuredState | null = null;
    const structuredPath = join(storyDir, 'structured-state.json');
    if (existsSync(structuredPath)) {
      structuredState = JSON.parse(readFileSync(structuredPath, 'utf-8'));
    }
    
    // Phase 14: Load world state
    let worldState: WorldStateEngineState | null = null;
    const worldStatePath = join(storyDir, 'world-state.json');
    if (existsSync(worldStatePath)) {
      worldState = JSON.parse(readFileSync(worldStatePath, 'utf-8'));
    }
    
    return { bible, state, chapters, canon, structuredState, worldState };
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

// Structured state persistence
export function saveStructuredState(storyId: string, state: StoryStructuredState): void {
  ensureDirs();
  const storyDir = join(STORIES_DIR, storyId);
  if (!existsSync(storyDir)) mkdirSync(storyDir, { recursive: true });
  
  writeFileSync(join(storyDir, 'structured-state.json'), JSON.stringify(state, null, 2));
}

export function loadStructuredState(storyId: string): StoryStructuredState | null {
  const storyDir = join(STORIES_DIR, storyId);
  const statePath = join(storyDir, 'structured-state.json');
  
  if (!existsSync(statePath)) return null;
  
  try {
    return JSON.parse(readFileSync(statePath, 'utf-8'));
  } catch {
    return null;
  }
}

// Initialize structured state from bible if it doesn't exist
export function initializeStructuredState(storyId: string, bible: StoryBible): StoryStructuredState {
  let state = loadStructuredState(storyId);
  
  if (!state) {
    state = createStructuredState(storyId);
    state = initializeCharactersFromBible(state, bible);
    state = initializePlotThreadsFromBible(state, bible);
    saveStructuredState(storyId, state);
  }
  
  return state;
}

// Constraint graph persistence
export function saveConstraintGraph(storyId: string, data: string): void {
  ensureDirs();
  const storyDir = join(STORIES_DIR, storyId);
  if (!existsSync(storyDir)) mkdirSync(storyDir, { recursive: true });
  
  writeFileSync(join(storyDir, 'constraint-graph.json'), data);
}

export function loadConstraintGraph(storyId: string): string | null {
  const storyDir = join(STORIES_DIR, storyId);
  const graphPath = join(storyDir, 'constraint-graph.json');
  
  if (!existsSync(graphPath)) return null;
  
  try {
    return readFileSync(graphPath, 'utf-8');
  } catch {
    return null;
  }
}

// World state persistence
export function saveWorldState(storyId: string, data: string): void {
  ensureDirs();
  const storyDir = join(STORIES_DIR, storyId);
  if (!existsSync(storyDir)) mkdirSync(storyDir, { recursive: true });
  
  writeFileSync(join(storyDir, 'world-state.json'), data);
}

export function loadWorldState(storyId: string): string | null {
  const storyDir = join(STORIES_DIR, storyId);
  const worldPath = join(storyDir, 'world-state.json');
  
  if (!existsSync(worldPath)) return null;
  
  try {
    return readFileSync(worldPath, 'utf-8');
  } catch {
    return null;
  }
}