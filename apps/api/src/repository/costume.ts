import type { PokemonCostumes } from "@pokemon/schemas";
import type { DataLoader } from "@/repository/data-loader";

/** GO 限定コスチューム（go/costumes/）を読み込む Repository。コスチュームを持たない種は null を返す。 */
export class CostumeRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<PokemonCostumes | null> {
    return this.loader.loadCostumes(pokemonId);
  }
}
