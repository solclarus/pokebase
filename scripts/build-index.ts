import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(import.meta.dirname, "../data");
const INDEX_DIR = join(DATA_DIR, "_index");

type PokemonIndex = {
  id: number;
  identifier: string;
  name: { ja: string; en: string };
  generation: number;
};

type GameIndex = {
  id: string;
  name: { ja: string; en: string };
  generation: number;
};

type MoveIndex = {
  id: number;
  identifier: string;
  name: { ja: string; en: string };
  type: string;
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

async function buildGameIndex(): Promise<GameIndex[]> {
  const gamesFile = join(DATA_DIR, "mainline/games.json");

  try {
    const content = await readFile(gamesFile, "utf-8");
    const data = JSON.parse(content);
    return data.games || [];
  } catch {
    return [];
  }
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

async function main() {
  console.log("Building index files...\n");

  await mkdir(INDEX_DIR, { recursive: true });

  const pokemons = await buildPokemonIndex();
  await writeFile(
    join(INDEX_DIR, "pokemons.json"),
    JSON.stringify({ pokemons, total: pokemons.length }, null, 2)
  );
  console.log(`✓ pokemons.json (${pokemons.length} entries)`);

  const games = await buildGameIndex();
  await writeFile(
    join(INDEX_DIR, "games.json"),
    JSON.stringify({ games, total: games.length }, null, 2)
  );
  console.log(`✓ games.json (${games.length} entries)`);

  const moves = await buildMoveIndex();
  await writeFile(
    join(INDEX_DIR, "moves.json"),
    JSON.stringify({ moves, total: moves.length }, null, 2)
  );
  console.log(`✓ moves.json (${moves.length} entries)`);

  console.log("\n✓ Index build complete!");
}

main();
