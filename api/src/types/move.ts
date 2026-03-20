import { z } from "@hono/zod-openapi";
import { LocalizedNameSchema } from "@/types/pokemon";

export const MoveTypeSchema = z.enum([
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
]);

export const MoveCategorySchema = z.enum(["physical", "special", "status"]);

export const MoveSchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  type: MoveTypeSchema,
  category: MoveCategorySchema,
  power: z.number().int().nonnegative().nullable(),
  accuracy: z.number().int().min(0).max(100).nullable(),
  pp: z.number().int().positive(),
  generation: z.number().int().min(1).max(9),
  description: LocalizedNameSchema,
}).openapi("Move");

export type MoveType = z.infer<typeof MoveTypeSchema>;
export type MoveCategory = z.infer<typeof MoveCategorySchema>;
export type Move = z.infer<typeof MoveSchema>;
