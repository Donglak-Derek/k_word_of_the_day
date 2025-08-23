"use client";

import { useEffect, useMemo, useState } from "react";
import type { Word } from "@/lib/types";

type Props = { word: Word };

export default function WordCard({ word }: Props) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(
        localStorage.getItem("kajc_favs") || "[]"
      ) as string[];
      setIsFav(favs.includes(word.word));
    } catch {}
  }, [word.word]);

  function toggleFav() {
    try {
      const favs = new Set(
        JSON.parse(localStorage.getItem("kajc_favs") || "[]") as string[]
      );
      if (favs.has(word.word)) {
        favs.delete(word.word);
        setIsFav(false);
      } else {
        favs.add(word.word);
        setIsFav(true);
      }
      localStorage.setItem("kajc_favs", JSON.stringify([...favs]));
    } catch {}
  }

  const shareText = useMemo(
    () =>
      `오늘의 단어 (Today's word): ${word.word} (${word.romanization}) — ${word.meaning}\nExample: ${word.example}\n#KAJC #KoreanWordOfTheDay`,
    [word]
  );

  async function share() {
    const shareData = {
      title: "K-AJC Word of the Day",
      text: shareText,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareData.url}`);
        alert("Copied to clipboard!");
      }
    } catch {}
  }

  return (
    <article
      style={{
        borderRadius: 16,
        border: "1px solid #eee",
        padding: 24,
        boxShadow: "0 6px 30px rgba(0,0,0,0.05)",
      }}
    >
      <header style={{ marginBottom: 12 }}>
        <small style={{ opacity: 0.7 }}>K-AJC • Korean Word of the Day</small>
      </header>

      {/* MAIN CONTENT */}
      <h1 style={{ fontSize: 42, margin: "6px 0" }}>{word.word}</h1>
      <div style={{ fontSize: 16, opacity: 0.8, marginBottom: 12 }}>
        {word.romanization} • <strong>{word.meaning}</strong>
      </div>
      <p style={{ fontSize: 18, lineHeight: 1.5, marginBottom: 18 }}>
        “{word.example}”
      </p>

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={share}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            cursor: "pointer",
            background: "white",
          }}
        >
          Share
        </button>
        <button
          onClick={toggleFav}
          aria-pressed={isFav}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: isFav ? "1px solid #fb923c" : "1px solid #ddd",
            cursor: "pointer",
            background: isFav ? "#fff7ed" : "white",
          }}
        >
          {isFav ? "★ Favorited" : "☆ Favorite"}
        </button>
      </div>
    </article>
  );
}
