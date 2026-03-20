import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { apiReference } from "@scalar/hono-api-reference";
import type { Env } from "@/env";
import {
  DataLoader,
  padId,
  JsonPokemonRepository,
  JsonFormRepository,
  JsonAbilityRepository,
  JsonAvailabilityRepository,
  JsonGoPokemonRepository,
  JsonCostumeRepository,
} from "@/repository";
import { PokemonService, GoService } from "@/service";
import {
  PokemonSchema,
  FormSchema,
  FormIndexEntrySchema,
  FormTypeSchema,
  AbilitySchema,
  MoveSchema,
  AvailabilityEntrySchema,
  GoFormSchema,
  GoFormsFileSchema,
  CostumeSchema,
} from "@/types";

type Variables = {
  loader: DataLoader;
  pokemonService: PokemonService;
  goService: GoService;
};

const app = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

// Middleware
app.use("*", cors());

// OpenAPI JSON + Scalar UI (before service middleware to avoid ASSETS dependency)
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "Pokemon Data API", version: "0.1.0" },
});

app.get("/doc", apiReference({ url: "/openapi.json", pageTitle: "Pokemon Data API" }));

// Service initialization middleware
app.use("*", async (c, next) => {
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");

  const pokemonRepo = new JsonPokemonRepository(loader);
  const formRepo = new JsonFormRepository(loader);
  const abilityRepo = new JsonAbilityRepository(loader);
  const availabilityRepo = new JsonAvailabilityRepository(loader);
  const goPokemonRepo = new JsonGoPokemonRepository(loader);
  const costumeRepo = new JsonCostumeRepository(loader);

  c.set("loader", loader);
  c.set("pokemonService", new PokemonService(pokemonRepo, formRepo, availabilityRepo, abilityRepo));
  c.set("goService", new GoService(goPokemonRepo, costumeRepo));

  await next();
});

// --- Shared schemas ---

const ErrorSchema = z.object({ error: z.string() });

const PokemonDetailSchema = PokemonSchema.extend({
  forms: z.array(FormSchema),
  availability: z.array(AvailabilityEntrySchema),
});

const PokemonListSchema = z.object({
  pokemons: z.array(
    PokemonSchema.pick({ id: true, identifier: true, name: true, generation: true })
  ),
  total: z.number(),
});

const AbilityListSchema = z.object({ abilities: z.array(AbilitySchema) });

const MoveListSchema = z.object({ moves: z.array(MoveSchema) });

const FormIndexSchema = z.object({ forms: z.array(FormIndexEntrySchema), total: z.number() });

const GoPokemonListSchema = z.object({ pokemons: z.array(GoFormsFileSchema) });

const CostumeListSchema = z.object({
  pokemon_id: z.number(),
  costumes: z.array(CostumeSchema),
});

const LearnsetSchema = z.object({
  pokemon_id: z.number(),
  moves: z.array(z.unknown()),
});

const GameEntrySchema = z.object({
  id: z.string(),
  name: z.object({ ja: z.string(), en: z.string() }),
  generation: z.number(),
  release_date: z.string(),
  platform: z.string(),
});

// --- Routes ---

// Root
app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "API info",
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: z.object({ name: z.string(), version: z.string() }) } },
      },
    },
  }),
  (c) =>
    c.json({
      name: "Pokemon Data API",
      version: "0.1.0",
      endpoints: { pokemon: "/pokemon", moves: "/moves", games: "/games", abilities: "/abilities", go: "/go" },
    })
);

// Pokemon
app.openapi(
  createRoute({
    method: "get",
    path: "/pokemon",
    summary: "List Pokemon",
    tags: ["Pokemon"],
    request: {
      query: z.object({
        limit: z.coerce.number().int().positive().default(20).optional(),
        offset: z.coerce.number().int().nonnegative().default(0).optional(),
      }),
    },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: PokemonListSchema } } },
    },
  }),
  async (c) => {
    const { limit = 20, offset = 0 } = c.req.valid("query");
    const result = await c.get("pokemonService").listPokemons(limit, offset);
    return c.json(result);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/pokemon/{id}",
    summary: "Get Pokemon by ID or identifier",
    tags: ["Pokemon"],
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: PokemonDetailSchema } } },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const numId = parseInt(id, 10);
    const service = c.get("pokemonService");
    const pokemon = isNaN(numId)
      ? await service.getPokemonByIdentifier(id)
      : await service.getPokemonById(numId);
    if (!pokemon) return c.json({ error: "Pokemon not found" }, 404);
    return c.json(pokemon, 200);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/pokemon/{id}/moves",
    summary: "Get learnset for a Pokemon",
    tags: ["Pokemon"],
    request: { params: z.object({ id: z.coerce.number().int().positive() }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: LearnsetSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const loader = c.get("loader");
    const learnset = await loader.loadJson<{ pokemon_id: number; moves: unknown[] }>(
      `mainline/learnsets/${padId(id)}.json`
    );
    return c.json(learnset ?? { pokemon_id: id, moves: [] });
  }
);

