/**
 * Skill interface for writing technique plugins
 */
export interface Skill {
  /** Unique skill identifier (English, used in code) */
  name: string;
  
  /** Display name for UI (supports multiple languages) */
  displayName: {
    en: string;
    zh: string;
  };
  
  /** Human-readable description */
  description: string;
  
  /** Instructions for the writer agent */
  instructions: string;
  
  /** Priority (1-10, higher = more important) */
  priority: number;
  
  /** Compatible genres (empty = all genres) */
  compatibleGenres: string[];
  
  /** Incompatible skills */
  incompatibleWith: string[];
  
  /** When to apply this skill */
  applyWhen: 'always' | 'scene-start' | 'scene-end' | 'chapter-start' | 'chapter-end' | 'high-tension' | 'low-tension';
}

/**
 * Skill registry interface
 */
export interface SkillRegistry {
  /** Register a skill */
  register(skill: Skill): void;
  
  /** Get a skill by name */
  get(name: string): Skill | undefined;
  
  /** List all registered skill names */
  list(): string[];
  
  /** Get all skills */
  getAll(): Skill[];
  
  /** Get skills compatible with a genre */
  getByGenre(genre: string): Skill[];
  
  /** Get default skills for a genre */
  getDefaultsForGenre(genre: string): Skill[];
  
  /** Set default skills for a genre */
  setGenreDefaults(genre: string, skillNames: string[]): void;
}
