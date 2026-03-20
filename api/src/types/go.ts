import { z } from "zod";
import { LocalizedNameSchema } from "./pokemon";

export const GoPokemonStatsSchema = z.object({
  pokemon_id: z.number().int().positive(),
  identifier: z.string(),
  base_attack: z.number().int().nonnegative(),
  base_defense: z.number().int().nonnegative(),
  base_stamina: z.number().int().nonnegative(),
  fast_move_ids: z.array(z.number().int().positive()),
  charged_move_ids: z.array(z.number().int().positive()),
});

export const GoMoveTypeSchema = z.enum(["fast", "charged"]);

export const GoMoveSchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  type: z.string(),
  move_type: GoMoveTypeSchema,
  power: z.number().int().nonnegative(),
  energy_delta: z.number().int(),
  duration_ms: z.number().int().positive(),
});

export type GoPokemonStats = z.infer<typeof GoPokemonStatsSchema>;
export type GoMoveType = z.infer<typeof GoMoveTypeSchema>;
export type GoMove = z.infer<typeof GoMoveSchema>;
