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

export const FormTypeSchema = z.enum([
  "default",
  "mega",
  "gigantamax",
  "regional",
  "special",
]);

export const FormSchema = z.object({
  id: z.string(),
  name: LocalizedNameSchema,
  form_type: FormTypeSchema,
  is_default: z.boolean(),
  types: z.array(z.string()).min(1).max(2),
  stats: StatsSchema,
  ability_ids: z.array(z.number().int().positive()),
  hidden_ability_id: z.number().int().positive().optional(),
});

export const FormsFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  forms: z.array(FormSchema).min(1),
});

export type Stats = z.infer<typeof StatsSchema>;
export type FormType = z.infer<typeof FormTypeSchema>;
export type Form = z.infer<typeof FormSchema>;
export type FormsFile = z.infer<typeof FormsFileSchema>;
