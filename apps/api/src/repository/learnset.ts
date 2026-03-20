import type { PokemonLearnset } from "@pokemon/schemas";
import type { DataLoader } from "@/repository/data-loader";

export class LearnsetRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<PokemonLearnset | null> {
    return this.loader.loadLearnset(pokemonId);
  }
}
