import type { Game, Generation } from "@pokebase/schemas";
import type { DataLoader } from "@/repository/data-loader";

export class GameRepository {
  private cache: { generations: Generation[] } | null = null;

  constructor(private loader: DataLoader) {}

  private async getData(): Promise<{ generations: Generation[] }> {
    if (!this.cache) {
      const data = await this.loader.loadGames();
      this.cache = data ?? { generations: [] };
    }
    return this.cache;
  }

  async findGameById(id: string): Promise<Game | null> {
    const { generations } = await this.getData();
    for (const gen of generations) {
      for (const group of gen.groups) {
        const game = group.games.find((g) => g.id === id);
        if (game) return game;
      }
    }
    return null;
  }

  async findAll(): Promise<{ generations: Generation[] }> {
    return this.getData();
  }
}
