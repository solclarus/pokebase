import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env";
import {
  DataLoader,
  JsonPokemonRepository,
  JsonFormRepository,
  JsonAbilityRepository,
  JsonAvailabilityRepository,
  JsonGoPokemonRepository,
  JsonCostumeRepository,
} from "./repository";
import { PokemonService, GoService } from "./service";

type Variables = {
  pokemonService: PokemonService;
  goService: GoService;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware
app.use("*", cors());

// Service initialization middleware
app.use("*", async (c, next) => {
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");

  const pokemonRepo = new JsonPokemonRepository(loader);
  const formRepo = new JsonFormRepository(loader);
  const abilityRepo = new JsonAbilityRepository(loader);
  const availabilityRepo = new JsonAvailabilityRepository(loader);
  const goPokemonRepo = new JsonGoPokemonRepository(loader);
  const costumeRepo = new JsonCostumeRepository(loader);

  c.set("pokemonService", new PokemonService(pokemonRepo, formRepo, availabilityRepo, abilityRepo));
  c.set("goService", new GoService(goPokemonRepo, costumeRepo));

  await next();
});

// Root endpoint
app.get("/", (c) => {
  return c.json({
    name: "Pokemon Data API",
    version: "0.1.0",
    endpoints: {
      pokemon: "/pokemon",
      moves: "/moves",
      games: "/games",
      abilities: "/abilities",
      go: "/go",
    },
  });
});

// Pokemon routes
app.get("/pokemon", async (c) => {
  const service = c.get("pokemonService");
  const limit = parseInt(c.req.query("limit") ?? "20", 10);
  const offset = parseInt(c.req.query("offset") ?? "0", 10);

  const result = await service.listPokemons(limit, offset);
  return c.json(result);
});

app.get("/pokemon/:id", async (c) => {
  const service = c.get("pokemonService");
  const id = c.req.param("id");

  const numId = parseInt(id, 10);
  const pokemon = isNaN(numId)
    ? await service.getPokemonByIdentifier(id)
    : await service.getPokemonById(numId);

  if (!pokemon) {
    return c.json({ error: "Pokemon not found" }, 404);
  }

  return c.json(pokemon);
});

app.get("/pokemon/:id/moves", async (c) => {
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");
  const id = parseInt(c.req.param("id"), 10);

  if (isNaN(id)) {
    return c.json({ error: "Invalid pokemon ID" }, 400);
  }

  const learnset = await loader.loadJson<{ pokemon_id: number; moves: unknown[] }>(
    `mainline/learnsets/${id.toString().padStart(4, "0")}.json`
  );

  if (!learnset) {
    return c.json({ pokemon_id: id, moves: [] });
  }

  return c.json(learnset);
});

// Abilities routes
app.get("/abilities", async (c) => {
  const service = c.get("pokemonService");
  const abilities = await service.listAbilities();
  return c.json({ abilities });
});

app.get("/abilities/:id", async (c) => {
  const service = c.get("pokemonService");
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

// Games routes
app.get("/games", async (c) => {
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");
  const games = await loader.loadJson<{ games: unknown[] }>("mainline/games.json");
  return c.json(games ?? { games: [] });
});

// Moves routes
app.get("/moves", async (c) => {
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");
  const index = await loader.loadIndex<{ moves: unknown[] }>("moves");
  return c.json(index ?? { moves: [] });
});

app.get("/moves/:id", async (c) => {
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");
  const id = parseInt(c.req.param("id"), 10);

  if (isNaN(id)) {
    return c.json({ error: "Invalid move ID" }, 400);
  }

  const move = await loader.loadJson(`mainline/moves/${id.toString().padStart(4, "0")}.json`);

  if (!move) {
    return c.json({ error: "Move not found" }, 404);
  }

  return c.json(move);
});

app.get("/games/:id", async (c) => {
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");
  const data = await loader.loadJson<{ games: Array<{ id: string }> }>("mainline/games.json");
  const game = data?.games.find((g) => g.id === c.req.param("id"));

  if (!game) {
    return c.json({ error: "Game not found" }, 404);
  }

  return c.json(game);
});

// GO routes
app.get("/go/pokemon", async (c) => {
  const service = c.get("goService");
  const pokemons = await service.listPokemons();
  return c.json({ pokemons });
});

app.get("/go/pokemon/:id", async (c) => {
  const service = c.get("goService");
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

app.get("/go/pokemon/:id/costumes", async (c) => {
  const service = c.get("goService");
  const id = parseInt(c.req.param("id"), 10);

  if (isNaN(id)) {
    return c.json({ error: "Invalid pokemon ID" }, 400);
  }

  const costumes = await service.getCostumesByPokemonId(id);
  return c.json({ pokemon_id: id, costumes });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
