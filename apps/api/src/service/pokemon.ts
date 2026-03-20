import {
  DataLoader,
  PokemonRepository,
  FormRepository,
  AvailabilityRepository,
  LearnsetRepository,
} from "@/repository";
import type { PokemonLearnset, FormIndexEntry } from "@pokemon/schemas";
import type { PokemonListItem, PokemonDetail } from "@/types";

/**
 * 本編ポケモンデータのビジネスロジック層。
 * core/（基本情報・フォルム・特性）と mainline/（技・出現情報・ゲーム）の
 * 各 Repository からデータを取得・結合して返す。
 */
export class PokemonService {
  private pokemonRepo: PokemonRepository;
  private formRepo: FormRepository;
  private availabilityRepo: AvailabilityRepository;
  private learnsetRepo: LearnsetRepository;

  constructor(loader: DataLoader) {
    this.pokemonRepo = new PokemonRepository(loader);
    this.formRepo = new FormRepository(loader);
    this.availabilityRepo = new AvailabilityRepository(loader);
    this.learnsetRepo = new LearnsetRepository(loader);
  }

  async getPokemon(id: string): Promise<PokemonDetail | null> {
    // 数値なら図鑑番号、文字列なら identifier で検索
    const numId = parseInt(id, 10);
    const pokemon = isNaN(numId)
      ? await this.pokemonRepo.findByIdentifier(id)
      : await this.pokemonRepo.findById(numId);
    if (!pokemon) return null;

    const [formsFile, availabilityFile] = await Promise.all([
      this.formRepo.findByPokemonId(pokemon.id),
      this.availabilityRepo.findByPokemonId(pokemon.id),
    ]);

    return {
      ...pokemon,
      forms: formsFile?.forms ?? [],
      availability: availabilityFile?.entries ?? [],
    };
  }

  async listPokemons(
    limit = 20,
    offset = 0,
  ): Promise<{ pokemons: PokemonListItem[]; total: number }> {
    const [pokemons, total] = await Promise.all([
      this.pokemonRepo.findAll(limit, offset),
      this.pokemonRepo.count(),
    ]);
    return { pokemons, total };
  }

  async getLearnsetByPokemonId(pokemonId: number): Promise<PokemonLearnset> {
    // ファイルが存在しない場合は空の技リストを返す（404 にしない）
    const learnset = await this.learnsetRepo.findByPokemonId(pokemonId);
    return learnset ?? { pokemon_id: pokemonId, moves: [] };
  }

  async listForms(formType?: string): Promise<{ forms: FormIndexEntry[]; total: number }> {
    const forms = await this.formRepo.findAll(formType);
    return { forms, total: forms.length };
  }
}
