import type { GoPokemonRepository, CostumeRepository } from "@/repository/interface";
import type { GoFormsFile, CostumesFile } from "@/types";
import type { DataLoader } from "@/repository/json/data-loader";

export class JsonGoPokemonRepository implements GoPokemonRepository {
  constructor(private loader: DataLoader) {}

  async findById(pokemonId: number): Promise<GoFormsFile | null> {
    return this.loader.loadGoForms<GoFormsFile>(pokemonId);
  }

  async findAll(): Promise<GoFormsFile[]> {
    return [];
  }
}

export class JsonCostumeRepository implements CostumeRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<CostumesFile | null> {
    return this.loader.loadCostumes<CostumesFile>(pokemonId);
  }
}
