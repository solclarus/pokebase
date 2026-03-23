import { z } from "@hono/zod-openapi";
import { PokemonSchema, FormSchema } from "@pokebase/schemas";

export const PokemonListItemSchema = PokemonSchema.pick({
  id: true,
  identifier: true,
  name: true,
  generation: true,
}).openapi("PokemonListItem");
export type PokemonListItem = z.infer<typeof PokemonListItemSchema>;

export const PokemonDetailSchema = PokemonSchema.extend({
  forms: z.array(FormSchema),
}).openapi("PokemonDetail");
export type PokemonDetail = z.infer<typeof PokemonDetailSchema>;
