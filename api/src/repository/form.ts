import type { FormsFile, FormIndexEntry } from "@/types";
import type { DataLoader } from "@/repository/data-loader";

export class FormRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<FormsFile | null> {
    return this.loader.loadForms<FormsFile>(pokemonId);
  }

  async findAll(formType?: string): Promise<FormIndexEntry[]> {
    const index = await this.loader.loadIndex<{ forms: FormIndexEntry[] }>("forms");
    const all = index?.forms ?? [];
    return formType ? all.filter((f) => f.form_type === formType) : all;
  }
}
