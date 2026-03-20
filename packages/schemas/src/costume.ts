import { z } from "zod";
import { LocalizedNameSchema } from "./pokemon";

export const CostumeSchema = z.object({
  costume_id: z.string(),
  identifier: z.string(),
  name: LocalizedNameSchema,
  released_at: z.string().nullable(),
  shiny_released_at: z.string().nullable(),
});

export const PokemonCostumesSchema = z.object({
  pokemon_id: z.number().int().positive(),
  costumes: z.array(CostumeSchema),
});

export type Costume = z.infer<typeof CostumeSchema>;
export type PokemonCostumes = z.infer<typeof PokemonCostumesSchema>;
