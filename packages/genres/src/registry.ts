import type { Genre, GenreRegistry } from './types.js';

class Registry implements GenreRegistry {
  private genres = new Map<string, Genre>();

  register(genre: Genre): void {
    this.genres.set(genre.name, genre);
  }

  get(name: string): Genre | undefined {
    return this.genres.get(name);
  }

  list(): string[] {
    return Array.from(this.genres.keys());
  }

  getAll(): Genre[] {
    return Array.from(this.genres.values());
  }
}

export const registry: GenreRegistry = new Registry();
