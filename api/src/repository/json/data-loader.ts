export function padId(id: number): string {
  return id.toString().padStart(4, "0");
}

export class DataLoader {
  constructor(private assets: Fetcher, private baseUrl: string) {}

  async loadJson<T>(path: string): Promise<T | null> {
    try {
      const response = await this.assets.fetch(`${this.baseUrl}/${path}`);
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  async loadPokemon<T>(id: number): Promise<T | null> {
    return this.loadJson<T>(`core/pokemons/${padId(id)}.json`);
  }

  async loadForms<T>(pokemonId: number): Promise<T | null> {
    return this.loadJson<T>(`core/forms/${padId(pokemonId)}.json`);
  }

  async loadAbility<T>(id: number): Promise<T | null> {
    return this.loadJson<T>(`core/abilities/${padId(id)}.json`);
  }

  async loadAvailability<T>(pokemonId: number): Promise<T | null> {
    return this.loadJson<T>(`mainline/availability/${padId(pokemonId)}.json`);
  }

  async loadGoPokemon<T>(pokemonId: number): Promise<T | null> {
    return this.loadJson<T>(`go/pokemon_stats/${padId(pokemonId)}.json`);
  }

  async loadCostumes<T>(pokemonId: number): Promise<T | null> {
    return this.loadJson<T>(`go/costumes/${padId(pokemonId)}.json`);
  }

  async loadIndex<T>(name: string): Promise<T | null> {
    return this.loadJson<T>(`_index/${name}.json`);
  }
}
