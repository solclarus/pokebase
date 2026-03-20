import type { PokemonAvailability } from "@pokemon/schemas";
import type { DataLoader } from "@/repository/data-loader";

export class AvailabilityRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<PokemonAvailability | null> {
    return this.loader.loadAvailability(pokemonId);
  }
}
