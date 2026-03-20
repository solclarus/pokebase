import { CostumeRepository, GoPokemonRepository } from "@/repository";
import type { DataLoader } from "@/repository/data-loader";
import type { Costume } from "@/types";

export class CostumeService {
  private costumeRepo: CostumeRepository;
  private goPokemonRepo: GoPokemonRepository;

  constructor(loader: DataLoader) {
    this.costumeRepo = new CostumeRepository(loader);
    this.goPokemonRepo = new GoPokemonRepository(loader);
  }

  async getCostumesByPokemonId(pokemonId: number): Promise<Costume[] | null> {
    // GO に存在しないポケモンは 404 とするため、GO フォームの存在確認を行う
    const [goForms, costumesFile] = await Promise.all([
      this.goPokemonRepo.findById(pokemonId),
      this.costumeRepo.findByPokemonId(pokemonId),
    ]);
    if (!goForms) return null;
    return costumesFile?.costumes ?? [];
  }
}
