import { createRoute, z } from "@hono/zod-openapi";
import { createRouter, ErrorSchema } from "@/context";
import { PokemonListItemSchema, PokemonDetailSchema } from "@/types";
import { FormIndexEntrySchema, FormTypeSchema } from "@pokebase/schemas";

export const pokemonRoutes = createRouter();

const PokemonListSchema = z
  .object({
    pokemons: z.array(PokemonListItemSchema),
    total: z.number(),
  })
  .openapi("PokemonList");

const FormIndexSchema = z
  .object({
    forms: z.array(FormIndexEntrySchema.openapi("FormIndexEntry")),
    total: z.number(),
  })
  .openapi("FormIndex");

pokemonRoutes.openapi(
  createRoute({
    method: "get",
    path: "/pokemon",
    summary: "List Pokemon",
    tags: ["Pokemon"],
    responses: {
      200: { description: "OK", content: { "application/json": { schema: PokemonListSchema } } },
    },
  }),
  async (c) => {
    const result = await c.get("pokemonService").listPokemons();
    return c.json(result);
  },
);

pokemonRoutes.openapi(
  createRoute({
    method: "get",
    path: "/pokemon/{id}",
    summary: "Get Pokemon by ID or identifier",
    tags: ["Pokemon"],
    request: { params: z.object({ id: z.string().openapi({ example: "25" }) }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: PokemonDetailSchema } } },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const pokemon = await c.get("pokemonService").getPokemon(id);
    if (!pokemon) return c.json({ error: "Pokemon not found" }, 404);
    return c.json(pokemon, 200);
  },
);

pokemonRoutes.openapi(
  createRoute({
    method: "get",
    path: "/forms",
    summary: "List forms (filterable by form_type)",
    tags: ["Forms"],
    request: {
      query: z.object({
        form_type: FormTypeSchema.optional(),
      }),
    },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: FormIndexSchema } } },
    },
  }),
  async (c) => {
    const { form_type } = c.req.valid("query");
    const result = await c.get("pokemonService").listForms(form_type);
    return c.json(result);
  },
);