// Forms
app.openapi(
  createRoute({
    method: "get",
    path: "/forms",
    summary: "List forms (filterable by form_type)",
    tags: ["Forms"],
    request: {
      query: z.object({
        form_type: FormTypeSchema.optional(),
      }),
    },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: FormIndexSchema } } },
    },
  }),
  async (c) => {
    const { form_type } = c.req.valid("query");
    const index = await c.get("loader").loadIndex<{ forms: z.infer<typeof FormIndexEntrySchema>[]; total: number }>("forms");
    const all = index?.forms ?? [];
    const forms = form_type ? all.filter(f => f.form_type === form_type) : all;
    return c.json({ forms, total: forms.length });
  }
);

// Abilities
app.openapi(
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
    const abilities = await c.get("pokemonService").listAbilities();
    return c.json({ abilities });
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/abilities/{id}",
    summary: "Get ability by ID",
    tags: ["Abilities"],
    request: { params: z.object({ id: z.coerce.number().int().positive() }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: AbilitySchema } } },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const ability = await c.get("pokemonService").getAbilityById(id);
    if (!ability) return c.json({ error: "Ability not found" }, 404);
    return c.json(ability, 200);
  }
);

// Moves
app.openapi(
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
    const index = await c.get("loader").loadIndex<{ moves: z.infer<typeof MoveSchema>[] }>("moves");
    return c.json(index ?? { moves: [] });
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/moves/{id}",
    summary: "Get move by ID",
    tags: ["Moves"],
    request: { params: z.object({ id: z.coerce.number().int().positive() }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: MoveSchema } } },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const move = await c.get("loader").loadJson<unknown>(`mainline/moves/${padId(id)}.json`);
    if (!move) return c.json({ error: "Move not found" }, 404);
    return c.json(move as z.infer<typeof MoveSchema>, 200);
  }
);

// Games
app.openapi(
  createRoute({
    method: "get",
    path: "/games",
    summary: "List games",
    tags: ["Games"],
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: z.object({ games: z.array(GameEntrySchema) }) } },
      },
    },
  }),
  async (c) => {
    const games = await c.get("loader").loadJson<{ games: z.infer<typeof GameEntrySchema>[] }>("mainline/games.json");
    return c.json(games ?? { games: [] });
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/games/{id}",
    summary: "Get game by ID",
    tags: ["Games"],
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GameEntrySchema } } },
      404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await c.get("loader").loadJson<{ games: Array<{ id: string }> }>("mainline/games.json");
    const game = data?.games.find((g) => g.id === id);
    if (!game) return c.json({ error: "Game not found" }, 404);
    return c.json(game as z.infer<typeof GameEntrySchema>, 200);
  }
);

// GO
app.openapi(
  createRoute({
    method: "get",
    path: "/go/pokemon",
    summary: "List GO Pokemon",
    tags: ["Pokémon GO"],
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GoPokemonListSchema } } },
    },
  }),
  async (c) => {
    const pokemons = await c.get("goService").listPokemons();
    return c.json({ pokemons });
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/go/pokemon/{id}",
    summary: "Get GO Pokemon by ID",
    tags: ["Pokémon GO"],
    request: { params: z.object({ id: z.coerce.number().int().positive() }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GoFormsFileSchema } } },
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

app.openapi(
  createRoute({
    method: "get",
    path: "/go/pokemon/{id}/costumes",
    summary: "Get GO costumes for a Pokemon",
    tags: ["Pokémon GO"],
    request: { params: z.object({ id: z.coerce.number().int().positive() }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: CostumeListSchema } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const costumes = await c.get("goService").getCostumesByPokemonId(id);
    return c.json({ pokemon_id: id, costumes });
  }
);

// 404 / error handlers
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
