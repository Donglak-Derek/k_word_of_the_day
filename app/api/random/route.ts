import { NextResponse } from "next/server";
import words from "@/data/words.json";

export async function GET() {
  const idx = Math.floor(Math.random() * (words as any[]).length);
  return NextResponse.json((words as any[])[idx]);
}
