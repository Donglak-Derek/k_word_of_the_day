import words from "@/data/words.json";
import type { Word } from "./types";

/** day-of-year (UTC) to keep it stable across timezones */
function dayOfYearUTC(d = new Date()): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const now = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return diff; // 0..365
}

/** deterministic pick of today's word */
export function getWordOfTheDay(date = new Date()): Word {
  const idx = dayOfYearUTC(date) % words.length;
  return words[idx] as Word;
}

/** optional: get all words */
export function getAllWords(): Word[] {
  return words as Word[];
}
