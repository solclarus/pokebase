import { z } from "@hono/zod-openapi";
import { PokemonSchema, FormSchema, AvailabilityEntrySchema } from "@pokemon/schemas";

export const PokemonListItemSchema = PokemonSchema.pick({
  id: true,
  identifier: true,
  name: true,
  generation: true,
}).openapi("PokemonListItem");
export type PokemonListItem = z.infer<typeof PokemonListItemSchema>;

const FormWithImageSchema = FormSchema.extend({
  image_url: z.string().url(),
});

export const PokemonDetailSchema = PokemonSchema.extend({
  forms: z.array(FormWithImageSchema),
  availability: z.array(AvailabilityEntrySchema),
}).openapi("PokemonDetail");
export type PokemonDetail = z.infer<typeof PokemonDetailSchema>;
