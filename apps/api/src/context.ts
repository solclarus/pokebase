import { OpenAPIHono, z } from "@hono/zod-openapi";
import type { Env } from "@/env";
import type {
  PokemonService,
  AbilityService,
  MoveService,
  GameService,
  GoService,
  CostumeService,
} from "@/service";

type Variables = {
  pokemonService: PokemonService;
  abilityService: AbilityService;
  moveService: MoveService;
  gameService: GameService;
  goService: GoService;
  costumeService: CostumeService;
};

export type AppEnv = {
  Bindings: Env;
  Variables: Variables;
};

export const ErrorSchema = z.object({ error: z.string() }).openapi("Error");

export function createRouter() {
  return new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json({ error: "Validation failed", issues: result.error.issues }, 422);
      }
    },
  });
}
