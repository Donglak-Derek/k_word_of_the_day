import { getAllWordsValidated } from "@/lib/words";
const words = getAllWordsValidated();

import type { Word } from "./types";

export function dayOfYearUTC(d = new Date()): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const now = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export function getAllWords(): Word[] {
  return words as Word[];
}

export function getTodayIndex(d = new Date()): number {
  const len = (words as any[]).length;
  return len ? dayOfYearUTC(d) % len : 0;
}

export function getWordByIndex(idx: number): Word {
  const len = (words as any[]).length;
  const i = ((idx % len) + len) % len; // normalize negatives
  return (words as any[])[i] as Word;
}
