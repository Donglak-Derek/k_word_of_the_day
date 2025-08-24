"use client";

import { useEffect, useMemo, useState } from "react";
import type { Word } from "@/lib/types";

type Props = { word: Word };

/* ---------- Web Speech helpers ---------- */

// Speak a single utterance in a specific language
function speakOnce(text: string, lang: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    // stop any ongoing speech so we don't overlap
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // ignore if not supported
  }
}

// Speak Hangul (ko-KR), then romanization (en-US)
function speakWord(hangul: string, romanization: string) {
  try {
    // bail out if API not available (older browsers)
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech is not supported on this browser.");
      return;
    }
    const u1 = new SpeechSynthesisUtterance(hangul);
    u1.lang = "ko-KR";
    const u2 = new SpeechSynthesisUtterance(romanization);
    u2.lang = "en-US";

    // stop any ongoing speech, then chain
    window.speechSynthesis.cancel();
    u1.onend = () => window.speechSynthesis.speak(u2);
    window.speechSynthesis.speak(u1);
  } catch {
    // ignore
  }
}

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
    } catch {
      // user canceled share
    }
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
      <header
        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <small style={{ opacity: 0.7 }}>K-AJC • Korean Word of the Day</small>

        {/* 🔊 quick access speak button in header */}
        <button
          onClick={() => speakWord(word.word, word.romanization)}
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
          aria-label="Speak pronunciation"
          title="Pronounce (ko-KR), then romanization (en-US)"
        >
          🔊 Speak
        </button>
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
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
          onClick={() => speakOnce(`${word.word}`, "ko-KR")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            cursor: "pointer",
            background: "white",
          }}
          title="Speak Hangul only (ko-KR)"
        >
          🔊 Hangul
        </button>

        <button
          onClick={() => speakOnce(`${word.romanization}`, "en-US")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            cursor: "pointer",
            background: "white",
          }}
          title="Speak romanization only (en-US)"
        >
          🔊 Rom.
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
