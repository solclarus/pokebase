import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import type { AppEnv } from "@/context";
import { pokemonRoutes } from "@/routes/pokemon";
import { abilityRoutes } from "@/routes/ability";
import { moveRoutes } from "@/routes/move";
import { gameRoutes } from "@/routes/game";
import { goRoutes } from "@/routes/go";

const app = new OpenAPIHono<AppEnv>();

// Middleware
app.use("*", cors());
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
    endpoints: { pokemon: "/pokemon", moves: "/moves", games: "/games", abilities: "/abilities", go: "/go" },
  })
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
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
export type AppType = typeof app;
