import type { Ability } from "@pokebase/schemas";
import type { DataLoader } from "@/repository/data-loader";

export class AbilityRepository {
  constructor(private loader: DataLoader) {}

  async findById(id: number): Promise<Ability | null> {
    return this.loader.loadAbility(id);
  }

  async findAll(): Promise<Ability[]> {
    const index = await this.loader.loadIndex<{ abilities: Ability[] }>("abilities");
    if (!index) throw new Error("Failed to load ability index");
    return index.abilities;
  }
}
