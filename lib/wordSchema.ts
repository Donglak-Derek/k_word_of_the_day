import { z } from "zod";

export const LevelZ = z.union([
  z.enum(["beginner", "intermediate", "advanced"]),
  z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
]);

export const StatusZ = z.enum(["draft", "published", "archived"]);

export const WordZ = z.object({
  id: z.string().min(1), // stable
  slug: z.string().min(1), // usually same as id
  word: z.string().min(1), // Hangul
  romanization: z.string().min(1),
  meaning: z.string().min(1),
  example: z.string().min(1),
  category: z.string().min(1),

  // new / future-proof
  synonyms: z.array(z.string()).default([]),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  level: LevelZ.optional(),
  audio: z
    .object({
      url: z.string().url(),
      speaker: z.string().optional(),
      license: z.string().optional(),
    })
    .optional(),
  media: z
    .object({
      image: z.string(), // can be relative: /images/...
      source: z.string().optional(),
    })
    .optional(),
  relatedIds: z.array(z.string()).default([]),

  createdAt: z.string().optional(), // ISO
  updatedAt: z.string().optional(),
  status: StatusZ.default("published"),

  // optional SRS field
  srs: z
    .object({
      initialEase: z.number().optional(),
      intervals: z.array(z.number()).optional(),
    })
    .optional(),
});

export type Word = z.infer<typeof WordZ>;
