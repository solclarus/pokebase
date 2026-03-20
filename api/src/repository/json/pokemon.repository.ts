import type { PokemonRepository } from "../interface";
import type { Pokemon } from "../../types";
import type { DataLoader } from "./data-loader";

type PokemonIndex = {
  pokemons: Array<{ id: number; identifier: string }>;
  total: number;
};

export class JsonPokemonRepository implements PokemonRepository {
  private indexCache: PokemonIndex | null = null;

  constructor(private loader: DataLoader) {}

  private async getIndex(): Promise<PokemonIndex> {
    if (!this.indexCache) {
      this.indexCache = await this.loader.loadIndex<PokemonIndex>("pokemons");
    }
    return this.indexCache ?? { pokemons: [], total: 0 };
  }

  async findById(id: number): Promise<Pokemon | null> {
    return this.loader.loadPokemon<Pokemon>(id);
  }

  async findByIdentifier(identifier: string): Promise<Pokemon | null> {
    const index = await this.getIndex();
    const entry = index.pokemons.find((p) => p.identifier === identifier);
    if (!entry) return null;
    return this.findById(entry.id);
  }

  async findAll(limit = 20, offset = 0): Promise<Pokemon[]> {
    const index = await this.getIndex();
    const entries = index.pokemons.slice(offset, offset + limit);
    const pokemons: Pokemon[] = [];

    for (const entry of entries) {
      const pokemon = await this.findById(entry.id);
      if (pokemon) pokemons.push(pokemon);
    }

    return pokemons;
  }

  async count(): Promise<number> {
    const index = await this.getIndex();
    return index.total;
  }
}
