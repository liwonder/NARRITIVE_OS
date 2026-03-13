import type { StoryBible, CharacterProfile, PlotThread } from '../types/index.js';

/**
 * Detect language from text content
 * Returns language code (e.g., 'en', 'zh', 'ja', 'ko', etc.)
 */
export function detectLanguage(text: string): string {
  if (!text || text.trim().length === 0) {
    return 'en'; // Default to English
  }
  
  // Check for Chinese characters
  if (/[\u4e00-\u9fa5]/.test(text)) {
    return 'zh';
  }
  
  // Check for Japanese characters (Hiragana/Katakana)
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    return 'ja';
  }
  
  // Check for Korean characters
  if (/[\uac00-\ud7af]/.test(text)) {
    return 'ko';
  }
  
  // Check for Arabic characters
  if (/[\u0600-\u06ff]/.test(text)) {
    return 'ar';
  }
  
  // Check for Cyrillic characters (Russian, etc.)
  if (/[\u0400-\u04ff]/.test(text)) {
    return 'ru';
  }
  
  // Check for Thai characters
  if (/[\u0e00-\u0e7f]/.test(text)) {
    return 'th';
  }
  
  // Check for Devanagari (Hindi, etc.)
  if (/[\u0900-\u097f]/.test(text)) {
    return 'hi';
  }
  
  // Default to English for Latin script
  return 'en';
}

/**
 * Get human-readable language name
 */
export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'en': 'English',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'ru': 'Russian',
    'th': 'Thai',
    'hi': 'Hindi',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'pt': 'Portuguese',
    'it': 'Italian',
  };
  return names[code] || code;
}

export function createStoryBible(
  title: string,
  theme: string,
  genre: string,
  setting: string,
  tone: string,
  premise: string,
  targetChapters: number = 10
): StoryBible {
  // Auto-detect language from title and premise
  const language = detectLanguage(title + ' ' + premise);
  
  return {
    id: generateId(),
    title,
    theme,
    genre,
    setting,
    tone,
    targetChapters,
    premise,
    language,
    characters: [],
    plotThreads: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function addCharacter(
  bible: StoryBible,
  name: string,
  role: CharacterProfile['role'],
  personality: string[],
  goals: string[]
): StoryBible {
  const character: CharacterProfile = {
    id: generateId(),
    name,
    role,
    personality,
    goals,
  };
  
  return {
    ...bible,
    characters: [...bible.characters, character],
    updatedAt: new Date(),
  };
}

export function addPlotThread(
  bible: StoryBible,
  name: string,
  description: string
): StoryBible {
  const thread: PlotThread = {
    id: generateId(),
    name,
    description,
    status: 'dormant',
    tension: 0.1,
  };
  
  return {
    ...bible,
    plotThreads: [...bible.plotThreads, thread],
    updatedAt: new Date(),
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
