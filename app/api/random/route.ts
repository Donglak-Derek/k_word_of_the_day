import { NextResponse } from "next/server";
import { getAllWordsValidated } from "@/lib/words";
const words = getAllWordsValidated();

export async function GET() {
  const idx = Math.floor(Math.random() * (words as any[]).length);
  return NextResponse.json((words as any[])[idx]);
}
