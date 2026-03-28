import {
  DataLoader,
  PokemonRepository,
  FormRepository,
  GoPokemonRepository,
  CostumeRepository,
  GoMoveRepository,
  padId,
} from "@/repository";
import type { GoMove } from "@pokebase/schemas";
import type { GoPokemonDetail, GoPokemonListItem } from "@/types";

/**
 * Pokémon GO データのビジネスロジック層。
 * go/forms・go/costumes・go/moves の各 Repository からデータを取得する。
 */
export class GoService {
  private pokemonRepo: PokemonRepository;
  private formRepo: FormRepository;
  private goPokemonRepo: GoPokemonRepository;
  private costumeRepo: CostumeRepository;
  private goMoveRepo: GoMoveRepository;
  private imagesBaseUrl: string;

  constructor(loader: DataLoader, imagesBaseUrl: string) {
    this.pokemonRepo = new PokemonRepository(loader);
    this.formRepo = new FormRepository(loader);
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

  async listPokemons(
    limit = 20,
    offset = 0,
  ): Promise<{ pokemons: GoPokemonListItem[]; total: number }> {
    const [goPokemons, allPokemon, total, formIndex] = await Promise.all([
      this.goPokemonRepo.findAll(limit, offset),
      this.pokemonRepo.findAll(),
      this.goPokemonRepo.count(),
      this.formRepo.findAll(),
    ]);
    const pokemonMap = new Map(allPokemon.map((p) => [p.id, p]));
    const formNameMap = new Map(formIndex.map((f) => [`${f.pokemon_id}_${f.form_id}`, f.name]));
    const pokemons = goPokemons.map((go) => {
      const core = pokemonMap.get(go.pokemon_id);
      return {
        pokemon_id: go.pokemon_id,
        identifier: core?.identifier ?? "",
        name: core?.name ?? { ja: "", en: "" },
        generation: core?.generation ?? 0,
        forms: go.forms.map((form) => ({
          ...form,
          image_url:
            form.form_id === "default"
              ? `${this.imagesBaseUrl}/normal/${padId(go.pokemon_id)}.png`
              : `${this.imagesBaseUrl}/normal/${padId(go.pokemon_id)}-${form.form_id}.png`,
          form_name: formNameMap.get(`${go.pokemon_id}_${form.form_id}`) ??
            core?.name ?? { ja: "", en: "" },
        })),
      };
    });
    return { pokemons, total };
  }

  async getGoMoveById(id: number): Promise<GoMove | null> {
    return this.goMoveRepo.findById(id);
  }

  async listGoMoves(): Promise<GoMove[]> {
    return this.goMoveRepo.findAll();
  }
}
