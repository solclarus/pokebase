import type { Game } from "@pokemon/schemas";
import type { DataLoader } from "@/repository/data-loader";

export class GameRepository {
  // findById と findAll の両方で games.json を読むため、同一リクエスト内でキャッシュする
  private cache: Game[] | null = null;

  constructor(private loader: DataLoader) {}

  private async getAll(): Promise<Game[]> {
    if (!this.cache) {
      const data = await this.loader.loadGames();
      this.cache = data?.games ?? [];
    }
    return this.cache;
  }

  async findById(id: string): Promise<Game | null> {
    const games = await this.getAll();
    return games.find((g) => g.id === id) ?? null;
  }

  async findAll(): Promise<Game[]> {
    return this.getAll();
  }
}
