"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAllWordsValidated } from "@/lib/words";
import type { Word } from "@/lib/wordSchema";
import WordListItem from "@/components/WordListItem";

function normCat(c?: string) {
  return (c || "misc").toLowerCase();
}

export default function ClientArchive() {
  const searchParams = useSearchParams();

  // pull `q` param from URL
  const qParam = searchParams.get("q") || "";
  const [q, setQ] = useState(qParam);

  // keep local state in sync if URL changes
  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  const [cat, setCat] = useState("all");

  const all = useMemo<Word[]>(() => getAllWordsValidated(), []);
  const cats = useMemo(() => {
    const s = new Set<string>();
    all.forEach((w) => s.add(normCat(w.category)));
    return ["all", ...Array.from(s).sort()];
  }, [all]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((w) => {
      const okCat = cat === "all" || normCat(w.category) === cat;
      if (!okCat) return false;
      if (!needle) return true;
      return (
        w.word.toLowerCase().includes(needle) ||
        w.romanization.toLowerCase().includes(needle) ||
        w.meaning.toLowerCase().includes(needle) ||
        w.example.toLowerCase().includes(needle)
      );
    });
  }, [all, q, cat]);

  return (
    <main>
      <h1 style={{ marginBottom: 12 }}>Archive</h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          margin: "12px 0 20px",
          flexWrap: "wrap",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search word / meaning / example"
          style={{
            flex: 1,
            minWidth: 220,
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        >
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filtered.map((w) => (
          <WordListItem key={w.id} w={w} />
        ))}
      </ul>
    </main>
  );
}
