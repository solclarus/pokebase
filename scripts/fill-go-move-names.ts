/**
 * Fill Japanese names in go/moves/ by matching identifier with mainline/moves/
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(import.meta.dirname, "../data");
const GO_MOVES_DIR = join(DATA_DIR, "go/moves");
const MAINLINE_MOVES_DIR = join(DATA_DIR, "mainline/moves");

async function main() {
  // Build identifier → ja name map from mainline moves
  const mainlineFiles = (await readdir(MAINLINE_MOVES_DIR)).filter((f) => f.endsWith(".json"));
  const jaMap = new Map<string, string>();

  for (const file of mainlineFiles) {
    const data = JSON.parse(await readFile(join(MAINLINE_MOVES_DIR, file), "utf-8"));
    if (data.identifier && data.name?.ja) {
      jaMap.set(data.identifier, data.name.ja);
    }
  }

  // GO-specific identifier → ja name overrides
  // (GO variants, renamed moves, or GO-exclusive)
  const GO_OVERRIDES: Record<string, string> = {
    "futuresight":           jaMap.get("future-sight") ?? "みらいよち",
    "super-power":           jaMap.get("superpower") ?? "ちからずく",
    "weather-ball-fire":     jaMap.get("weather-ball") ?? "ウェザーボール",
    "weather-ball-ice":      jaMap.get("weather-ball") ?? "ウェザーボール",
    "weather-ball-rock":     jaMap.get("weather-ball") ?? "ウェザーボール",
    "weather-ball-water":    jaMap.get("weather-ball") ?? "ウェザーボール",
    "weather-ball-normal":   jaMap.get("weather-ball") ?? "ウェザーボール",
    "techno-blast-normal":   jaMap.get("techno-blast") ?? "テクノバスター",
    "techno-blast-burn":     jaMap.get("techno-blast") ?? "テクノバスター",
    "techno-blast-chill":    jaMap.get("techno-blast") ?? "テクノバスター",
    "techno-blast-water":    jaMap.get("techno-blast") ?? "テクノバスター",
    "techno-blast-shock":    jaMap.get("techno-blast") ?? "テクノバスター",
    "aura-wheel-electric":   jaMap.get("aura-wheel") ?? "オーラぐるま",
    "myst-fire":             jaMap.get("mystical-fire") ?? "かえんのまい",
    "wildbold-storm":        jaMap.get("wildbolt-storm") ?? "でんげきストーム",
    // GO-exclusive variants (base move name)
    "scald-blastoise":       jaMap.get("scald") ?? "ねっとう",
    "hydro-pump-blastoise":  jaMap.get("hydro-pump") ?? "ハイドロポンプ",
    "water-gun-blastoise":   jaMap.get("water-gun") ?? "みずでっぽう",
    "wrap-green":            jaMap.get("wrap") ?? "まきつく",
    "wrap-pink":             jaMap.get("wrap") ?? "まきつく",
  };
  for (const [id, ja] of Object.entries(GO_OVERRIDES)) {
    jaMap.set(id, ja);
  }

  console.log(`Loaded ${jaMap.size} mainline move names\n`);

  // Update GO moves
  const goFiles = (await readdir(GO_MOVES_DIR)).filter((f) => f.endsWith(".json"));
  let updated = 0;
  let notFound = 0;

  for (const file of goFiles) {
    const filePath = join(GO_MOVES_DIR, file);
    const data = JSON.parse(await readFile(filePath, "utf-8"));

    const ja = jaMap.get(data.identifier);
    if (ja) {
      data.name.ja = ja;
      await writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
      updated++;
    } else {
      console.log(`  ⚠ No ja name for: ${data.identifier} (id=${data.id})`);
      notFound++;
    }
  }

  console.log(`\n✓ Updated: ${updated}, Not found: ${notFound}`);
}

main();
