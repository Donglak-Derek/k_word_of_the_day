import { NextResponse } from "next/server";
import { getAllWordsValidated } from "@/lib/words";
import type { Word } from "@/lib/wordSchema";

const words: Word[] = getAllWordsValidated();

function dayOfYearUTC(d = new Date()): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const now = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  const idx = dayOfYearUTC() % words.length;

  const word = words[idx];
  const prev = words[(idx - 1 + words.length) % words.length];
  const next = words[(idx + 1) % words.length];

  return NextResponse.json({
    today: word,
    prev,
    next,
    ogImage: `/og?idx=${idx}`, // 👈 dynamic OG image
  });
}
