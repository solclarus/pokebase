import type { LearnsetFile } from "@/types";
import type { DataLoader } from "@/repository/data-loader";

export class LearnsetRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<LearnsetFile | null> {
    return this.loader.loadLearnset<LearnsetFile>(pokemonId);
  }
}
