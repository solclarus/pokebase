import type { PokemonRepository, FormRepository, AvailabilityRepository, AbilityRepository } from "../repository";
import type { Pokemon, Form, AvailabilityEntry, Ability } from "../types";

export type PokemonDetail = Pokemon & {
  forms: Form[];
  availability: AvailabilityEntry[];
};

export type PokemonListItem = {
  id: number;
  identifier: string;
  name: { ja: string; en: string };
  generation: number;
};

export class PokemonService {
  constructor(
    private pokemonRepo: PokemonRepository,
    private formRepo: FormRepository,
    private availabilityRepo: AvailabilityRepository,
    private abilityRepo: AbilityRepository
  ) {}

  async getPokemonById(id: number): Promise<PokemonDetail | null> {
    const pokemon = await this.pokemonRepo.findById(id);
    if (!pokemon) return null;

    const [formsFile, availabilityFile] = await Promise.all([
      this.formRepo.findByPokemonId(id),
      this.availabilityRepo.findByPokemonId(id),
    ]);

    return {
      ...pokemon,
      forms: formsFile?.forms ?? [],
      availability: availabilityFile?.entries ?? [],
    };
  }

  async getPokemonByIdentifier(identifier: string): Promise<PokemonDetail | null> {
    const pokemon = await this.pokemonRepo.findByIdentifier(identifier);
    if (!pokemon) return null;
    return this.getPokemonById(pokemon.id);
  }

  async listPokemons(limit = 20, offset = 0): Promise<{ pokemons: PokemonListItem[]; total: number }> {
    const [pokemons, total] = await Promise.all([
      this.pokemonRepo.findAll(limit, offset),
      this.pokemonRepo.count(),
    ]);

    return {
      pokemons: pokemons.map((p) => ({
        id: p.id,
        identifier: p.identifier,
        name: p.name,
        generation: p.generation,
      })),
      total,
    };
  }

  async getAbilityById(id: number): Promise<Ability | null> {
    return this.abilityRepo.findById(id);
  }

  async listAbilities(): Promise<Ability[]> {
    return this.abilityRepo.findAll();
  }
}
