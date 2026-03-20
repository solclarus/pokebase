import { createRoute, z } from "@hono/zod-openapi";
import { createRouter, ErrorSchema } from "@/context";
import { MoveSchema } from "@pokemon/schemas";

export const moveRoutes = createRouter();

const MoveListSchema = z
  .object({
    moves: z.array(MoveSchema.openapi("Move")),
    total: z.number(),
  })
  .openapi("MoveList");

moveRoutes.openapi(
  createRoute({
    method: "get",
    path: "/moves",
    summary: "List moves",
    tags: ["Moves"],
    responses: {
      200: { description: "OK", content: { "application/json": { schema: MoveListSchema } } },
    },
  }),
  async (c) => {
    const moves = await c.get("moveService").list();
    return c.json({ moves, total: moves.length });
  },
);

moveRoutes.openapi(
  createRoute({
    method: "get",
    path: "/moves/{id}",
    summary: "Get move by ID",
    tags: ["Moves"],
    request: {
      params: z.object({ id: z.coerce.number().int().positive().openapi({ example: 52 }) }),
    },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: MoveSchema.openapi("Move") } },
      },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const move = await c.get("moveService").getById(id);
    if (!move) return c.json({ error: "Move not found" }, 404);
    return c.json(move, 200);
  },
);
