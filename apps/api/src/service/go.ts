import { DataLoader, GoPokemonRepository, CostumeRepository, GoMoveRepository } from "@/repository";
import type { GoFormsFile, GoPokemonDetail, GoMove } from "@/types";

/**
 * Pokémon GO データのビジネスロジック層。
 * go/forms・go/costumes・go/moves の各 Repository からデータを取得する。
 */
export class GoService {
  private goPokemonRepo: GoPokemonRepository;
  private costumeRepo: CostumeRepository;
  private goMoveRepo: GoMoveRepository;

  constructor(loader: DataLoader) {
    this.goPokemonRepo = new GoPokemonRepository(loader);
    this.costumeRepo = new CostumeRepository(loader);
    this.goMoveRepo = new GoMoveRepository(loader);
  }

  async getPokemonById(id: number): Promise<GoPokemonDetail | null> {
    const [goForms, costumesFile] = await Promise.all([
      this.goPokemonRepo.findById(id),
      this.costumeRepo.findByPokemonId(id),
    ]);
    if (!goForms) return null;
    return { ...goForms, costumes: costumesFile?.costumes ?? [] };
  }

  async listPokemons(limit = 20, offset = 0): Promise<{ pokemons: GoFormsFile[]; total: number }> {
    const [pokemons, total] = await Promise.all([
      this.goPokemonRepo.findAll(limit, offset),
      this.goPokemonRepo.count(),
    ]);
    return { pokemons, total };
  }

  async getGoMoveById(id: number): Promise<GoMove | null> {
    return this.goMoveRepo.findById(id);
  }

  async listGoMoves(): Promise<GoMove[]> {
    return this.goMoveRepo.findAll();
  }
}
