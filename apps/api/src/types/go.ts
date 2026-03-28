import { z } from "@hono/zod-openapi";
import {
  GoFormSchema,
  GoPokemonSchema,
  CostumeSchema,
  LocalizedNameSchema,
} from "@pokebase/schemas";

const GoFormWithImageSchema = GoFormSchema.extend({
  image_url: z.string().url(),
});

export const GoPokemonDetailSchema = GoPokemonSchema.extend({
  forms: z.array(GoFormWithImageSchema),
  costumes: z.array(CostumeSchema),
}).openapi("GoPokemonDetail");
export type GoPokemonDetail = z.infer<typeof GoPokemonDetailSchema>;

export const GoPokemonListItemSchema = z
  .object({
    pokemon_id: z.number().int().positive(),
    identifier: z.string(),
    name: LocalizedNameSchema,
    generation: z.number().int().positive(),
    forms: z.array(
      z.object({
        form_id: z.string(),
        form_name: LocalizedNameSchema,
        image_url: z.string().url(),
        released_at: z.string().nullable(),
        shiny_released_at: z.string().nullable(),
      }),
    ),
  })
  .openapi("GoPokemonListItem");
export type GoPokemonListItem = z.infer<typeof GoPokemonListItemSchema>;
