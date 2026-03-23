import { createRoute, z } from "@hono/zod-openapi";
import { createRouter, ErrorSchema } from "@/context";
import { GameSchema } from "@pokebase/schemas";

export const gameRoutes = createRouter();

const GameListSchema = z.object({ games: z.array(GameSchema.openapi("Game")) }).openapi("GameList");

gameRoutes.openapi(
  createRoute({
    method: "get",
    path: "/games",
    summary: "List games",
    tags: ["Games"],
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GameListSchema } } },
    },
  }),
  async (c) => {
    const games = await c.get("gameService").list();
    return c.json({ games });
  },
);

gameRoutes.openapi(
  createRoute({
    method: "get",
    path: "/games/{id}",
    summary: "Get game by ID",
    tags: ["Games"],
    request: { params: z.object({ id: z.string().openapi({ example: "scarlet" }) }) },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: GameSchema.openapi("Game") } },
      },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const game = await c.get("gameService").getById(id);
    if (!game) return c.json({ error: "Game not found" }, 404);
    return c.json(game, 200);
  },
);
