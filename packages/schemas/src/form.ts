import { z } from "zod";
import { LocalizedNameSchema } from "./pokemon";

export const StatsSchema = z.object({
  hp: z.number().int().nonnegative(),
  attack: z.number().int().nonnegative(),
  defense: z.number().int().nonnegative(),
  sp_attack: z.number().int().nonnegative(),
  sp_defense: z.number().int().nonnegative(),
  speed: z.number().int().nonnegative(),
});

export const FormTypeSchema = z.enum(["normal", "mega", "gigantamax"]);

export const FormSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  name: LocalizedNameSchema,
  form_type: FormTypeSchema,
  region: z.string(),
  types: z.array(z.string()).min(1).max(2),
  stats: StatsSchema,
  ability_ids: z.array(z.number().int().positive()),
  hidden_ability_id: z.number().int().positive().optional(),
});

export const PokemonFormsSchema = z.object({
  pokemon_id: z.number().int().positive(),
  forms: z.array(FormSchema).min(1),
});

export const FormIndexEntrySchema = FormSchema.pick({
  form_type: true,
  name: true,
  types: true,
}).extend({
  pokemon_id: z.number().int().positive(),
  form_id: z.string(),
});

export type Stats = z.infer<typeof StatsSchema>;
export type FormType = z.infer<typeof FormTypeSchema>;
export type Form = z.infer<typeof FormSchema>;
export type PokemonForms = z.infer<typeof PokemonFormsSchema>;
export type FormIndexEntry = z.infer<typeof FormIndexEntrySchema>;
