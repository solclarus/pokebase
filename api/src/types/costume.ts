import { z } from "@hono/zod-openapi";
import { LocalizedNameSchema } from "@/types/pokemon";

export const CostumeSchema = z.object({
  costume_id: z.string(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  released_at: z.string().nullable(),
  shiny_released_at: z.string().nullable(),
}).openapi("Costume");

export const CostumesFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  costumes: z.array(CostumeSchema),
}).openapi("CostumeList");

export type Costume = z.infer<typeof CostumeSchema>;
export type CostumesFile = z.infer<typeof CostumesFileSchema>;
