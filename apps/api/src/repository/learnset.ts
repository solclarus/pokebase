import type { PokemonLearnset } from "@pokebase/schemas";
import type { DataLoader } from "@/repository/data-loader";

export class LearnsetRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<PokemonLearnset | null> {
    return this.loader.loadLearnset(pokemonId);
  }
}
