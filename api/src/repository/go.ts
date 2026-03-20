import type { GoFormsFile, GoMove } from "@/types";
import type { DataLoader } from "@/repository/data-loader";

type GoPokemonIndex = { pokemons: Array<{ pokemon_id: number }>; total: number };

/** GO フォーム別ステータス（go/forms/）を読み込む Repository。 */
export class GoPokemonRepository {
  // findAll と count でインデックスを共有するためリクエスト内でキャッシュする
  private indexCache: GoPokemonIndex | null = null;

  constructor(private loader: DataLoader) {}

  private async getIndex(): Promise<GoPokemonIndex> {
    if (!this.indexCache) {
      this.indexCache = await this.loader.loadIndex<GoPokemonIndex>("go-pokemons");
    }
    return this.indexCache ?? { pokemons: [], total: 0 };
  }

  async findById(pokemonId: number): Promise<GoFormsFile | null> {
    return this.loader.loadGoForms<GoFormsFile>(pokemonId);
  }

  async findAll(limit = 20, offset = 0): Promise<GoFormsFile[]> {
    const index = await this.getIndex();
    const entries = index.pokemons.slice(offset, offset + limit);
    const results = await Promise.all(entries.map((e) => this.findById(e.pokemon_id)));
    return results.filter((r): r is GoFormsFile => r !== null);
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
    return this.loader.loadGoMove<GoMove>(id);
  }

  async findAll(): Promise<GoMove[]> {
    const index = await this.loader.loadIndex<{ moves: GoMove[] }>("go-moves");
    return index?.moves ?? [];
  }
}
