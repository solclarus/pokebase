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
  constructor(private assets: Fetcher, private baseUrl: string) {}

  /** 指定パスの JSON を取得する。404 は null、それ以外のエラーは例外を投げる。 */
  async loadJson<T>(path: string): Promise<T | null> {
    let response: Response;
    try {
      response = await this.assets.fetch(`${this.baseUrl}/${path}`);
    } catch (e) {
      throw new Error(`Failed to fetch ${path}: ${e}`);
    }
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
    return (await response.json()) as T;
  }

  // --- core/ ---

  async loadPokemon<T>(id: number): Promise<T | null> {
    return this.loadJson<T>(`core/pokemons/${padId(id)}.json`);
  }

  async loadForms<T>(pokemonId: number): Promise<T | null> {
    return this.loadJson<T>(`core/forms/${padId(pokemonId)}.json`);
  }

  async loadAbility<T>(id: number): Promise<T | null> {
    return this.loadJson<T>(`core/abilities/${padId(id)}.json`);
  }

  // --- mainline/ ---

  async loadAvailability<T>(pokemonId: number): Promise<T | null> {
    return this.loadJson<T>(`mainline/availability/${padId(pokemonId)}.json`);
  }

  async loadMove<T>(id: number): Promise<T | null> {
    return this.loadJson<T>(`mainline/moves/${padId(id)}.json`);
  }

  async loadLearnset<T>(pokemonId: number): Promise<T | null> {
    return this.loadJson<T>(`mainline/learnsets/${padId(pokemonId)}.json`);
  }

  /** ゲームソフト一覧は 1 ファイルに集約されている（1 ポケモン 1 ファイル原則の例外）。 */
  async loadGames<T>(): Promise<{ games: T[] } | null> {
    return this.loadJson<{ games: T[] }>("mainline/games.json");
  }

  // --- go/ ---

  async loadGoForms<T>(pokemonId: number): Promise<T | null> {
    return this.loadJson<T>(`go/forms/${padId(pokemonId)}.json`);
  }

  async loadCostumes<T>(pokemonId: number): Promise<T | null> {
    return this.loadJson<T>(`go/costumes/${padId(pokemonId)}.json`);
  }

  async loadGoMove<T>(id: number): Promise<T | null> {
    return this.loadJson<T>(`go/moves/${padId(id)}.json`);
  }

  // --- _index/ ---

  /** CI が自動生成する軽量インデックスを読み込む。ページネーション・identifier 検索に使用する。 */
  async loadIndex<T>(name: string): Promise<T | null> {
    return this.loadJson<T>(`_index/${name}.json`);
  }
}
