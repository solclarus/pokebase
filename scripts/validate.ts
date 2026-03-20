import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import {
  PokemonSchema,
  PokemonFormsSchema,
  AbilitySchema,
  MoveSchema,
  PokemonLearnsetSchema,
  PokemonAvailabilitySchema,
  GoPokemonSchema,
  GoMoveSchema,
  PokemonCostumesSchema,
  GamesSchema,
} from "@pokemon/schemas";

const DATA_DIR = join(import.meta.dirname, "../data");

type ValidationConfig = {
  dir: string;
  schema: z.ZodType;
};

const validationConfigs: ValidationConfig[] = [
  { dir: "core/pokemons", schema: PokemonSchema },
  { dir: "core/forms", schema: PokemonFormsSchema },
  { dir: "core/abilities", schema: AbilitySchema },
  { dir: "mainline/moves", schema: MoveSchema },
  { dir: "mainline/learnsets", schema: PokemonLearnsetSchema },
  { dir: "mainline/availability", schema: PokemonAvailabilitySchema },
  { dir: "go/forms", schema: GoPokemonSchema },
  { dir: "go/moves", schema: GoMoveSchema },
  { dir: "go/costumes", schema: PokemonCostumesSchema },
];

async function loadDir<T>(dir: string): Promise<Map<string, T>> {
  const map = new Map<string, T>();
  const dirPath = join(DATA_DIR, dir);
  let files: string[];
  try {
    files = await readdir(dirPath);
  } catch {
    return map;
  }
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const data = JSON.parse(await readFile(join(dirPath, file), "utf-8"));
    map.set(file, data);
  }
  return map;
}

async function validateDirectory(config: ValidationConfig): Promise<string[]> {
  const errors: string[] = [];
  const dirPath = join(DATA_DIR, config.dir);

  let files: string[];
  try {
    files = await readdir(dirPath);
  } catch {
    return [];
  }

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = join(dirPath, file);
    try {
      const content = await readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      const result = config.schema.safeParse(data);

      if (!result.success) {
        errors.push(`${config.dir}/${file}: ${result.error.message}`);
      }
    } catch (e) {
      errors.push(`${config.dir}/${file}: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }

  return errors;
}

async function checkReferentialIntegrity(): Promise<string[]> {
  const errors: string[] = [];

  const [coreForms, abilityFiles, goFormsFiles, goMovesFiles] = await Promise.all([
    loadDir<{ pokemon_id: number; forms: Array<{ id: string; ability_ids: number[]; hidden_ability_id?: number }> }>("core/forms"),
    loadDir<{ id: number }>("core/abilities"),
    loadDir<{ pokemon_id: number; forms: Array<{ form_id: string; fast_move_ids: number[]; charged_move_ids: number[] }> }>("go/forms"),
    loadDir<{ id: number }>("go/moves"),
  ]);

  // Build lookup sets
  const abilityIds = new Set([...abilityFiles.values()].map((a) => a.id));
  const goMoveIds = new Set([...goMovesFiles.values()].map((m) => m.id));

  // core/forms: ability_ids must exist in core/abilities
  for (const [file, data] of coreForms) {
    for (const form of data.forms) {
      for (const id of form.ability_ids) {
        if (!abilityIds.has(id)) {
          errors.push(`core/forms/${file}: form "${form.id}" references unknown ability_id ${id}`);
        }
      }
      if (form.hidden_ability_id && !abilityIds.has(form.hidden_ability_id)) {
        errors.push(`core/forms/${file}: form "${form.id}" references unknown hidden_ability_id ${form.hidden_ability_id}`);
      }
    }
  }

  // go/forms: form_id must exist in core/forms
  for (const [file, goData] of goFormsFiles) {
    const coreFile = coreForms.get(file);
    if (!coreFile) {
      errors.push(`go/forms/${file}: no matching core/forms file`);
      continue;
    }
    const coreFormIds = new Set(coreFile.forms.map((f) => f.id));
    for (const form of goData.forms) {
      if (!coreFormIds.has(form.form_id)) {
        errors.push(`go/forms/${file}: form_id "${form.form_id}" not found in core/forms`);
      }
    }
  }

  // go/forms: move_ids must exist in go/moves
  for (const [file, goData] of goFormsFiles) {
    for (const form of goData.forms) {
      for (const id of [...form.fast_move_ids, ...form.charged_move_ids]) {
        if (!goMoveIds.has(id)) {
          errors.push(`go/forms/${file}: form "${form.form_id}" references unknown go move_id ${id}`);
        }
      }
    }
  }

  return errors;
}

async function main() {
  console.log("Validating data files...\n");

  let totalErrors: string[] = [];

  for (const config of validationConfigs) {
    const errors = await validateDirectory(config);
    if (errors.length > 0) {
      totalErrors = totalErrors.concat(errors);
      console.log(`✗ ${config.dir} (${errors.length} errors)`);
    } else {
      console.log(`✓ ${config.dir}`);
    }
  }

  // Validate single files
  try {
    const gamesContent = await readFile(join(DATA_DIR, "mainline/games.json"), "utf-8");
    const gamesData = JSON.parse(gamesContent);
    const gamesResult = GamesSchema.safeParse(gamesData);
    if (!gamesResult.success) {
      totalErrors.push(`mainline/games.json: ${gamesResult.error.message}`);
      console.log("✗ mainline/games.json");
    } else {
      console.log("✓ mainline/games.json");
    }
  } catch (e) {
    totalErrors.push(`mainline/games.json: ${e instanceof Error ? e.message : "Unknown error"}`);
  }

  // Referential integrity
  console.log("\nChecking referential integrity...\n");
  const integrityErrors = await checkReferentialIntegrity();
  if (integrityErrors.length > 0) {
    totalErrors = totalErrors.concat(integrityErrors);
    console.log(`✗ ${integrityErrors.length} integrity error(s)`);
  } else {
    console.log("✓ All references valid");
  }

  if (totalErrors.length > 0) {
    console.error("\n✗ Validation failed:\n");
    for (const error of totalErrors.slice(0, 50)) {
      console.error(`  - ${error}`);
    }
    if (totalErrors.length > 50) {
      console.error(`  ... and ${totalErrors.length - 50} more`);
    }
    process.exit(1);
  }

  console.log("\n✓ All validations passed!");
}

main();
