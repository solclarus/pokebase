/**
 * Fetch GO move data from pogoapi.net and:
 * 1. Save move definitions to go/moves/XXXX.json
 * 2. Update fast_move_ids / charged_move_ids in go/forms/XXXX.json
 *
 * Notes:
 * - Japanese names are left empty ("") as a placeholder
 * - Elite moves are stored separately (elite_fast_move_ids / elite_charged_move_ids)
 * - "Normal" form entry is used for default move pool; others are skipped for now
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(import.meta.dirname, "../data");
const GO_MOVES_DIR = join(DATA_DIR, "go/moves");
const GO_FORMS_DIR = join(DATA_DIR, "go/forms");

function padId(id: number): string {
  return id.toString().padStart(4, "0");
}

function toIdentifier(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type RawFastMove = {
  move_id: number;
  name: string;
  type: string;
  power: number;
  energy_delta: number;
  duration: number;
};

type RawChargedMove = {
  move_id: number;
  name: string;
  type: string;
  power: number;
  energy_delta: number;
  duration: number;
};

type RawPokemonMoves = {
  pokemon_id: number;
  form: string;
  fast_moves: string[];
  charged_moves: string[];
  elite_fast_moves: string[];
  elite_charged_moves: string[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function saveMoves(
  fastMoves: RawFastMove[],
  chargedMoves: RawChargedMove[]
): Promise<void> {
  await mkdir(GO_MOVES_DIR, { recursive: true });

  for (const move of fastMoves) {
    const out = {
      id: move.move_id,
      identifier: toIdentifier(move.name),
      name: { ja: "", en: move.name },
      type: move.type.toLowerCase(),
      move_type: "fast",
      power: move.power,
      energy_delta: move.energy_delta,
      duration_ms: move.duration,
    };
    await writeFile(
      join(GO_MOVES_DIR, `${padId(move.move_id)}.json`),
      JSON.stringify(out, null, 2) + "\n"
    );
  }

  for (const move of chargedMoves) {
    const out = {
      id: move.move_id,
      identifier: toIdentifier(move.name),
      name: { ja: "", en: move.name },
      type: move.type.toLowerCase(),
      move_type: "charged",
      power: move.power,
      energy_delta: move.energy_delta,
      duration_ms: move.duration,
    };
    await writeFile(
      join(GO_MOVES_DIR, `${padId(move.move_id)}.json`),
      JSON.stringify(out, null, 2) + "\n"
    );
  }

  console.log(`✓ Saved ${fastMoves.length} fast moves, ${chargedMoves.length} charged moves`);
}

async function updateFormMoves(
  pokemonMovesList: RawPokemonMoves[],
  fastNameToId: Map<string, number>,
  chargedNameToId: Map<string, number>
): Promise<void> {
  // Group by pokemon_id, prefer "Normal" form
  const byPokemon = new Map<number, RawPokemonMoves>();
  for (const entry of pokemonMovesList) {
    const existing = byPokemon.get(entry.pokemon_id);
    if (!existing || entry.form === "Normal") {
      byPokemon.set(entry.pokemon_id, entry);
    }
  }

  const files = (await readdir(GO_FORMS_DIR)).filter((f) => f.endsWith(".json"));
  let updated = 0;

  for (const file of files) {
    const filePath = join(GO_FORMS_DIR, file);
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    const pokemonId: number = data.pokemon_id;

    const moves = byPokemon.get(pokemonId);
    if (!moves) continue;

    const fastIds = moves.fast_moves
      .map((n) => fastNameToId.get(n))
      .filter((id): id is number => id !== undefined);
    const chargedIds = moves.charged_moves
      .map((n) => chargedNameToId.get(n))
      .filter((id): id is number => id !== undefined);
    const eliteFastIds = moves.elite_fast_moves
      .map((n) => fastNameToId.get(n))
      .filter((id): id is number => id !== undefined);
    const eliteChargedIds = moves.elite_charged_moves
      .map((n) => chargedNameToId.get(n))
      .filter((id): id is number => id !== undefined);

    // Update default form (first form) only
    data.forms[0].fast_move_ids = fastIds;
    data.forms[0].charged_move_ids = chargedIds;
    data.forms[0].elite_fast_move_ids = eliteFastIds;
    data.forms[0].elite_charged_move_ids = eliteChargedIds;

    await writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
    updated++;
  }

  console.log(`✓ Updated move IDs for ${updated} Pokemon`);
}

async function main() {
  console.log("Fetching GO move data from pogoapi.net...\n");

  const [fastMoves, chargedMoves, pokemonMovesList] = await Promise.all([
    fetchJson<RawFastMove[]>("https://pogoapi.net/api/v1/fast_moves.json"),
    fetchJson<RawChargedMove[]>("https://pogoapi.net/api/v1/charged_moves.json"),
    fetchJson<RawPokemonMoves[]>("https://pogoapi.net/api/v1/current_pokemon_moves.json"),
  ]);

  console.log(`Fetched: ${fastMoves.length} fast moves, ${chargedMoves.length} charged moves, ${pokemonMovesList.length} Pokemon move entries`);

  // Build name → id maps
  const fastNameToId = new Map(fastMoves.map((m) => [m.name, m.move_id]));
  const chargedNameToId = new Map(chargedMoves.map((m) => [m.name, m.move_id]));

  await saveMoves(fastMoves, chargedMoves);
  await updateFormMoves(pokemonMovesList, fastNameToId, chargedNameToId);

  console.log("\n✓ Done!");
}

main();
