"use client";

import { useEffect, useMemo, useState } from "react";
import words from "@/data/words.json";
import { dayOfYearUTC, getTodayIndex } from "@/lib/getWordOfTheDay";
import type { Word } from "@/lib/types";

/* ---------- utilities ---------- */

// UTC date key (one per day for everyone)
function utcDateKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Simple seedable PRNG (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher–Yates shuffle with seed
function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick k unique indices from [0..len-1], excluding `exclude`, seeded
function pickUniqueIndices(
  len: number,
  k: number,
  exclude: Set<number>,
  seed: number
): number[] {
  const pool: number[] = [];
  for (let i = 0; i < len; i++) if (!exclude.has(i)) pool.push(i);
  const shuffled = shuffleSeeded(pool, seed);
  return shuffled.slice(0, k);
}

/* ---------- speech helpers ---------- */

function speakOnce(text: string, lang: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.cancel(); // stop any previous speech
    window.speechSynthesis.speak(u);
  } catch {
    // ignore if unsupported
  }
}

// Speak Hangul (ko-KR), then romanization (en-US)
function speakWord(hangul: string, romanization: string) {
  // chain two utterances for clearer learning
  try {
    const u1 = new SpeechSynthesisUtterance(hangul);
    u1.lang = "ko-KR";
    const u2 = new SpeechSynthesisUtterance(romanization);
    u2.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u1);
    // when first ends, speak the romanization
    u1.onend = () => window.speechSynthesis.speak(u2);
  } catch {}
}

/* ---------- component ---------- */

export default function Quiz() {
  const all = words as Word[];
  const len = all.length;
  const todayIdx = getTodayIndex();
  const today = all[todayIdx];

  // Build options using seeded randomness (stable for this day)
  const { options, correctIndex } = useMemo(() => {
    const seed = dayOfYearUTC(); // change daily
    const exclude = new Set<number>([todayIdx]);

    // pick two *random but stable* distractors
    const [d1, d2] = pickUniqueIndices(len, 2, exclude, seed);

    const raw = [
      { label: all[todayIdx].meaning, correct: true },
      { label: all[d1].meaning, correct: false },
      { label: all[d2].meaning, correct: false },
    ];

    const shuffled = shuffleSeeded(raw, seed + 999);
    const correctIndex = shuffled.findIndex((o) => o.correct);
    return { options: shuffled, correctIndex };
  }, [len, all, todayIdx]);

  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [streak, setStreak] = useState<number>(0);
  const [lastDay, setLastDay] = useState<string | null>(null);

  // Load streak on mount
  useEffect(() => {
    try {
      const s = Number(localStorage.getItem("kajc_quiz_streak") || "0");
      const last = localStorage.getItem("kajc_quiz_last") || null;
      setStreak(Number.isFinite(s) ? s : 0);
      setLastDay(last);
    } catch {}
  }, []);

  // Confetti (lazy-loaded)
  async function confettiBurst(particleCount = 90, spread = 75) {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount, spread, origin: { y: 0.6 } });
    } catch {}
  }

  function submit(i: number) {
    setSelected(i);
    const ok = i === correctIndex;
    setResult(ok ? "correct" : "wrong");

    if (ok) {
      const todayKey = utcDateKey();
      if (lastDay !== todayKey) {
        const next = streak + 1;
        setStreak(next);
        setLastDay(todayKey);
        try {
          localStorage.setItem("kajc_quiz_streak", String(next));
          localStorage.setItem("kajc_quiz_last", todayKey);
        } catch {}

        // 🎉 extra burst on multiples of 5
        if (next % 5 === 0) {
          confettiBurst(200, 90); // bigger celebration
        } else {
          confettiBurst(90, 75);
        }
      } else {
        // already counted today, still give a small burst
        confettiBurst(70, 60);
      }
    }
  }

  function resetStreak() {
    setStreak(0);
    setLastDay(null);
    try {
      localStorage.setItem("kajc_quiz_streak", "0");
      localStorage.removeItem("kajc_quiz_last");
    } catch {}
  }

  return (
    <section
      style={{
        borderRadius: 16,
        border: "1px solid #eee",
        padding: 24,
        boxShadow: "0 6px 30px rgba(0,0,0,0.05)",
      }}
    >
      <header
        style={{
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <small style={{ opacity: 0.7 }}>
          Daily Quiz • Day {dayOfYearUTC() + 1}
        </small>
        {/* 🔊 Speak button */}
        <button
          onClick={() => speakWord(today.word, today.romanization)}
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
      </header>

      <h1 style={{ fontSize: 36, margin: "6px 0" }}>{today.word}</h1>
      <div style={{ fontSize: 16, opacity: 0.8, marginBottom: 12 }}>
        {today.romanization}
      </div>

      <p style={{ fontSize: 16, opacity: 0.9, margin: "6px 0 16px" }}>
        What does this word mean?
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = result !== "idle" && i === correctIndex;
          const showWrong =
            result === "wrong" && isSelected && i !== correctIndex;
          const border = showCorrect
            ? "#16a34a"
            : showWrong
            ? "#ef4444"
            : "#ddd";
          const bg = showCorrect ? "#f0fdf4" : showWrong ? "#fef2f2" : "white";

          return (
            <button
              key={i}
              onClick={() => submit(i)}
              disabled={result === "correct"} // lock after correct
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: bg,
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Feedback + Explanation */}
      {result !== "idle" && (
        <div style={{ marginTop: 12, fontSize: 14 }}>
          {result === "correct" ? "✅ Correct!" : "❌ Try again"}
          {result === "correct" && (
            <div style={{ marginTop: 8, opacity: 0.85 }}>
              <div>
                <strong>Explanation:</strong> {today.meaning}
              </div>
              <div style={{ marginTop: 4, fontStyle: "italic" }}>
                “{today.example}”
              </div>
            </div>
          )}
        </div>
      )}

      {/* Streak */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 14, opacity: 0.8 }}>
          🔥 Streak: <strong>{streak}</strong>
        </span>
        <button
          onClick={resetStreak}
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
          title="Reset streak (local only)"
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
        Tip: Streak increases the first time you answer correctly each UTC day.
      </div>
    </section>
  );
}
