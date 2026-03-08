import type { StoryState, ChapterSummary } from '../types/index.js';

export function createStoryState(storyId: string, totalChapters: number): StoryState {
  return {
    storyId,
    currentChapter: 0,
    totalChapters,
    currentTension: 0.1,
    activePlotThreads: [],
    chapterSummaries: [],
  };
}

export function updateStoryState(
  state: StoryState,
  summary: ChapterSummary
): StoryState {
  return {
    ...state,
    currentChapter: summary.chapterNumber,
    chapterSummaries: [...state.chapterSummaries, summary],
    currentTension: calculateTension(summary.chapterNumber, state.totalChapters),
  };
}

function calculateTension(currentChapter: number, totalChapters: number): number {
  const progress = currentChapter / totalChapters;
  return 4 * progress * (1 - progress);
}
