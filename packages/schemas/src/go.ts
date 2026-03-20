import { z } from "zod";
import { LocalizedNameSchema } from "./pokemon";
import { MoveTypeSchema } from "./move";

export const GoFormSchema = z.object({
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

export const GoPokemonSchema = z.object({
  pokemon_id: z.number().int().positive(),
  forms: z.array(GoFormSchema),
});

export const GoMoveTypeSchema = z.enum(["fast", "charged"]);

export const GoMoveSchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  type: MoveTypeSchema,
  move_type: GoMoveTypeSchema,
  power: z.number().int().nonnegative(),
  energy_delta: z.number().int(),
  duration_ms: z.number().int().positive(),
});

export type GoForm = z.infer<typeof GoFormSchema>;
export type GoPokemon = z.infer<typeof GoPokemonSchema>;
export type GoMoveType = z.infer<typeof GoMoveTypeSchema>;
export type GoMove = z.infer<typeof GoMoveSchema>;
