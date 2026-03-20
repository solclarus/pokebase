import { z } from "@hono/zod-openapi";

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
}).openapi("AvailabilityEntry");

export const AvailabilityFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  entries: z.array(AvailabilityEntrySchema),
});

export type AvailabilityType = z.infer<typeof AvailabilityTypeSchema>;
export type AvailabilityEntry = z.infer<typeof AvailabilityEntrySchema>;
export type AvailabilityFile = z.infer<typeof AvailabilityFileSchema>;
