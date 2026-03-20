import type { PokemonForms, FormIndexEntry } from "@pokemon/schemas";
import type { DataLoader } from "@/repository/data-loader";

export class FormRepository {
  constructor(private loader: DataLoader) {}

  async findByPokemonId(pokemonId: number): Promise<PokemonForms | null> {
    return this.loader.loadForms(pokemonId);
  }

  async findAll(formType?: string): Promise<FormIndexEntry[]> {
    const index = await this.loader.loadIndex<{ forms: FormIndexEntry[] }>("forms");
    if (!index) throw new Error("Failed to load form index");
    return formType ? index.forms.filter((f) => f.form_type === formType) : index.forms;
  }
}
