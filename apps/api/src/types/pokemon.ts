import { z } from "@hono/zod-openapi";
import { FormSchema } from "@/types/form";
import { AvailabilityEntrySchema } from "@/types/availability";

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
}).openapi("Pokemon");

export const PokemonListItemSchema = PokemonSchema.pick({
  id: true,
  identifier: true,
  name: true,
  generation: true,
}).openapi("PokemonListItem");

/** GET /pokemon/:id のレスポンススキーマ。基本情報にフォルムと出現情報を結合したもの。 */
export const PokemonDetailSchema = PokemonSchema.extend({
  forms: z.array(FormSchema),
  availability: z.array(AvailabilityEntrySchema),
}).openapi("PokemonDetail");

export type PokemonCategory = z.infer<typeof PokemonCategorySchema>;
export type Pokemon = z.infer<typeof PokemonSchema>;
export type PokemonListItem = z.infer<typeof PokemonListItemSchema>;
export type LocalizedName = z.infer<typeof LocalizedNameSchema>;
export type PokemonDetail = z.infer<typeof PokemonDetailSchema>;
