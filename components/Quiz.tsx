"use client";

import { useEffect, useMemo, useState } from "react";
import words from "@/data/words.json";
import { dayOfYearUTC, getTodayIndex } from "@/lib/getWordOfTheDay";

type Word = {
  word: string;
  romanization: string;
  meaning: string;
  example: string;
};

function utcDateKey(d = new Date()) {
  // YYYY-MM-DD in UTC so everyone gets the same "day"
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Quiz() {
  const len = (words as Word[]).length;
  const todayIdx = getTodayIndex();
  const today = (words as Word[])[todayIdx];

  // Deterministic distractors based on today's index
  const distractor1 = (words as Word[])[(todayIdx + 7) % len];
  const distractor2 = (words as Word[])[(todayIdx + 13) % len];

  // Build options: 3 meanings, shuffled deterministically by today's index
  const options = useMemo(() => {
    const base = [
      { label: today.meaning, correct: true },
      { label: distractor1.meaning, correct: false },
      { label: distractor2.meaning, correct: false },
    ];
    // rotate array by (todayIdx % 3) to avoid true always first
    const rot = todayIdx % 3;
    return [...base.slice(rot), ...base.slice(0, rot)];
  }, [todayIdx, today.meaning, distractor1.meaning, distractor2.meaning]);

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

  function submit(i: number) {
    setSelected(i);
    const ok = options[i].correct;
    setResult(ok ? "correct" : "wrong");

    // If correct and not already counted today, bump streak
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
      <header style={{ marginBottom: 10 }}>
        <small style={{ opacity: 0.7 }}>
          Daily Quiz • Day {dayOfYearUTC() + 1}
        </small>
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
          const showCorrect = result !== "idle" && opt.correct;
          const showWrong = result === "wrong" && isSelected && !opt.correct;
          const border = showCorrect
            ? "#16a34a"
            : showWrong
            ? "#ef4444"
            : "#ddd";
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
                background: showCorrect
                  ? "#f0fdf4"
                  : showWrong
                  ? "#fef2f2"
                  : "white",
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {result !== "idle" && (
        <div style={{ marginTop: 12, fontSize: 14 }}>
          {result === "correct" ? "✅ Correct!" : "❌ Try again"}
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
