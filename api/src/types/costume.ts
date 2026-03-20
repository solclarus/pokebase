import { z } from "zod";
import { LocalizedNameSchema } from "@/types/pokemon";

export const CostumeSchema = z.object({
  costume_id: z.string(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  event: z.string(),
  available_from: z.string(),
  available_until: z.string().nullable(),
});

export const CostumesFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  costumes: z.array(CostumeSchema),
});

export type Costume = z.infer<typeof CostumeSchema>;
export type CostumesFile = z.infer<typeof CostumesFileSchema>;
