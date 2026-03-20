import { Hono } from "hono";
import type { PokemonService } from "../service";

export function createPokemonRoutes(service: PokemonService) {
  const app = new Hono();

  // GET /pokemon - List pokemons
  app.get("/", async (c) => {
    const limit = parseInt(c.req.query("limit") ?? "20", 10);
    const offset = parseInt(c.req.query("offset") ?? "0", 10);

    const result = await service.listPokemons(limit, offset);
    return c.json(result);
  });

  // GET /pokemon/:id - Get pokemon by id or identifier
  app.get("/:id", async (c) => {
    const id = c.req.param("id");

    // Try parsing as number first
    const numId = parseInt(id, 10);
    const pokemon = isNaN(numId)
      ? await service.getPokemonByIdentifier(id)
      : await service.getPokemonById(numId);

    if (!pokemon) {
      return c.json({ error: "Pokemon not found" }, 404);
    }

    return c.json(pokemon);
  });

  return app;
}
