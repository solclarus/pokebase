import { z } from "zod";

export const LocalizedNameSchema = z.object({
  ja: z.string(),
  en: z.string(),
});

export const PokemonCategorySchema = z.enum([
  "normal",
  "legendary",
  "mythical",
  "ultra-beast",
  "paradox",
]);

export const PokemonSchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  generation: z.number().int().min(1).max(10),
  category: PokemonCategorySchema,
});

export type PokemonCategory = z.infer<typeof PokemonCategorySchema>;
export type Pokemon = z.infer<typeof PokemonSchema>;
export type LocalizedName = z.infer<typeof LocalizedNameSchema>;
