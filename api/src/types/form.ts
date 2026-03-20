import { z } from "@hono/zod-openapi";
import { LocalizedNameSchema } from "@/types/pokemon";

export const StatsSchema = z.object({
  hp: z.number().int().nonnegative(),
  attack: z.number().int().nonnegative(),
  defense: z.number().int().nonnegative(),
  sp_attack: z.number().int().nonnegative(),
  sp_defense: z.number().int().nonnegative(),
  speed: z.number().int().nonnegative(),
});

export const FormTypeSchema = z.enum([
  "normal",
  "mega",
  "gigantamax",
]);

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
}).openapi("Form");

export const FormIndexEntrySchema = z.object({
  pokemon_id: z.number().int().positive(),
  form_id: z.string(),
  form_type: FormTypeSchema,
  name: LocalizedNameSchema,
  types: z.array(z.string()).min(1).max(2),
}).openapi("FormIndexEntry");

export const FormsFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  forms: z.array(FormSchema).min(1),
});

export type Stats = z.infer<typeof StatsSchema>;
export type FormType = z.infer<typeof FormTypeSchema>;
export type Form = z.infer<typeof FormSchema>;
export type FormsFile = z.infer<typeof FormsFileSchema>;
export type FormIndexEntry = z.infer<typeof FormIndexEntrySchema>;
