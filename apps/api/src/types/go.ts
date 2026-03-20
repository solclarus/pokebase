import { z } from "@hono/zod-openapi";
import { GoPokemonSchema, CostumeSchema } from "@pokemon/schemas";

export const GoPokemonDetailSchema = GoPokemonSchema.extend({
  costumes: z.array(CostumeSchema),
}).openapi("GoPokemonDetail");
export type GoPokemonDetail = z.infer<typeof GoPokemonDetailSchema>;
