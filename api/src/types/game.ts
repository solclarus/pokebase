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

export const AvailabilityTypeSchema = z.enum([
  "wild",
  "trade",
  "event",
  "transfer",
  "gift",
  "breed",
]);

export const AvailabilityEntrySchema = z.object({
  game_id: z.string(),
  availability_type: AvailabilityTypeSchema,
  notes: z.string().optional(),
});

export const AvailabilityFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  entries: z.array(AvailabilityEntrySchema),
});

export type Platform = z.infer<typeof PlatformSchema>;
export type Game = z.infer<typeof GameSchema>;
export type AvailabilityType = z.infer<typeof AvailabilityTypeSchema>;
export type AvailabilityEntry = z.infer<typeof AvailabilityEntrySchema>;
export type AvailabilityFile = z.infer<typeof AvailabilityFileSchema>;
