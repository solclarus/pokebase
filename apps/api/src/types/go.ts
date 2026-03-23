import { z } from "@hono/zod-openapi";
import { GoFormSchema, GoPokemonSchema, CostumeSchema } from "@pokebase/schemas";

const GoFormWithImageSchema = GoFormSchema.extend({
  image_url: z.string().url(),
});

export const GoPokemonDetailSchema = GoPokemonSchema.extend({
  forms: z.array(GoFormWithImageSchema),
  costumes: z.array(CostumeSchema),
}).openapi("GoPokemonDetail");
export type GoPokemonDetail = z.infer<typeof GoPokemonDetailSchema>;
