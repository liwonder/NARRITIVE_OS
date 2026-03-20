import type { Skill, SkillRegistry } from './types.js';

class Registry implements SkillRegistry {
  private skills = new Map<string, Skill>();
  private genreDefaults = new Map<string, string[]>();

  register(skill: Skill): void {
    this.skills.set(skill.name, skill);
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  list(): string[] {
    return Array.from(this.skills.keys());
  }

  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  getByGenre(genre: string): Skill[] {
    return this.getAll().filter(skill => 
      skill.compatibleGenres.length === 0 || 
      skill.compatibleGenres.includes(genre)
    );
  }

  getDefaultsForGenre(genre: string): Skill[] {
    const defaults = this.genreDefaults.get(genre) || [];
    return defaults.map(name => this.skills.get(name)).filter(Boolean) as Skill[];
  }

  setGenreDefaults(genre: string, skillNames: string[]): void {
    this.genreDefaults.set(genre, skillNames);
  }
}

export const registry: SkillRegistry = new Registry();
