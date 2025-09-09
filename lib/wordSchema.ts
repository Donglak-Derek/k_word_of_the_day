import { z } from "zod";

/** CEFR or simple level labels */
export const LevelZ = z.union([
  z.enum(["beginner", "intermediate", "advanced"]),
  z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
]);

export const StatusZ = z.enum(["draft", "published", "archived"]);

/** Optional part-of-speech labeling (expand if you like) */
export const POSZ = z.enum([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "interjection",
  "particle",
  "postposition",
  "counter",
  "phrase",
  "expression",
  "slang",
  "idiom",
  "other",
]);

/** Bilingual example sentence (rich format). Keep single `example` string for backward-compat. */
export const ExampleZ = z.object({
  ko: z.string().min(1),
  en: z.string().min(1),
  rom: z.string().optional(), // romanization of the example, if useful
  note: z.string().optional(),
});

/** Audio/media subtypes */
export const AudioZ = z.object({
  url: z.string().url(),
  speaker: z.string().optional(),
  license: z.string().optional(),
});

export const MediaZ = z.object({
  image: z.string(), // allow relative paths like /images/...
  source: z.string().optional(),
});

/** Reference to a short-form clip (for K-LOL integration) */
export const ShortRefZ = z.object({
  id: z.string().min(1), // matches ShortClip.id
  startSec: z.number().nonnegative().optional(),
  endSec: z.number().nonnegative().optional(),
});

/** Optional SRS tuning */
export const SrsZ = z.object({
  initialEase: z.number().optional(),
  intervals: z.array(z.number()).optional(),
});

/** Main Word schema */
export const WordZ = z.object({
  id: z.string().min(1), // stable
  slug: z.string().min(1), // usually same as id
  word: z.string().min(1), // Hangul
  romanization: z.string().min(1),
  meaning: z.string().min(1),

  // Backward-compatible single example
  example: z.string().min(1),

  // New: richer bilingual examples array (optional)
  examples: z.array(ExampleZ).default([]),

  category: z.string().min(1),
  pos: POSZ.optional(),

  // Metadata / organization
  synonyms: z.array(z.string()).default([]),
  aliases: z.array(z.string()).default([]),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  level: LevelZ.optional(),

  // Media
  audio: AudioZ.optional(),
  media: MediaZ.optional(),

  // Relationships
  relatedIds: z.array(z.string()).default([]),

  // K-LOL integration
  shortId: z.string().optional(), // primary linked short
  shorts: z.array(ShortRefZ).default([]), // additional short references
  videoUrl: z.string().url().optional(), // direct video if you ever need it

  // Lifecycle
  createdAt: z.string().optional(), // ISO
  updatedAt: z.string().optional(),
  status: StatusZ.default("published"),

  // Optional SRS
  srs: SrsZ.optional(),
});

export type Level = z.infer<typeof LevelZ>;
export type Status = z.infer<typeof StatusZ>;
export type POS = z.infer<typeof POSZ>;
export type Example = z.infer<typeof ExampleZ>;
export type ShortRef = z.infer<typeof ShortRefZ>;
export type Word = z.infer<typeof WordZ>;
