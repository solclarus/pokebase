import { GameRepository } from "@/repository";
import type { DataLoader } from "@/repository/data-loader";
import type { Game, Generation } from "@pokebase/schemas";

export class GameService {
  private repo: GameRepository;

  constructor(loader: DataLoader) {
    this.repo = new GameRepository(loader);
  }

  async getGameById(id: string): Promise<Game | null> {
    return this.repo.findGameById(id);
  }

  async list(): Promise<{ generations: Generation[] }> {
    return this.repo.findAll();
  }
}
