import type { Pokemon, FormsFile, Ability, AvailabilityFile, GoFormsFile, CostumesFile } from "@/types";

export interface PokemonRepository {
  findById(id: number): Promise<Pokemon | null>;
  findByIdentifier(identifier: string): Promise<Pokemon | null>;
  findAll(limit?: number, offset?: number): Promise<Pokemon[]>;
  count(): Promise<number>;
}

export interface FormRepository {
  findByPokemonId(pokemonId: number): Promise<FormsFile | null>;
}

export interface AbilityRepository {
  findById(id: number): Promise<Ability | null>;
  findAll(): Promise<Ability[]>;
}

export interface AvailabilityRepository {
  findByPokemonId(pokemonId: number): Promise<AvailabilityFile | null>;
}

export interface GoPokemonRepository {
  findById(pokemonId: number): Promise<GoFormsFile | null>;
  findAll(): Promise<GoFormsFile[]>;
}

export interface CostumeRepository {
  findByPokemonId(pokemonId: number): Promise<CostumesFile | null>;
}
