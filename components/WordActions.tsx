// components/WordActions.tsx
"use client";

import { useEffect, useState } from "react";
import type { Word } from "@/lib/wordSchema";

function speakWord(hangul: string, romanization?: string) {
  try {
    const u1 = new SpeechSynthesisUtterance(hangul);
    u1.lang = "ko-KR";
    if (romanization) {
      const u2 = new SpeechSynthesisUtterance(romanization);
      u2.lang = "en-US";
      window.speechSynthesis.cancel();
      u1.onend = () => window.speechSynthesis.speak(u2);
      window.speechSynthesis.speak(u1);
    } else {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u1);
    }
  } catch {}
}

export default function WordActions({ word }: { word: Word }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    try {
      const favs = new Set<string>(
        JSON.parse(localStorage.getItem("kajc_favs") || "[]")
      );
      setIsFav(favs.has(word.word));
    } catch {}
  }, [word.word]);

  function toggleFav() {
    try {
      const set = new Set<string>(
        JSON.parse(localStorage.getItem("kajc_favs") || "[]")
      );
      if (set.has(word.word)) {
        set.delete(word.word);
        setIsFav(false);
      } else {
        set.add(word.word);
        setIsFav(true);
      }
      localStorage.setItem("kajc_favs", JSON.stringify([...set]));
    } catch {}
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        onClick={() => speakWord(word.word, word.romanization)}
        style={{
          padding: "6px 10px",
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "white",
          cursor: "pointer",
        }}
        title="Pronounce (ko-KR), then romanization"
      >
        🔊 Speak
      </button>
      <button
        onClick={toggleFav}
        aria-pressed={isFav}
        style={{
          padding: "6px 10px",
          borderRadius: 10,
          border: isFav ? "1px solid #fb923c" : "1px solid #ddd",
          background: isFav ? "#fff7ed" : "white",
          cursor: "pointer",
        }}
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        {isFav ? "★ Favorited" : "☆ Favorite"}
      </button>
    </div>
  );
}
