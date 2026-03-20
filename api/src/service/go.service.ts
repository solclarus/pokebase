import type { GoPokemonRepository, CostumeRepository } from "../repository";
import type { GoPokemonStats, Costume } from "../types";

export class GoService {
  constructor(
    private goPokemonRepo: GoPokemonRepository,
    private costumeRepo: CostumeRepository
  ) {}

  async getPokemonById(id: number): Promise<GoPokemonStats | null> {
    return this.goPokemonRepo.findById(id);
  }

  async listPokemons(): Promise<GoPokemonStats[]> {
    return this.goPokemonRepo.findAll();
  }

  async getCostumesByPokemonId(pokemonId: number): Promise<Costume[]> {
    const costumesFile = await this.costumeRepo.findByPokemonId(pokemonId);
    return costumesFile?.costumes ?? [];
  }
}
