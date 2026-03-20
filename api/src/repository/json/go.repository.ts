import type { GoPokemonRepository, CostumeRepository } from "../interface";
import type { GoPokemonStats, CostumesFile } from "../../types";
import type { DataLoader } from "./data-loader";

export class JsonGoPokemonRepository implements GoPokemonRepository {
  constructor(private loader: DataLoader) {}

  async findById(pokemonId: number): Promise<GoPokemonStats | null> {
    return this.loader.loadGoPokemon<GoPokemonStats>(pokemonId);
  }

  async findAll(): Promise<GoPokemonStats[]> {
    // In a full implementation, load from an index
    return [];
  }
}

export class JsonCostumeRepository implements CostumeRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<CostumesFile | null> {
    return this.loader.loadCostumes<CostumesFile>(pokemonId);
  }
}
