"use client";
import { useMemo, useState } from "react";
import words from "@/data/words.json";

export default function ArchivePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all"); // optional category later

  const data = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (words as any[]).filter((w) => {
      const okCat = cat === "all" || w.category === cat;
      if (!okCat) return false;
      if (!needle) return true;
      return (
        w.word.toLowerCase().includes(needle) ||
        w.romanization.toLowerCase().includes(needle) ||
        w.meaning.toLowerCase().includes(needle) ||
        w.example.toLowerCase().includes(needle)
      );
    });
  }, [q, cat]);

  return (
    <main>
      <h1>Archive</h1>
      <div style={{ display: "flex", gap: 12, margin: "12px 0 20px" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search word / meaning / example"
          style={{
            flex: 1,
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
          <option value="all">All</option>
          {/* add categories to your JSON if you want */}
          <option value="work">Work</option>
          <option value="slang">Slang</option>
          <option value="food">Food</option>
        </select>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {data.map((w, i) => (
          <li
            key={i}
            style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {w.word} <span style={{ opacity: 0.6 }}>({w.romanization})</span>
            </div>
            <div>{w.meaning}</div>
            <div style={{ opacity: 0.75, marginTop: 6 }}>“{w.example}”</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
