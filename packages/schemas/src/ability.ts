import { z } from "zod";
import { LocalizedNameSchema } from "./pokemon";

export const AbilitySchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  description: LocalizedNameSchema,
  generation: z.number().int().min(1).max(9),
});

export type Ability = z.infer<typeof AbilitySchema>;
