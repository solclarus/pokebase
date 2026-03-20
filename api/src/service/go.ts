import type { GoPokemonRepository, CostumeRepository } from "@/repository";
import type { GoFormsFile, Costume } from "@/types";

export class GoService {
  constructor(
    private goPokemonRepo: GoPokemonRepository,
    private costumeRepo: CostumeRepository
  ) {}

  async getPokemonById(id: number): Promise<GoFormsFile | null> {
    return this.goPokemonRepo.findById(id);
  }

  async listPokemons(): Promise<GoFormsFile[]> {
    return this.goPokemonRepo.findAll();
  }

  async getCostumesByPokemonId(pokemonId: number): Promise<Costume[]> {
    const costumesFile = await this.costumeRepo.findByPokemonId(pokemonId);
    return costumesFile?.costumes ?? [];
  }
}
