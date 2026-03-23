import { DataLoader, PokemonRepository, FormRepository } from "@/repository";
import type { FormIndexEntry } from "@pokebase/schemas";
import type { PokemonListItem, PokemonDetail } from "@/types";

/**
 * 本編ポケモンデータのビジネスロジック層。
 * core/（基本情報・フォルム・特性）と mainline/（技・出現情報・ゲーム）の
 * 各 Repository からデータを取得・結合して返す。
 */
export class PokemonService {
  private pokemonRepo: PokemonRepository;
  private formRepo: FormRepository;

  constructor(loader: DataLoader) {
    this.pokemonRepo = new PokemonRepository(loader);
    this.formRepo = new FormRepository(loader);
  }

  async getPokemon(id: string): Promise<PokemonDetail | null> {
    // 数値なら図鑑番号、文字列なら identifier で検索
    const numId = parseInt(id, 10);
    const pokemon = isNaN(numId)
      ? await this.pokemonRepo.findByIdentifier(id)
      : await this.pokemonRepo.findById(numId);
    if (!pokemon) return null;

    const formsFile = await this.formRepo.findByPokemonId(pokemon.id);
    const forms = formsFile?.forms ?? [];

    return { ...pokemon, forms };
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

  async listForms(formType?: string): Promise<{ forms: FormIndexEntry[]; total: number }> {
    const forms = await this.formRepo.findAll(formType);
    return { forms, total: forms.length };
  }
}
