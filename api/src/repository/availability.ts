import type { AvailabilityFile } from "@/types";
import type { DataLoader } from "@/repository/data-loader";

export class AvailabilityRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<AvailabilityFile | null> {
    return this.loader.loadAvailability<AvailabilityFile>(pokemonId);
  }
}
