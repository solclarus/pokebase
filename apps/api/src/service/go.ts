import {
  DataLoader,
  GoPokemonRepository,
  CostumeRepository,
  GoMoveRepository,
  padId,
} from "@/repository";
import type { GoPokemon, GoMove } from "@pokebase/schemas";
import type { GoPokemonDetail } from "@/types";

/**
 * Pokémon GO データのビジネスロジック層。
 * go/forms・go/costumes・go/moves の各 Repository からデータを取得する。
 */
export class GoService {
  private goPokemonRepo: GoPokemonRepository;
  private costumeRepo: CostumeRepository;
  private goMoveRepo: GoMoveRepository;
  private imagesBaseUrl: string;

  constructor(loader: DataLoader, imagesBaseUrl: string) {
    this.goPokemonRepo = new GoPokemonRepository(loader);
    this.costumeRepo = new CostumeRepository(loader);
    this.goMoveRepo = new GoMoveRepository(loader);
    this.imagesBaseUrl = imagesBaseUrl;
  }

  async getPokemonById(id: number): Promise<GoPokemonDetail | null> {
    const [goForms, costumesFile] = await Promise.all([
      this.goPokemonRepo.findById(id),
      this.costumeRepo.findByPokemonId(id),
    ]);
    if (!goForms) return null;
    const forms = goForms.forms.map((form) => ({
      ...form,
      image_url:
        form.form_id === "default"
          ? `${this.imagesBaseUrl}/normal/${padId(id)}.png`
          : `${this.imagesBaseUrl}/normal/${padId(id)}-${form.form_id}.png`,
    }));
    return { ...goForms, forms, costumes: costumesFile?.costumes ?? [] };
  }

  async listPokemons(limit = 20, offset = 0): Promise<{ pokemons: GoPokemon[]; total: number }> {
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
