import { Hono } from "hono";
import type { PokemonService } from "../service";

export function createMetaRoutes(service: PokemonService) {
  const app = new Hono();

  // GET /abilities - List abilities
  app.get("/", async (c) => {
    const abilities = await service.listAbilities();
    return c.json({ abilities });
  });

  // GET /abilities/:id - Get ability by id
  app.get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"), 10);

    if (isNaN(id)) {
      return c.json({ error: "Invalid ability ID" }, 400);
    }

    const ability = await service.getAbilityById(id);

    if (!ability) {
      return c.json({ error: "Ability not found" }, 404);
    }

    return c.json(ability);
  });

  return app;
}
