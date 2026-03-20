import { z } from "zod";

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

export const PokemonAvailabilitySchema = z.object({
  pokemon_id: z.number().int().positive(),
  entries: z.array(AvailabilityEntrySchema),
});

export type AvailabilityType = z.infer<typeof AvailabilityTypeSchema>;
export type AvailabilityEntry = z.infer<typeof AvailabilityEntrySchema>;
export type PokemonAvailability = z.infer<typeof PokemonAvailabilitySchema>;
