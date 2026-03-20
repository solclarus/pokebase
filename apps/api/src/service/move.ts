import { MoveRepository } from "@/repository";
import type { DataLoader } from "@/repository/data-loader";
import type { Move } from "@/types";

export class MoveService {
  private repo: MoveRepository;

  constructor(loader: DataLoader) {
    this.repo = new MoveRepository(loader);
  }

  async getById(id: number): Promise<Move | null> {
    return this.repo.findById(id);
  }

  async list(): Promise<Move[]> {
    return this.repo.findAll();
  }
}
