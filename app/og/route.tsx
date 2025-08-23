/* @ts-ignore */
import { ImageResponse } from "@vercel/og";
import words from "@/data/words.json";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idxParam = searchParams.get("idx");
  const idx = idxParam ? parseInt(idxParam, 10) : 0;

  const word = (words as any[])[idx % words.length];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg,#111 0%,#222 100%)",
          color: "white",
          padding: 64,
          fontSize: 48,
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7 }}>
          K-AJC • Word of the Day
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, margin: "10px 0" }}>
          {word.word}
        </div>
        <div style={{ fontSize: 36 }}>
          {word.romanization} • {word.meaning}
        </div>
        <div style={{ fontSize: 28, opacity: 0.9, marginTop: 18 }}>
          “{word.example}”
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
