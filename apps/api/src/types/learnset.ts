import { z } from "@hono/zod-openapi";

export const LearnMethodSchema = z.enum(["level", "tm", "egg", "tutor"]);

export const LearnsetEntrySchema = z.object({
  move_id: z.number().int().positive(),
  learn_method: LearnMethodSchema,
  level: z.number().int().nonnegative().optional(),
  tm_number: z.number().int().positive().optional(),
});

export const LearnsetFileSchema = z.object({
  pokemon_id: z.number().int().positive(),
  moves: z.array(LearnsetEntrySchema),
}).openapi("Learnset");

export type LearnMethod = z.infer<typeof LearnMethodSchema>;
export type LearnsetEntry = z.infer<typeof LearnsetEntrySchema>;
export type LearnsetFile = z.infer<typeof LearnsetFileSchema>;
