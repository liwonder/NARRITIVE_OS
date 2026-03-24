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

Create ONLY the protagonist (main character) for Chapter 1. The user may have already mentioned the protagonist's name in the premise - if so, use that name. Otherwise, generate an appropriate name for the ${languageName} language and story setting.

Return a JSON array with ONE character:
[
  {
    "name": "Character Name (in ${languageName})",
    "role": "protagonist",
    "personality": ["trait1", "trait2", "trait3"],
    "goals": ["primary goal", "secondary goal"]
  }
]

Requirements:
- Create ONLY ONE protagonist (the main character)
- Check if the premise already mentions a character name - use it if found
- Names must be authentic for the language/culture
- Personality traits should fit the story genre and premise
- Goals should drive the plot based on the premise

Return ONLY the JSON array, no markdown formatting.`;

  try {
    const response = await llm.complete(prompt, {
      temperature: 0.8,
      // No maxTokens limit - let LLM return complete JSON
      task: 'generation'
    });
    
    // DEBUG: Save raw response for analysis
    const debugDir = '/tmp/nos-debug';
    if (!require('fs').existsSync(debugDir)) {
      require('fs').mkdirSync(debugDir, { recursive: true });
    }
    require('fs').writeFileSync(
      `${debugDir}/character-gen-raw-${Date.now()}.json`,
      JSON.stringify({ raw: response, timestamp: new Date().toISOString() }, null, 2)
    );
    
    // Clean up response and parse JSON
    let cleaned = response.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
    
    // Handle incomplete JSON - find the last valid complete object
    if (!cleaned.endsWith(']')) {
      // Try to find the last complete object by matching braces and brackets
      let braceCount = 0;
      let bracketCount = 0;
      let lastValidEnd = -1;
      let inString = false;
      let escapeNext = false;
      
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            // Check if we're at the end of a complete object and array is balanced
            if (braceCount === 0 && bracketCount === 0) {
              lastValidEnd = i;
            }
          }
          if (char === '[') bracketCount++;
          if (char === ']') bracketCount--;
        }
      }
      
      if (lastValidEnd > 0) {
        cleaned = cleaned.substring(0, lastValidEnd + 1) + ']';
      } else {
        // Fallback: try simple brace matching
        const lastBrace = cleaned.lastIndexOf('}');
        if (lastBrace > 0) {
          cleaned = cleaned.substring(0, lastBrace + 1) + ']';
        }
      }
    }
    
    const characters: CharacterProfile[] = JSON.parse(cleaned);
    
    // Add IDs to characters
    return characters.map(char => ({
      ...char,
      id: generateId()
    }));
  } catch (error) {
    console.error('Character generation failed:', error);
    throw new Error(`Failed to generate protagonist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
