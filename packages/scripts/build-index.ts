import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Ability, FormIndexEntry, GoMove } from "@pokebase/schemas";

const DATA_DIR = join(import.meta.dirname, "../../data");
const INDEX_DIR = join(DATA_DIR, "_index");

type PokemonIndex = {
  id: number;
  identifier: string;
  name: { ja: string; en: string };
  generation: number;
};

type MoveIndex = {
  id: number;
  identifier: string;
  name: { ja: string; en: string };
  type: string;
};

type GoPokemonIndex = {
  pokemon_id: number;
};

async function buildPokemonIndex(): Promise<PokemonIndex[]> {
  const pokemonsDir = join(DATA_DIR, "core/pokemons");
  const files = await readdir(pokemonsDir);
  const pokemons: PokemonIndex[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const content = await readFile(join(pokemonsDir, file), "utf-8");
    const data = JSON.parse(content);

    pokemons.push({
      id: data.id,
      identifier: data.identifier,
      name: data.name,
      generation: data.generation,
    });
  }

  return pokemons.sort((a, b) => a.id - b.id);
}

async function buildFormsIndex(): Promise<FormIndexEntry[]> {
  const formsDir = join(DATA_DIR, "core/forms");
  const files = await readdir(formsDir);
  const result: FormIndexEntry[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const content = await readFile(join(formsDir, file), "utf-8");
    const data = JSON.parse(content);

    for (const form of data.forms) {
      result.push({
        pokemon_id: data.pokemon_id,
        form_id: form.id,
        form_type: form.form_type,
        name: form.name,
        types: form.types,
      });
    }
  }

  return result.sort((a, b) => a.pokemon_id - b.pokemon_id || a.form_id.localeCompare(b.form_id));
}

async function buildMoveIndex(): Promise<MoveIndex[]> {
  const movesDir = join(DATA_DIR, "mainline/moves");
  let files: string[];

  try {
    files = await readdir(movesDir);
  } catch {
    return [];
  }

  const moves: MoveIndex[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const content = await readFile(join(movesDir, file), "utf-8");
    const data = JSON.parse(content);

    moves.push({
      id: data.id,
      identifier: data.identifier,
      name: data.name,
      type: data.type,
    });
  }

  return moves.sort((a, b) => a.id - b.id);
}

async function buildAbilityIndex(): Promise<Ability[]> {
  const abilitiesDir = join(DATA_DIR, "core/abilities");
  let files: string[];
  try {
    files = await readdir(abilitiesDir);
  } catch {
    return [];
  }

  const abilities: Ability[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = await readFile(join(abilitiesDir, file), "utf-8");
    const data = JSON.parse(content);
    abilities.push({
      id: data.id,
      identifier: data.identifier,
      name: data.name,
      description: data.description,
      generation: data.generation,
    });
  }

  return abilities.sort((a, b) => a.id - b.id);
}

async function buildGoPokemonIndex(): Promise<GoPokemonIndex[]> {
  const goFormsDir = join(DATA_DIR, "go/forms");
  let files: string[];
  try {
    files = await readdir(goFormsDir);
  } catch {
    return [];
  }

  const pokemons: GoPokemonIndex[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = await readFile(join(goFormsDir, file), "utf-8");
    const data = JSON.parse(content);
    pokemons.push({ pokemon_id: data.pokemon_id });
  }

  return pokemons.sort((a, b) => a.pokemon_id - b.pokemon_id);
}

async function buildGoMoveIndex(): Promise<GoMove[]> {
  const goMovesDir = join(DATA_DIR, "go/moves");
  let files: string[];
  try {
    files = await readdir(goMovesDir);
  } catch {
    return [];
  }

  const moves: GoMove[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = await readFile(join(goMovesDir, file), "utf-8");
    const data = JSON.parse(content);
    moves.push({
      id: data.id,
      identifier: data.identifier,
      name: data.name,
      type: data.type,
      move_type: data.move_type,
      power: data.power,
      energy_delta: data.energy_delta,
      duration_ms: data.duration_ms,
    });
  }

  return moves.sort((a, b) => a.id - b.id);
}

async function main() {
  console.log("Building index files...\n");

  await mkdir(INDEX_DIR, { recursive: true });

  const pokemons = await buildPokemonIndex();
  await writeFile(
    join(INDEX_DIR, "pokemons.json"),
    JSON.stringify({ pokemons, total: pokemons.length }, null, 2),
  );
  console.log(`✓ pokemons.json (${pokemons.length} entries)`);

  const forms = await buildFormsIndex();
  await writeFile(
    join(INDEX_DIR, "forms.json"),
    JSON.stringify({ forms, total: forms.length }, null, 2),
  );
  console.log(`✓ forms.json (${forms.length} entries)`);

  const moves = await buildMoveIndex();
  await writeFile(
    join(INDEX_DIR, "moves.json"),
    JSON.stringify({ moves, total: moves.length }, null, 2),
  );
  console.log(`✓ moves.json (${moves.length} entries)`);

  const abilities = await buildAbilityIndex();
  await writeFile(
    join(INDEX_DIR, "abilities.json"),
    JSON.stringify({ abilities, total: abilities.length }, null, 2),
  );
  console.log(`✓ abilities.json (${abilities.length} entries)`);

  const goPokemons = await buildGoPokemonIndex();
  await writeFile(
    join(INDEX_DIR, "go-pokemons.json"),
    JSON.stringify({ pokemons: goPokemons, total: goPokemons.length }, null, 2),
  );
  console.log(`✓ go-pokemons.json (${goPokemons.length} entries)`);

  const goMoves = await buildGoMoveIndex();
  await writeFile(
    join(INDEX_DIR, "go-moves.json"),
    JSON.stringify({ moves: goMoves, total: goMoves.length }, null, 2),
  );
  console.log(`✓ go-moves.json (${goMoves.length} entries)`);

  console.log("\n✓ Index build complete!");
}

void main();
