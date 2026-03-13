import type { StoryBible, CharacterProfile, PlotThread } from '../types/index.js';
import { getLLM } from '../llm/client.js';

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

/**
 * Generate characters for the story using LLM
 * Creates appropriate names based on language and story context
 */
export async function generateCharacters(
  title: string,
  premise: string,
  genre: string,
  setting: string,
  language: string
): Promise<CharacterProfile[]> {
  const llm = getLLM();
  
  const languageName = language === 'zh' ? 'Chinese' : 
                       language === 'ja' ? 'Japanese' : 
                       language === 'ko' ? 'Korean' : 
                       language === 'en' ? 'English' : language;
  
  const prompt = `You are a character creator for a ${genre} novel.

Story Title: ${title}
Premise: ${premise}
Setting: ${setting}
Language: ${languageName}

Create 2-4 main characters for this story. Generate character names appropriate for the ${languageName} language and story setting.

Return a JSON array of characters:
[
  {
    "name": "Character Name (in ${languageName})",
    "role": "protagonist|antagonist|supporting|mentor",
    "personality": ["trait1", "trait2", "trait3"],
    "goals": ["primary goal", "secondary goal"]
  }
]

Requirements:
- Include exactly ONE protagonist (main character)
- Include ONE antagonist (opposing force)
- Include 1-2 supporting characters
- Names must be authentic for the language/culture
- Personality traits should create interesting conflicts
- Goals should drive the plot based on the premise

Return ONLY the JSON array, no markdown formatting.`;

  try {
    const response = await llm.complete(prompt, {
      temperature: 0.8,
      maxTokens: 1500,
      task: 'generation'
    });
    
    // Clean up response and parse JSON
    const cleaned = response.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
    const characters: CharacterProfile[] = JSON.parse(cleaned);
    
    // Add IDs to characters
    return characters.map(char => ({
      ...char,
      id: generateId()
    }));
  } catch (error) {
    console.error('Character generation failed:', error);
    // Return default characters based on language
    return getDefaultCharacters(language);
  }
}

/**
 * Get default characters when LLM generation fails
 */
function getDefaultCharacters(language: string): CharacterProfile[] {
  const defaults: Record<string, CharacterProfile[]> = {
    'zh': [
      { id: generateId(), name: '李明', role: 'protagonist', personality: ['坚韧', '聪明', '有正义感'], goals: ['揭开真相', '保护家人'] },
      { id: generateId(), name: '王强', role: 'antagonist', personality: ['狡猾', '野心勃勃', '冷酷'], goals: ['隐藏秘密', '获得权力'] },
      { id: generateId(), name: '张丽', role: 'supporting', personality: ['善良', '勇敢', '忠诚'], goals: ['帮助朋友', '追求真相'] }
    ],
    'en': [
      { id: generateId(), name: 'Alex Chen', role: 'protagonist', personality: ['determined', 'intelligent', 'resourceful'], goals: ['uncover the truth', 'protect loved ones'] },
      { id: generateId(), name: 'Victor Black', role: 'antagonist', personality: ['cunning', 'ambitious', 'ruthless'], goals: ['hide the secret', 'gain power'] },
      { id: generateId(), name: 'Sarah Miller', role: 'supporting', personality: ['kind', 'brave', 'loyal'], goals: ['help friends', 'seek justice'] }
    ],
    'ja': [
      { id: generateId(), name: '田中健一', role: 'protagonist', personality: ['勤勉', '誠実', '勇敢'], goals: ['真実を明らかにする', '家族を守る'] },
      { id: generateId(), name: '佐藤隆', role: 'antagonist', personality: ['狡猾', '野心的', '冷酷'], goals: ['秘密を隠す', '力を得る'] },
      { id: generateId(), name: '山田花子', role: 'supporting', personality: ['優しい', '勇敢', '忠実'], goals: ['友達を助ける', '正義を求める'] }
    ]
  };
  
  return defaults[language] || defaults['en'];
}
