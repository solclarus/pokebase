import type { AvailabilityRepository } from "../interface";
import type { AvailabilityFile } from "../../types";
import type { DataLoader } from "./data-loader";

export class JsonAvailabilityRepository implements AvailabilityRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<AvailabilityFile | null> {
    return this.loader.loadAvailability<AvailabilityFile>(pokemonId);
  }
}
