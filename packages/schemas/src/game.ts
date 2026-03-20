import { z } from "zod";
import { LocalizedNameSchema } from "./pokemon";

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
});

export const GamesSchema = z.object({
  games: z.array(GameSchema),
});

export type Platform = z.infer<typeof PlatformSchema>;
export type Game = z.infer<typeof GameSchema>;
