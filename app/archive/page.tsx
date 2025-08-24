"use client";

import { useMemo, useState } from "react";
import words from "@/data/words.json";
import type { Word } from "@/lib/types";

function normCat(c?: string) {
  return (c || "misc").toLowerCase();
}

export default function ArchivePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const all = useMemo(
    () =>
      (words as Word[]).map((w) => ({ ...w, category: normCat(w.category) })),
    []
  );

  // derive category list from data
  const categories = useMemo(() => {
    const set = new Set<string>();
    all.forEach((w) => set.add(normCat(w.category)));
    return ["all", ...Array.from(set).sort()];
  }, [all]);

  const data = useMemo(() => {
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
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {data.map((w, i) => (
          <li
            key={`${w.word}-${i}`}
            style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}
          >
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {w.word}{" "}
              <span style={{ opacity: 0.6, fontWeight: 400 }}>
                ({w.romanization})
              </span>
            </div>
            <div style={{ opacity: 0.85 }}>
              <strong style={{ textTransform: "capitalize" }}>
                {normCat(w.category)}
              </strong>{" "}
              • {w.meaning}
            </div>
            <div style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>
              “{w.example}”
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
