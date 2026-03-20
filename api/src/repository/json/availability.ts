import type { AvailabilityRepository } from "@/repository/interface";
import type { AvailabilityFile } from "@/types";
import type { DataLoader } from "@/repository/json/data-loader";

export class JsonAvailabilityRepository implements AvailabilityRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<AvailabilityFile | null> {
    return this.loader.loadAvailability<AvailabilityFile>(pokemonId);
  }
}
