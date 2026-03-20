import type { AbilityRepository } from "../interface";
import type { Ability } from "../../types";
import type { DataLoader } from "./data-loader";

export class JsonAbilityRepository implements AbilityRepository {
  constructor(private loader: DataLoader) {}

  async findById(id: number): Promise<Ability | null> {
    return this.loader.loadAbility<Ability>(id);
  }

  async findAll(): Promise<Ability[]> {
    // In a full implementation, load from an abilities index
    return [];
  }
}
