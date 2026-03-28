import { createRoute, z } from "@hono/zod-openapi";
import { createRouter, ErrorSchema } from "@/context";
import { GameSchema, GameGroupSchema, GenerationSchema } from "@pokebase/schemas";

export const gameRoutes = createRouter();

const GamesListSchema = z
  .object({
    generations: z.array(
      GenerationSchema.extend({
        groups: z.array(GameGroupSchema.extend({ games: z.array(GameSchema) })),
      }),
    ),
  })
  .openapi("GamesList");

gameRoutes.openapi(
  createRoute({
    method: "get",
    path: "/games",
    summary: "List games",
    tags: ["Games"],
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GamesListSchema } } },
    },
  }),
  async (c) => {
    const result = await c.get("gameService").list();
    return c.json(result);
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
    const game = await c.get("gameService").getGameById(id);
    if (!game) return c.json({ error: "Game not found" }, 404);
    return c.json(game, 200);
  },
);
