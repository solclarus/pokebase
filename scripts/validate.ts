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
  name: LocalizedNameSchema,
  form_type: z.enum(["default", "mega", "gigantamax", "regional", "special"]),
  is_default: z.boolean(),
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

const GoPokemonStatsSchema = z.object({
  pokemon_id: z.number().int().positive(),
  identifier: z.string(),
  base_attack: z.number().int().nonnegative(),
  base_defense: z.number().int().nonnegative(),
  base_stamina: z.number().int().nonnegative(),
  fast_move_ids: z.array(z.number().int().positive()),
  charged_move_ids: z.array(z.number().int().positive()),
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
  schema: z.ZodSchema;
};

const validationConfigs: ValidationConfig[] = [
  { dir: "core/pokemons", schema: PokemonSchema },
  { dir: "core/forms", schema: FormsFileSchema },
  { dir: "core/abilities", schema: AbilitySchema },
  { dir: "mainline/moves", schema: MoveSchema },
  { dir: "mainline/learnsets", schema: LearnsetFileSchema },
  { dir: "mainline/availability", schema: AvailabilityFileSchema },
  { dir: "go/pokemon_stats", schema: GoPokemonStatsSchema },
  { dir: "go/costumes", schema: CostumesFileSchema },
];

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

async function main() {
  console.log("Validating data files...\n");

  let totalErrors: string[] = [];

  for (const config of validationConfigs) {
    const errors = await validateDirectory(config);
    if (errors.length > 0) {
      totalErrors = totalErrors.concat(errors);
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
    } else {
      console.log(`✓ mainline/games.json`);
    }
  } catch (e) {
    totalErrors.push(`mainline/games.json: ${e instanceof Error ? e.message : "Unknown error"}`);
  }

  if (totalErrors.length > 0) {
    console.error("\n✗ Validation failed:\n");
    for (const error of totalErrors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log("\n✓ All validations passed!");
}

main();
