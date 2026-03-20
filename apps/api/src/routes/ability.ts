import { createRoute, z } from "@hono/zod-openapi";
import { createRouter, ErrorSchema } from "@/context";
import { AbilitySchema } from "@pokemon/schemas";

export const abilityRoutes = createRouter();

const AbilityListSchema = z
  .object({
    abilities: z.array(AbilitySchema.openapi("Ability")),
    total: z.number(),
  })
  .openapi("AbilityList");

abilityRoutes.openapi(
  createRoute({
    method: "get",
    path: "/abilities",
    summary: "List abilities",
    tags: ["Abilities"],
    responses: {
      200: { description: "OK", content: { "application/json": { schema: AbilityListSchema } } },
    },
  }),
  async (c) => {
    const abilities = await c.get("abilityService").list();
    return c.json({ abilities, total: abilities.length });
  },
);

abilityRoutes.openapi(
  createRoute({
    method: "get",
    path: "/abilities/{id}",
    summary: "Get ability by ID",
    tags: ["Abilities"],
    request: {
      params: z.object({ id: z.coerce.number().int().positive().openapi({ example: 65 }) }),
    },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: AbilitySchema.openapi("Ability") } },
      },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const ability = await c.get("abilityService").getById(id);
    if (!ability) return c.json({ error: "Ability not found" }, 404);
    return c.json(ability, 200);
  },
);
