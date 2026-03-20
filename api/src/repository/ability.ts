import type { Ability } from "@/types";
import type { DataLoader } from "@/repository/data-loader";

export class AbilityRepository {
  constructor(private loader: DataLoader) {}

  async findById(id: number): Promise<Ability | null> {
    return this.loader.loadAbility<Ability>(id);
  }

  async findAll(): Promise<Ability[]> {
    const index = await this.loader.loadIndex<{ abilities: Ability[] }>("abilities");
    return index?.abilities ?? [];
  }
}
