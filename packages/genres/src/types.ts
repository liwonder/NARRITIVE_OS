/**
 * Scene type for genre schema
 */
export interface SceneType {
  name: string;
  description: string;
  purpose: string;
  typicalLength: 'short' | 'medium' | 'long';
}

/**
 * Plot point for genre schema
 */
export interface PlotPoint {
  name: string;
  description: string;
  required: boolean;
  typicalPosition: number; // 0-100% through story
}

/**
 * Genre schema interface
 */
export interface Genre {
  /** Unique genre identifier (English, used in code) */
  name: string;
  
  /** Display name for UI (supports multiple languages) */
  displayName: {
    en: string;
    zh: string;
  };
  
  /** Human-readable description */
  description: string;
  
  /** Required plot points for this genre */
  requiredPlotPoints: PlotPoint[];
  
  /** Scene types common in this genre */
  sceneTypes: SceneType[];
  
  /** Pacing pattern (tension levels 1-10 for each chapter position) */
  pacingPattern: number[];
  
  /** Default chapter count */
  defaultChapterCount: number;
  
  /** Compatible skills */
  compatibleSkills: string[];
  
  /** Default skills for this genre */
  defaultSkills: string[];
  
  /** Writing guidelines specific to this genre */
  writingGuidelines: string[];
}

/**
 * Genre registry interface
 */
export interface GenreRegistry {
  /** Register a genre */
  register(genre: Genre): void;
  
  /** Get a genre by name */
  get(name: string): Genre | undefined;
  
  /** List all registered genre names */
  list(): string[];
  
  /** Get all genres */
  getAll(): Genre[];
}
