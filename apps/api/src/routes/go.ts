import { createRoute, z } from "@hono/zod-openapi";
import { createRouter, ErrorSchema } from "@/context";
import { GoPokemonDetailSchema } from "@/types";
import { GoPokemonSchema, GoMoveSchema, PokemonCostumesSchema } from "@pokebase/schemas";

export const goRoutes = createRouter();

const GoPokemonListSchema = z
  .object({
    pokemons: z.array(GoPokemonSchema.openapi("GoPokemon")),
    total: z.number(),
  })
  .openapi("GoPokemonList");

const GoMoveListSchema = z
  .object({
    moves: z.array(GoMoveSchema.openapi("GoMove")),
    total: z.number(),
  })
  .openapi("GoMoveList");

goRoutes.openapi(
  createRoute({
    method: "get",
    path: "/pokemon",
    summary: "List GO Pokemon",
    tags: ["Pokémon GO"],
    request: {
      query: z.object({
        limit: z.coerce.number().int().positive().max(100).default(20).optional(),
        offset: z.coerce.number().int().nonnegative().default(0).optional(),
      }),
    },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GoPokemonListSchema } } },
    },
  }),
  async (c) => {
    const { limit = 20, offset = 0 } = c.req.valid("query");
    const result = await c.get("goService").listPokemons(limit, offset);
    return c.json(result);
  },
);

goRoutes.openapi(
  createRoute({
    method: "get",
    path: "/pokemon/{id}",
    summary: "Get GO Pokemon by ID",
    tags: ["Pokémon GO"],
    request: {
      params: z.object({ id: z.coerce.number().int().positive().openapi({ example: 25 }) }),
    },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: GoPokemonDetailSchema } },
      },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const pokemon = await c.get("goService").getPokemonById(id);
    if (!pokemon) return c.json({ error: "Pokemon not found" }, 404);
    return c.json(pokemon, 200);
  },
);

goRoutes.openapi(
  createRoute({
    method: "get",
    path: "/pokemon/{id}/costumes",
    summary: "Get GO costumes for a Pokemon",
    tags: ["Pokémon GO"],
    request: {
      params: z.object({ id: z.coerce.number().int().positive().openapi({ example: 25 }) }),
    },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: PokemonCostumesSchema.openapi("CostumeList") } },
      },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const costumes = await c.get("costumeService").getCostumesByPokemonId(id);
    if (costumes === null) return c.json({ error: "Pokemon not found" }, 404);
    return c.json({ pokemon_id: id, costumes }, 200);
  },
);

goRoutes.openapi(
  createRoute({
    method: "get",
    path: "/moves",
    summary: "List GO moves",
    tags: ["Pokémon GO"],
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GoMoveListSchema } } },
    },
  }),
  async (c) => {
    const moves = await c.get("goService").listGoMoves();
    return c.json({ moves, total: moves.length });
  },
);

goRoutes.openapi(
  createRoute({
    method: "get",
    path: "/moves/{id}",
    summary: "Get GO move by ID",
    tags: ["Pokémon GO"],
    request: {
      params: z.object({ id: z.coerce.number().int().positive().openapi({ example: 1 }) }),
    },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: GoMoveSchema.openapi("GoMove") } },
      },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const move = await c.get("goService").getGoMoveById(id);
    if (!move) return c.json({ error: "Move not found" }, 404);
    return c.json(move, 200);
  },
);
