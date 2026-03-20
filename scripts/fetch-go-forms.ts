/**
 * Fetch GO base stats from pogoapi.net and generate go/forms/XXXX.json files.
 * - Stats are populated for the default form only (pogoapi.net provides per-species data)
 * - All other forms get null stats
 * - All release dates default to null
 * - Existing files are skipped to preserve manually edited data
 */

import { readdir, readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(import.meta.dirname, "../data");
const CORE_FORMS_DIR = join(DATA_DIR, "core/forms");
const GO_FORMS_DIR = join(DATA_DIR, "go/forms");

type CoreForm = {
  id: string;
};

type CoreFormsFile = {
  pokemon_id: number;
  forms: CoreForm[];
};

type PogoApiStats = {
  pokemon_id: number;
  pokemon_name: string;
  base_attack: number;
  base_defense: number;
  base_stamina: number;
};

type GoForm = {
  form_id: string;
  base_attack: number | null;
  base_defense: number | null;
  base_stamina: number | null;
  fast_move_ids: number[];
  charged_move_ids: number[];
  released_at: string | null;
  shiny_released_at: string | null;
};

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchGoStats(): Promise<Map<number, PogoApiStats>> {
  console.log("Fetching GO stats from pogoapi.net...");
  const res = await fetch("https://pogoapi.net/api/v1/pokemon_stats.json");
  if (!res.ok) throw new Error(`Failed to fetch GO stats: ${res.status}`);
  const raw = (await res.json()) as Record<string, PogoApiStats>;
  const map = new Map<number, PogoApiStats>();
  for (const entry of Object.values(raw)) {
    map.set(entry.pokemon_id, entry);
  }
  console.log(`✓ Fetched stats for ${map.size} Pokemon\n`);
  return map;
}

async function main() {
  await mkdir(GO_FORMS_DIR, { recursive: true });

  const statsMap = await fetchGoStats();

  const files = (await readdir(CORE_FORMS_DIR)).filter((f) => f.endsWith(".json")).sort();

  let created = 0;
  let skipped = 0;

  for (const file of files) {
    const outPath = join(GO_FORMS_DIR, file);

    if (await fileExists(outPath)) {
      skipped++;
      continue;
    }

    const raw = await readFile(join(CORE_FORMS_DIR, file), "utf-8");
    const coreFile: CoreFormsFile = JSON.parse(raw);
    const { pokemon_id, forms } = coreFile;

    const goStats = statsMap.get(pokemon_id);

    const goForms: GoForm[] = forms.map((form, index) => {
      const isDefault = index === 0;
      return {
        form_id: form.id,
        base_attack: isDefault && goStats ? goStats.base_attack : null,
        base_defense: isDefault && goStats ? goStats.base_defense : null,
        base_stamina: isDefault && goStats ? goStats.base_stamina : null,
        fast_move_ids: [],
        charged_move_ids: [],
        released_at: null,
        shiny_released_at: null,
      };
    });

    const output = { pokemon_id, forms: goForms };
    await writeFile(outPath, JSON.stringify(output, null, 2) + "\n");
    created++;

    if (created % 100 === 0) {
      console.log(`  ${created} files created...`);
    }
  }

  console.log(`\n✓ Done! Created: ${created}, Skipped (existing): ${skipped}`);
}

main();
