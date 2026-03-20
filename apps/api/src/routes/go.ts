import { createRoute, z } from "@hono/zod-openapi";
import { createRouter, ErrorSchema } from "@/context";
import { DataLoader } from "@/repository";
import { GoService, CostumeService } from "@/service";
import { GoFormsFileSchema, GoPokemonDetailSchema, GoMoveSchema, CostumesFileSchema } from "@/types";

export const goRoutes = createRouter();

goRoutes.use("*", async (c, next) => {
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");
  c.set("goService", new GoService(loader));
  c.set("costumeService", new CostumeService(loader));
  await next();
});

const GoPokemonListSchema = z.object({
  pokemons: z.array(GoFormsFileSchema),
  total: z.number(),
}).openapi("GoPokemonList");

const GoMoveListSchema = z.object({
  moves: z.array(GoMoveSchema),
  total: z.number(),
}).openapi("GoMoveList");

goRoutes.openapi(
  createRoute({
    method: "get",
    path: "/pokemon",
    summary: "List GO Pokemon",
    tags: ["Pokémon GO"],
    request: {
      query: z.object({
        limit: z.coerce.number().int().positive().default(20).optional(),
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
  }
);

goRoutes.openapi(
  createRoute({
    method: "get",
    path: "/pokemon/{id}",
    summary: "Get GO Pokemon by ID",
    tags: ["Pokémon GO"],
    request: { params: z.object({ id: z.coerce.number().int().positive().openapi({ example: 25 }) }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GoPokemonDetailSchema } } },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const pokemon = await c.get("goService").getPokemonById(id);
    if (!pokemon) return c.json({ error: "Pokemon not found" }, 404);
    return c.json(pokemon, 200);
  }
);

goRoutes.openapi(
  createRoute({
    method: "get",
    path: "/pokemon/{id}/costumes",
    summary: "Get GO costumes for a Pokemon",
    tags: ["Pokémon GO"],
    request: { params: z.object({ id: z.coerce.number().int().positive().openapi({ example: 25 }) }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: CostumesFileSchema } } },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const costumes = await c.get("costumeService").getCostumesByPokemonId(id);
    if (costumes === null) return c.json({ error: "Pokemon not found" }, 404);
    return c.json({ pokemon_id: id, costumes }, 200);
  }
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
  }
);

goRoutes.openapi(
  createRoute({
    method: "get",
    path: "/moves/{id}",
    summary: "Get GO move by ID",
    tags: ["Pokémon GO"],
    request: { params: z.object({ id: z.coerce.number().int().positive().openapi({ example: 1 }) }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GoMoveSchema } } },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const move = await c.get("goService").getGoMoveById(id);
    if (!move) return c.json({ error: "Move not found" }, 404);
    return c.json(move, 200);
  }
);
