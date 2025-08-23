import { NextResponse } from "next/server";
import words from "@/data/words.json";

function dayOfYearUTC(d = new Date()): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const now = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  const idx = dayOfYearUTC() % (words as any[]).length;

  const word = (words as any[])[idx];
  const prev = (words as any[])[(idx - 1 + words.length) % words.length];
  const next = (words as any[])[(idx + 1) % words.length];

  return NextResponse.json({
    today: word,
    prev,
    next,
    ogImage: `/og?idx=${idx}`, // 👈 dynamic OG image
  });
}
