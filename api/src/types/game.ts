import { z } from "@hono/zod-openapi";
import { LocalizedNameSchema } from "@/types/pokemon";

export const PlatformSchema = z.enum([
  "gb",
  "gbc",
  "gba",
  "ds",
  "3ds",
  "switch",
  "switch-2",
]);

export const GameSchema = z.object({
  id: z.string(),
  name: LocalizedNameSchema,
  generation: z.number().int().min(1).max(10),
  release_date: z.string(),
  platform: PlatformSchema,
  dlc_for: z.array(z.string()).optional(),
}).openapi("Game");

export type Platform = z.infer<typeof PlatformSchema>;
export type Game = z.infer<typeof GameSchema>;
