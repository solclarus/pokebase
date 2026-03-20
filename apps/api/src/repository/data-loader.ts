import type {
  Pokemon,
  PokemonForms,
  Ability,
  PokemonAvailability,
  Move,
  PokemonLearnset,
  Game,
  GoPokemon,
  PokemonCostumes,
  GoMove,
} from "@pokemon/schemas";

/** ポケモン ID を 4 桁ゼロ埋め文字列に変換する（例: 6 → "0006"）。 */
export function padId(id: number): string {
  return id.toString().padStart(4, "0");
}

/**
 * Cloudflare Workers の ASSETS Fetcher をラップし、data/ ディレクトリの
 * JSON ファイルを型安全に読み込むユーティリティクラス。
 * ファイルが存在しない・取得エラーの場合は null を返す。
 */
export class DataLoader {
  constructor(
    private assets: Fetcher,
    private baseUrl: string,
  ) {}

  /** 指定パスの JSON を取得する。404 は null、それ以外のエラーは例外を投げる。 */
  async loadJson<T>(path: string): Promise<T | null> {
    let response: Response;
    try {
      response = await this.assets.fetch(`${this.baseUrl}/${path}`);
    } catch (e) {
      throw new Error(`Failed to fetch ${path}: ${String(e)}`);
    }
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
    return (await response.json()) as T;
  }

  // --- core/ ---

  async loadPokemon(id: number): Promise<Pokemon | null> {
    return this.loadJson(`core/pokemons/${padId(id)}.json`);
  }

  async loadForms(pokemonId: number): Promise<PokemonForms | null> {
    return this.loadJson(`core/forms/${padId(pokemonId)}.json`);
  }

  async loadAbility(id: number): Promise<Ability | null> {
    return this.loadJson(`core/abilities/${padId(id)}.json`);
  }

  // --- mainline/ ---

  async loadAvailability(pokemonId: number): Promise<PokemonAvailability | null> {
    return this.loadJson(`mainline/availability/${padId(pokemonId)}.json`);
  }

  async loadMove(id: number): Promise<Move | null> {
    return this.loadJson(`mainline/moves/${padId(id)}.json`);
  }

  async loadLearnset(pokemonId: number): Promise<PokemonLearnset | null> {
    return this.loadJson(`mainline/learnsets/${padId(pokemonId)}.json`);
  }

  /** ゲームソフト一覧は 1 ファイルに集約されている（1 ポケモン 1 ファイル原則の例外）。 */
  async loadGames(): Promise<{ games: Game[] } | null> {
    return this.loadJson("mainline/games.json");
  }

  // --- go/ ---

  async loadGoForms(pokemonId: number): Promise<GoPokemon | null> {
    return this.loadJson(`go/forms/${padId(pokemonId)}.json`);
  }

  async loadCostumes(pokemonId: number): Promise<PokemonCostumes | null> {
    return this.loadJson(`go/costumes/${padId(pokemonId)}.json`);
  }

  async loadGoMove(id: number): Promise<GoMove | null> {
    return this.loadJson(`go/moves/${padId(id)}.json`);
  }

  // --- _index/ ---

  /** CI が自動生成する軽量インデックスを読み込む。ページネーション・identifier 検索に使用する。 */
  async loadIndex<T>(name: string): Promise<T | null> {
    return this.loadJson<T>(`_index/${name}.json`);
  }
}
