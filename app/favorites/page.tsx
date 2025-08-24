"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import words from "@/data/words.json";
import type { Word } from "@/lib/types";

/* ---------------- helpers ---------------- */

function normalizeCategory(c?: string): string {
  return (c || "misc").toLowerCase();
}

function getStoredFavKeys(): string[] {
  try {
    return JSON.parse(localStorage.getItem("kajc_favs") || "[]") as string[];
  } catch {
    return [];
  }
}

function loadFavoriteWords(): Word[] {
  const keys = new Set(getStoredFavKeys());
  const all = (words as Word[]).map((w) => ({
    ...w,
    category: normalizeCategory(w.category),
  }));
  return all.filter((w) => keys.has(w.word));
}

function removeFavoriteKey(key: string) {
  const set = new Set(getStoredFavKeys());
  set.delete(key);
  localStorage.setItem("kajc_favs", JSON.stringify([...set]));
}

function toCsv(rows: Array<Record<string, string>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  // Escape double quotes & wrap values with quotes
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];
  // BOM for Excel UTF-8 friendliness
  return "\uFEFF" + lines.join("\n");
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------------- component ---------------- */

export default function FavoritesPage() {
  const [favs, setFavs] = useState<Word[]>([]);
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState<string>("");

  function refresh() {
    setFavs(loadFavoriteWords());
  }

  useEffect(() => {
    refresh();
  }, []);

  // Derive category list from favorites
  const categories = useMemo(() => {
    const set = new Set<string>();
    favs.forEach((w) => set.add(normalizeCategory(w.category)));
    return ["all", ...Array.from(set).sort()];
  }, [favs]);

  // Filter favorites by category + search query
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return favs.filter((w) => {
      const catOk = cat === "all" || normalizeCategory(w.category) === cat;
      if (!catOk) return false;
      if (!needle) return true;
      return (
        w.word.toLowerCase().includes(needle) ||
        w.romanization.toLowerCase().includes(needle) ||
        w.meaning.toLowerCase().includes(needle) ||
        w.example.toLowerCase().includes(needle)
      );
    });
  }, [favs, cat, q]);

  function removeFavorite(wordKey: string) {
    removeFavoriteKey(wordKey);
    refresh();
  }

  function clearAll() {
    localStorage.setItem("kajc_favs", JSON.stringify([]));
    refresh();
  }

  function exportCsv(currentOnly = true) {
    const data = (currentOnly ? filtered : favs).map((w) => ({
      word: w.word,
      romanization: w.romanization,
      meaning: w.meaning,
      example: w.example,
      category: normalizeCategory(w.category),
    }));
    const csv = toCsv(data);
    const ts = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const name = currentOnly
      ? `favorites_filtered_${ts}.csv`
      : `favorites_all_${ts}.csv`;
    download(name, csv);
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>⭐ Your Favorites</h1>

      {/* Controls */}
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search word / meaning / example..."
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

        {/* CSV export buttons */}
        <button
          onClick={() => exportCsv(true)}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
          title="Export the filtered list"
        >
          ⬇️ Export Filtered CSV
        </button>
        <button
          onClick={() => exportCsv(false)}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
          title="Export all favorites"
        >
          ⬇️ Export All CSV
        </button>

        {/* Clear all */}
        <button
          onClick={clearAll}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #fca5a5",
            background: "#fef2f2",
            cursor: "pointer",
          }}
          title="Remove all favorites"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p style={{ opacity: 0.7 }}>
          No favorites found. Try another category or search term.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filtered.map((w, i) => (
            <li
              key={`${w.word}-${i}`}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {w.word}{" "}
                  <span style={{ opacity: 0.6 }}>({w.romanization})</span>
                </div>
                <div style={{ opacity: 0.85 }}>
                  <strong style={{ textTransform: "capitalize" }}>
                    {normalizeCategory(w.category)}
                  </strong>{" "}
                  • {w.meaning}
                </div>
                <div style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>
                  “{w.example}”
                </div>
              </div>

              <button
                onClick={() => removeFavorite(w.word)}
                style={{
                  marginLeft: 16,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                ❌ Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <nav style={{ marginTop: 24 }}>
        <Link
          href="/"
          style={{
            border: "1px solid #ddd",
            padding: "8px 12px",
            borderRadius: 10,
          }}
        >
          ← Back to Word of the Day
        </Link>
      </nav>
    </main>
  );
}
