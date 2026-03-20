import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

const DATA_DIR = join(import.meta.dirname, "../data");

// Schemas
const LocalizedNameSchema = z.object({
  ja: z.string(),
  en: z.string(),
});

const PokemonCategorySchema = z.enum([
  "normal",
  "legendary",
  "mythical",
  "ultra-beast",
  "paradox",
]);

const PokemonSchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  generation: z.number().int().min(1).max(10),
  category: PokemonCategorySchema,
});

const StatsSchema = z.object({
  hp: z.number().int().nonnegative(),
  attack: z.number().int().nonnegative(),
  defense: z.number().int().nonnegative(),
  sp_attack: z.number().int().nonnegative(),
  sp_defense: z.number().int().nonnegative(),
  speed: z.number().int().nonnegative(),
});

const FormSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  name: LocalizedNameSchema,
  form_type: z.enum(["normal", "mega", "gigantamax"]),
  region: z.string(),
  types: z.array(z.string()).min(1).max(2),
  stats: StatsSchema,
  ability_ids: z.array(z.number().int().positive()),
  hidden_ability_id: z.number().int().positive().optional(),
});

const FormsFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  forms: z.array(FormSchema).min(1),
});

const AbilitySchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  description: LocalizedNameSchema,
  generation: z.number().int().min(1).max(9),
});

const AvailabilityEntrySchema = z.object({
  game_id: z.string(),
  availability_type: z.enum(["wild", "trade", "event", "transfer", "gift", "breed"]),
  notes: z.string().optional(),
});

const AvailabilityFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  entries: z.array(AvailabilityEntrySchema),
});

const GoFormSchema = z.object({
  form_id: z.string(),
  base_attack: z.number().int().nonnegative().nullable(),
  base_defense: z.number().int().nonnegative().nullable(),
  base_stamina: z.number().int().nonnegative().nullable(),
  fast_move_ids: z.array(z.number().int().positive()),
  charged_move_ids: z.array(z.number().int().positive()),
  elite_fast_move_ids: z.array(z.number().int().positive()),
  elite_charged_move_ids: z.array(z.number().int().positive()),
  released_at: z.string().nullable(),
  shiny_released_at: z.string().nullable(),
});

const GoFormsFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  forms: z.array(GoFormSchema).min(1),
});

const GoMoveTypeSchema = z.enum(["fast", "charged"]);

const GoMoveSchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  type: z.string(),
  move_type: GoMoveTypeSchema,
  power: z.number().int().nonnegative(),
  energy_delta: z.number().int(),
  duration_ms: z.number().int().positive(),
});

const CostumeSchema = z.object({
  costume_id: z.string(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  event: z.string(),
  available_from: z.string(),
  available_until: z.string().nullable(),
});

const CostumesFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  costumes: z.array(CostumeSchema),
});

const MoveSchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  type: z.string(),
  category: z.enum(["physical", "special", "status"]),
  power: z.number().int().nonnegative().nullable(),
  accuracy: z.number().int().min(0).max(100).nullable(),
  pp: z.number().int().positive(),
  generation: z.number().int().min(1).max(9),
  description: LocalizedNameSchema,
});

const LearnsetEntrySchema = z.object({
  move_id: z.number().int().positive(),
  learn_method: z.enum(["level", "tm", "hm", "tutor", "egg", "event"]),
  level: z.number().int().nonnegative().optional(),
  tm_number: z.number().int().positive().optional(),
});

const LearnsetFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  moves: z.array(LearnsetEntrySchema),
});

const PlatformSchema = z.enum([
  "gb",
  "gbc",
  "gba",
  "ds",
  "3ds",
  "switch",
  "switch-2",
]);

const GameSchema = z.object({
  id: z.string(),
  name: LocalizedNameSchema,
  generation: z.number().int().min(1).max(10),
  release_date: z.string(),
  platform: PlatformSchema,
  dlc_for: z.array(z.string()).optional(),
});

const GamesFileSchema = z.object({
  games: z.array(GameSchema),
});

type ValidationConfig = {
  dir: string;
  schema: z.ZodType;
};

const validationConfigs: ValidationConfig[] = [
  { dir: "core/pokemons", schema: PokemonSchema },
  { dir: "core/forms", schema: FormsFileSchema },
  { dir: "core/abilities", schema: AbilitySchema },
  { dir: "mainline/moves", schema: MoveSchema },
  { dir: "mainline/learnsets", schema: LearnsetFileSchema },
  { dir: "mainline/availability", schema: AvailabilityFileSchema },
  { dir: "go/forms", schema: GoFormsFileSchema },
  { dir: "go/moves", schema: GoMoveSchema },
  { dir: "go/costumes", schema: CostumesFileSchema },
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
    loadDir<{ pokemon_id: number; forms: Array<{ form_id: string }> }>("go/forms"),
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
    const gamesResult = GamesFileSchema.safeParse(gamesData);
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
