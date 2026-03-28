import { z } from "zod";
import { LocalizedNameSchema } from "./pokemon";

export const PlatformSchema = z.enum(["gb", "gbc", "gba", "ds", "3ds", "switch", "switch-2"]);

export const GameSchema = z.object({
  id: z.string(),
  name: LocalizedNameSchema,
  release_date: z.string(),
  dlc_for: z.array(z.string()).optional(),
});

export const GameGroupSchema = z.object({
  id: z.string(),
  platform: PlatformSchema,
  games: z.array(GameSchema),
});

export const GenerationSchema = z.object({
  id: z.number().int().min(1).max(10),
  groups: z.array(GameGroupSchema),
});

export const GamesSchema = z.object({
  generations: z.array(GenerationSchema),
});

export type Platform = z.infer<typeof PlatformSchema>;
export type Game = z.infer<typeof GameSchema>;
export type GameGroup = z.infer<typeof GameGroupSchema>;
export type Generation = z.infer<typeof GenerationSchema>;
