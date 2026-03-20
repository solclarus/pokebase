/**
 * Fetch GO mega/primal stats from pogoapi.net and update go/forms/XXXX.json
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(import.meta.dirname, "../data");
const GO_FORMS_DIR = join(DATA_DIR, "go/forms");

function padId(id: number): string {
  return id.toString().padStart(4, "0");
}

// Pokemon-specific overrides: form_id when pogoapi "form" doesn't map cleanly
const POKEMON_FORM_MAP: Record<number, Record<string, string>> = {
  382: { Normal: "primal" }, // Primal Kyogre
  383: { Normal: "primal" }, // Primal Groudon
};

// pogoapi form value → our form_id suffix
function megaFormId(pokemonId: number, form: string): string {
  if (POKEMON_FORM_MAP[pokemonId]?.[form]) return POKEMON_FORM_MAP[pokemonId][form];
  if (form === "Normal") return "mega";
  if (form === "X") return "mega-x";
  if (form === "Y") return "mega-y";
  return `mega-${form.toLowerCase()}`;
}

type MegaEntry = {
  pokemon_id: number;
  form: string;
  stats: { base_attack: number; base_defense: number; base_stamina: number };
};

async function main() {
  const res = await fetch("https://pogoapi.net/api/v1/mega_pokemon.json");
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const megaList = (await res.json()) as MegaEntry[];

  console.log(`Fetched ${megaList.length} mega entries\n`);

  let updated = 0;
  let notFound = 0;

  for (const entry of megaList) {
    const formId = megaFormId(entry.pokemon_id, entry.form);
    const filePath = join(GO_FORMS_DIR, `${padId(entry.pokemon_id)}.json`);

    let data: { pokemon_id: number; forms: Array<Record<string, unknown>> };
    try {
      data = JSON.parse(await readFile(filePath, "utf-8"));
    } catch {
      console.log(`  ⚠ No file for pokemon ${entry.pokemon_id}`);
      notFound++;
      continue;
    }

    const form = data.forms.find((f) => f.form_id === formId);
    if (!form) {
      console.log(`  ⚠ form_id="${formId}" not found in ${padId(entry.pokemon_id)}.json`);
      notFound++;
      continue;
    }

    form.base_attack = entry.stats.base_attack;
    form.base_defense = entry.stats.base_defense;
    form.base_stamina = entry.stats.base_stamina;

    await writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`  ✓ ${padId(entry.pokemon_id)} ${formId}: ${entry.stats.base_attack}/${entry.stats.base_defense}/${entry.stats.base_stamina}`);
    updated++;
  }

  console.log(`\n✓ Updated: ${updated}, Not found: ${notFound}`);
}

main();
