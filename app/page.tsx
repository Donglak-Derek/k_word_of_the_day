import Link from "next/link";
import WordCard from "@/components/WordCard";
import {
  getAllWords,
  getTodayIndex,
  getWordByIndex,
} from "@/lib/getWordOfTheDay";

// Note the Promise type and async function
export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ idx?: string }>;
}) {
  const words = getAllWords();
  const len = words.length;

  // Await the params before using
  const sp = await searchParams;
  const rawIdx = Number(sp?.idx);
  const hasIdx = Number.isInteger(rawIdx);
  const todayIdx = getTodayIndex();
  const idx = hasIdx ? ((rawIdx % len) + len) % len : todayIdx;

  const word = getWordByIndex(idx);
  const prevIdx = (((idx - 1) % len) + len) % len;
  const nextIdx = (idx + 1) % len;

  return (
    <main>
      <WordCard word={word} />

      <nav style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link
          href={`/?idx=${prevIdx}`}
          style={{
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          ← Previous
        </Link>
        {!hasIdx ? (
          <span style={{ padding: "10px 14px", opacity: 0.6 }}>Today</span>
        ) : (
          <Link
            href="/"
            style={{
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 12,
            }}
          >
            Today
          </Link>
        )}
        <Link
          href={`/?idx=${nextIdx}`}
          style={{
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          Next →
        </Link>
      </nav>

      <p style={{ fontSize: 14, marginTop: 12 }}>
        Test yourself: <a href="/quiz">Daily Quiz</a>
      </p>

      <div style={{ marginTop: 10, fontSize: 14, opacity: 0.7 }}>
        Share card image: <code>/og?idx={idx}</code>
      </div>

      <footer style={{ marginTop: 24, opacity: 0.7 }}>
        <p>
          Tip: Add to Home Screen for quick access. • Built by K-AJC (Korean
          Ajusshi)
        </p>
        <p style={{ fontSize: 14 }}>
          Browse <a href="/archive">the archive</a>.
        </p>
      </footer>
    </main>
  );
}
