import type { FormRepository } from "../interface";
import type { FormsFile } from "../../types";
import type { DataLoader } from "./data-loader";

export class JsonFormRepository implements FormRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<FormsFile | null> {
    return this.loader.loadForms<FormsFile>(pokemonId);
  }
}
