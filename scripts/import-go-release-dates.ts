/**
 * Import GO release dates from CSV into go/forms/XXXX.json
 *
 * CSV columns: pokedex_number, name, region, implemented_date, shiny_implemented_date, id, ...
 * CSV id format: "NNNN" or "NNNN-suffix"
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(import.meta.dirname, "../data");
const GO_FORMS_DIR = join(DATA_DIR, "go/forms");
const CSV_PATH =
  "/Users/yoh/Library/CloudStorage/GoogleDrive-yokeus2000@gmail.com/マイドライブ/Pokemon Master Rows.csv";

function padId(id: number): string {
  return id.toString().padStart(4, "0");
}

// CSV suffix → our form_id (global)
const SUFFIX_MAP: Record<string, string> = {
  "": "default",
  gmax: "gigantamax",
  "gmax-rapid": "gigantamax-rapid",
  "gmax-single": "gigantamax-single",
  alolan: "alola",
  galarian: "galar",
  "galarian-zen": "galar-zen",
  hisuian: "hisui",
  paldean: "paldea",
  "paldean-aqua": "paldea-aqua",
  "paldean-blaze": "paldea-blaze",
  "paldean-combat": "paldea-combat",
};

// Per-Pokemon overrides: { pokemon_id: { csv_suffix: form_id } }
const POKEMON_SUFFIX_MAP: Record<number, Record<string, string>> = {
  550:  { blue: "blue-striped", red: "red-striped", white: "white-striped" },
  555:  { galarian: "galar-standard" },
  710:  { jumbo: "super", medium: "large" },
  711:  { jumbo: "super", medium: "large" },
  716:  { neutral: "default" },
  720:  { confined: "default" },
  774:  { meteor: "red-meteor" },
  849:  { gmax: "amped-gmax", gigantamax: "amped-gmax", low: "low-key" },
  854:  { phony: "default" },
  855:  { phony: "default" },
  877:  { "full-berry": "full-belly" },
  888:  { hero: "default", crown: "crowned" },
  889:  { hero: "default", crown: "crowned" },
  892:  { rapid: "rapid-strike", single: "single-strike", "gmax-rapid": "rapid-strike-gmax", "gmax-single": "single-strike-gmax" },
  925:  { four: "family-of-four", three: "family-of-three" },
  931:  { blue: "blue-plumage", green: "green-plumage", white: "white-plumage", yellow: "yellow-plumage" },
  982:  { two: "two-segment", three: "three-segment" },
  327:  { "1": "default", "2": "default", "3": "default", "4": "default", "5": "default", "6": "default", "7": "default", "8": "default", "9": "default" },
  999:  { chest: "default" },
  1017: { teal: "default", wellspring: "wellspring-mask", hearthflame: "hearthflame-mask", cornerstone: "cornerstone-mask" },
};

// When form_id not found, fall back to first form in go/forms
// (handles cases like Deoxys "normal", Darmanitan "standard", Frillish "male" etc.)
const FALLBACK_TO_FIRST = true;

function csvSuffixToFormId(suffix: string): string {
  return SUFFIX_MAP[suffix] ?? suffix;
}

function parseDate(val: string): string | null {
  return val.trim() === "" ? null : val.trim();
}

type CsvRow = {
  pokemonId: number;
  csvId: string;
  formId: string;
  releasedAt: string | null;
  shinyReleasedAt: string | null;
};

function parseCsv(content: string): CsvRow[] {
  const lines = content.split("\n").filter(Boolean);
  const rows: CsvRow[] = [];

  for (const line of lines.slice(1)) {
    // Handle quoted fields
    const cols: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        cols.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur);

    const pokemonId = parseInt(cols[0], 10);
    const releasedAt = parseDate(cols[3]);
    const shinyReleasedAt = parseDate(cols[4]);
    const csvId = cols[5].trim(); // e.g. "0006-mega-x"

    // Extract suffix: strip leading digits
    const suffixMatch = csvId.match(/^\d+(?:-(.+))?$/);
    if (!suffixMatch) continue;

    const suffix = suffixMatch[1] ?? "";
    const perPokemon = POKEMON_SUFFIX_MAP[pokemonId];
    const formId = perPokemon?.[suffix] ?? csvSuffixToFormId(suffix);

    rows.push({ pokemonId, csvId, formId, releasedAt, shinyReleasedAt });
  }

  return rows;
}

async function main() {
  const csv = await readFile(CSV_PATH, "utf-8");
  const rows = parseCsv(csv);

  console.log(`Parsed ${rows.length} CSV rows\n`);

  // Group by pokemonId
  const byPokemon = new Map<number, CsvRow[]>();
  for (const row of rows) {
    const list = byPokemon.get(row.pokemonId) ?? [];
    list.push(row);
    byPokemon.set(row.pokemonId, list);
  }

  let updated = 0;
  let skipped = 0;
  const unmatched: string[] = [];

  for (const [pokemonId, csvRows] of byPokemon) {
    const filePath = join(GO_FORMS_DIR, `${padId(pokemonId)}.json`);

    let data: { pokemon_id: number; forms: Array<{ form_id: string; released_at: string | null; shiny_released_at: string | null }> };
    try {
      data = JSON.parse(await readFile(filePath, "utf-8"));
    } catch {
      skipped++;
      continue;
    }

    let changed = false;
    for (const csvRow of csvRows) {
      let form = data.forms.find((f) => f.form_id === csvRow.formId);
      if (!form && FALLBACK_TO_FIRST && csvRow.formId === "default" && data.forms.length > 0) {
        // e.g. Deoxys uses "normal", Darmanitan uses "standard", Frillish uses "male"
        form = data.forms[0];
      }
      if (!form) {
        unmatched.push(`${csvRow.csvId} → form_id="${csvRow.formId}" not found in ${padId(pokemonId)}.json`);
        continue;
      }
      form.released_at = csvRow.releasedAt;
      form.shiny_released_at = csvRow.shinyReleasedAt;
      changed = true;
    }

    if (changed) {
      await writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
      updated++;
    }
  }

  console.log(`✓ Updated: ${updated} files`);
  console.log(`✓ Skipped (no go/forms file): ${skipped}`);

  if (unmatched.length > 0) {
    console.log(`\n⚠ Unmatched (${unmatched.length}):`);
    for (const u of unmatched) {
      console.log("  ", u);
    }
  } else {
    console.log("✓ All rows matched!");
  }
}

main();
