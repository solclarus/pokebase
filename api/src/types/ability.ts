import { z } from "@hono/zod-openapi";
import { LocalizedNameSchema } from "@/types/pokemon";

export const AbilitySchema = z.object({
  id: z.number().int().positive(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  description: LocalizedNameSchema,
  generation: z.number().int().min(1).max(9),
}).openapi("Ability");

export type Ability = z.infer<typeof AbilitySchema>;
