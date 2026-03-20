import { AbilityRepository } from "@/repository";
import type { DataLoader } from "@/repository/data-loader";
import type { Ability } from "@/types";

export class AbilityService {
  private repo: AbilityRepository;

  constructor(loader: DataLoader) {
    this.repo = new AbilityRepository(loader);
  }

  async getById(id: number): Promise<Ability | null> {
    return this.repo.findById(id);
  }

  async list(): Promise<Ability[]> {
    return this.repo.findAll();
  }
}
