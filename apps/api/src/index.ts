import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { Scalar } from "@scalar/hono-api-reference";
import type { AppEnv } from "@/context";
import { DataLoader } from "@/repository";
import { PokemonService, AbilityService, MoveService, GameService, GoService, CostumeService } from "@/service";
import { pokemonRoutes } from "@/routes/pokemon";
import { abilityRoutes } from "@/routes/ability";
import { moveRoutes } from "@/routes/move";
import { gameRoutes } from "@/routes/game";
import { goRoutes } from "@/routes/go";

const app = new OpenAPIHono<AppEnv>();

// Middleware
app.use("*", async (c, next) => {
  if (!c.env.ALLOWED_ORIGIN) {
    return c.json({ error: "Server misconfiguration: ALLOWED_ORIGIN is not set" }, 500);
  }
  await next();
});
app.use("*", (c, next) => cors({ origin: c.env.ALLOWED_ORIGIN })(c, next));
// Service DI — / /openapi.json /doc を除くすべてのルートに適用
app.use("*", async (c, next) => {
  const { pathname } = new URL(c.req.url);
  if (pathname === "/" || pathname === "/openapi.json" || pathname === "/doc") {
    return next();
  }
  const loader = new DataLoader(c.env.ASSETS, "https://assets.local");
  c.set("pokemonService", new PokemonService(loader));
  c.set("abilityService", new AbilityService(loader));
  c.set("moveService", new MoveService(loader));
  c.set("gameService", new GameService(loader));
  c.set("goService", new GoService(loader));
  c.set("costumeService", new CostumeService(loader));
  await next();
});
app.use("*", async (c, next) => {
  await next();
  const ct = c.res.headers.get("Content-Type");
  if (ct?.includes("application/json") && !ct.includes("charset")) {
    c.res.headers.set("Content-Type", "application/json; charset=UTF-8");
  }
});

// OpenAPI JSON + Scalar UI (before service middleware to avoid ASSETS dependency)
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "Pokemon Data API", version: "0.1.0" },
});

app.get("/doc", Scalar({ url: "/openapi.json", pageTitle: "Pokemon Data API" }));

// Root
app.get("/", (c) =>
  c.json({
    name: "Pokemon Data API",
    version: "0.1.0",
    endpoints: {
      pokemon: "/pokemon",
      moves: "/moves",
      games: "/games",
      abilities: "/abilities",
      go: "/go",
    },
  }),
);

// Routes
app.route("/", pokemonRoutes);
app.route("/", abilityRoutes);
app.route("/", moveRoutes);
app.route("/", gameRoutes);
app.route("/go", goRoutes);

// Error handlers
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  const url = new URL(c.req.url);
  console.error(JSON.stringify({
    name: err.name,
    message: err.message,
    stack: err.stack,
    method: c.req.method,
    path: url.pathname,
  }));
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
export type AppType = typeof app;
