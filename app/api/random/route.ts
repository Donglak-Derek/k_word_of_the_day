import { NextResponse } from "next/server";
import { getAllWordsValidated } from "@/lib/words";
import type { Word } from "@/lib/wordSchema";

const words: Word[] = getAllWordsValidated();

export async function GET() {
  const idx = Math.floor(Math.random() * words.length);
  const word: Word = words[idx];
  return NextResponse.json<Word>(word, { status: 200 });
}
