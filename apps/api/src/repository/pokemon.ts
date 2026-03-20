import type { Pokemon } from "@/types";
import type { DataLoader } from "@/repository/data-loader";

type PokemonIndex = {
  pokemons: Array<{ id: number; identifier: string }>;
  total: number;
};

export class PokemonRepository {
  // findByIdentifier と findAll でインデックスを共有するためリクエスト内でキャッシュする
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
    const pokemons = await Promise.all(entries.map((e) => this.findById(e.id)));
    return pokemons.filter((p): p is Pokemon => p !== null);
  }

  async count(): Promise<number> {
    const index = await this.getIndex();
    return index.total;
  }
}
