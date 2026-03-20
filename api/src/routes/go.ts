import { Hono } from "hono";
import type { GoService } from "../service";

export function createGoRoutes(service: GoService) {
  const app = new Hono();

  // GET /go/pokemon - List GO pokemons
  app.get("/pokemon", async (c) => {
    const pokemons = await service.listPokemons();
    return c.json({ pokemons });
  });

  // GET /go/pokemon/:id - Get GO pokemon by id
  app.get("/pokemon/:id", async (c) => {
    const id = parseInt(c.req.param("id"), 10);

    if (isNaN(id)) {
      return c.json({ error: "Invalid pokemon ID" }, 400);
    }

    const pokemon = await service.getPokemonById(id);

    if (!pokemon) {
      return c.json({ error: "Pokemon not found" }, 404);
    }

    return c.json(pokemon);
  });

  // GET /go/pokemon/:id/costumes - Get GO pokemon costumes
  app.get("/pokemon/:id/costumes", async (c) => {
    const id = parseInt(c.req.param("id"), 10);

    if (isNaN(id)) {
      return c.json({ error: "Invalid pokemon ID" }, 400);
    }

    const costumes = await service.getCostumesByPokemonId(id);
    return c.json({ pokemon_id: id, costumes });
  });

  return app;
}
