import type { Move } from "@/types";
import type { DataLoader } from "@/repository/data-loader";

export class MoveRepository {
  constructor(private loader: DataLoader) {}

  async findById(id: number): Promise<Move | null> {
    return this.loader.loadMove<Move>(id);
  }

  async findAll(): Promise<Move[]> {
    const index = await this.loader.loadIndex<{ moves: Move[] }>("moves");
    return index?.moves ?? [];
  }
}
