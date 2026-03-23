import { GameRepository } from "@/repository";
import type { DataLoader } from "@/repository/data-loader";
import type { Game } from "@pokebase/schemas";

export class GameService {
  private repo: GameRepository;

  constructor(loader: DataLoader) {
    this.repo = new GameRepository(loader);
  }

  async getById(id: string): Promise<Game | null> {
    return this.repo.findById(id);
  }

  async list(): Promise<Game[]> {
    return this.repo.findAll();
  }
}
