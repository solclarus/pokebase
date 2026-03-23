import type { GoPokemon, GoMove } from "@pokebase/schemas";
import type { DataLoader } from "@/repository/data-loader";

type GoPokemonIndex = { pokemons: Array<{ pokemon_id: number }>; total: number };

/** GO フォーム別ステータス（go/forms/）を読み込む Repository。 */
export class GoPokemonRepository {
  // findAll と count でインデックスを共有するためリクエスト内でキャッシュする
  private indexCache: GoPokemonIndex | null = null;

  constructor(private loader: DataLoader) {}

  private async getIndex(): Promise<GoPokemonIndex> {
    if (!this.indexCache) {
      const index = await this.loader.loadIndex<GoPokemonIndex>("go-pokemons");
      if (!index) throw new Error("Failed to load go-pokemon index");
      this.indexCache = index;
    }
    return this.indexCache;
  }

  async findById(pokemonId: number): Promise<GoPokemon | null> {
    return this.loader.loadGoForms(pokemonId);
  }

  async findAll(limit = 20, offset = 0): Promise<GoPokemon[]> {
    const index = await this.getIndex();
    const entries = index.pokemons.slice(offset, offset + limit);
    const results = await Promise.all(entries.map((e) => this.findById(e.pokemon_id)));
    return results.filter((r): r is GoPokemon => r !== null);
  }

  async count(): Promise<number> {
    const index = await this.getIndex();
    return index.total;
  }
}

/** GO 技（go/moves/）を読み込む Repository。findAll は _index/go-moves.json を使用する。 */
export class GoMoveRepository {
  constructor(private loader: DataLoader) {}

  async findById(id: number): Promise<GoMove | null> {
    return this.loader.loadGoMove(id);
  }

  async findAll(): Promise<GoMove[]> {
    const index = await this.loader.loadIndex<{ moves: GoMove[] }>("go-moves");
    if (!index) throw new Error("Failed to load go-move index");
    return index.moves;
  }
}
