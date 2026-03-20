import { createRoute, z } from "@hono/zod-openapi";
import { createRouter, ErrorSchema } from "@/context";
import { DataLoader } from "@/repository";
import { PokemonService } from "@/service";
import { PokemonListItemSchema, PokemonDetailSchema } from "@/types";
import { FormIndexEntrySchema, FormTypeSchema, PokemonLearnsetSchema } from "@pokemon/schemas";

export const pokemonRoutes = createRouter();

pokemonRoutes.use("*", async (c, next) => {
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");
  c.set("pokemonService", new PokemonService(loader));
  await next();
});

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
    request: {
      query: z.object({
        limit: z.coerce.number().int().positive().default(20).optional(),
        offset: z.coerce.number().int().nonnegative().default(0).optional(),
      }),
    },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: PokemonListSchema } } },
    },
  }),
  async (c) => {
    const { limit = 20, offset = 0 } = c.req.valid("query");
    const result = await c.get("pokemonService").listPokemons(limit, offset);
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
    path: "/pokemon/{id}/moves",
    summary: "Get learnset for a Pokemon",
    tags: ["Pokemon"],
    request: {
      params: z.object({ id: z.coerce.number().int().positive().openapi({ example: 25 }) }),
    },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: PokemonLearnsetSchema.openapi("Learnset") } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const learnset = await c.get("pokemonService").getLearnsetByPokemonId(id);
    return c.json(learnset);
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
