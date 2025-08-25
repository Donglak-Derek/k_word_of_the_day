"use client";

import { useEffect, useMemo, useState } from "react";
import words from "@/data/words.json";
import type { Word } from "@/lib/types";

/* ===================== utils ===================== */

function normCat(c?: string) {
  return (c || "misc").toLowerCase();
}

type WordWithCat = Word & { category: string };
type WordWithIdx = WordWithCat & { idx: number };

function getAll(): WordWithCat[] {
  return (words as Word[]).map((w) => ({
    ...w,
    category: normCat(w.category),
  }));
}

// Seedable PRNG + shuffle
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Local storage stats (per-category)
type Stats = Record<
  string,
  { played: number; correct: number; streak: number }
>;
function loadStats(): Stats {
  try {
    return JSON.parse(localStorage.getItem("kajc_practice_stats") || "{}");
  } catch {
    return {};
  }
}
function saveStats(s: Stats) {
  localStorage.setItem("kajc_practice_stats", JSON.stringify(s));
}

// Client-only session seed (prevents SSR/CSR mismatch)
function getOrCreateSessionSeed(): number {
  try {
    const existing = localStorage.getItem("kajc_practice_session_seed");
    if (existing) return Number(existing);
    // combine time + random once on client
    const seed = (Date.now() & 0xffff) ^ Math.floor(Math.random() * 0xffff);
    localStorage.setItem("kajc_practice_session_seed", String(seed));
    return seed;
  } catch {
    return 12345; // deterministic fallback if storage blocked
  }
}

// Speak Hangul then romanization
function speakWord(hangul: string, romanization: string) {
  try {
    const u1 = new SpeechSynthesisUtterance(hangul);
    u1.lang = "ko-KR";
    const u2 = new SpeechSynthesisUtterance(romanization);
    u2.lang = "en-US";
    window.speechSynthesis.cancel();
    u1.onend = () => window.speechSynthesis.speak(u2);
    window.speechSynthesis.speak(u1);
  } catch {
    // ignore if unsupported
  }
}

/* ===================== component ===================== */

export default function PracticeQuiz() {
  // All words + normalized category
  const allWithCat = useMemo<WordWithCat[]>(() => getAll(), []);
  // Add stable indices
  const allWithIdx = useMemo<WordWithIdx[]>(
    () => allWithCat.map((w, i) => ({ ...w, idx: i })),
    [allWithCat]
  );

  // Category list
  const catSet = useMemo(() => {
    const s = new Set<string>();
    allWithCat.forEach((w) => s.add(w.category));
    return Array.from(s).sort();
  }, [allWithCat]);

  // UI state
  const [cat, setCat] = useState<string>(catSet[0] || "misc");

  // Client-only seed to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [sessionSeed, setSessionSeed] = useState<number | null>(null);
  useEffect(() => {
    setMounted(true);
    setSessionSeed(getOrCreateSessionSeed());
  }, []);

  // Question state
  const [qIndex, setQIndex] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  // Stats
  const [stats, setStats] = useState<Stats>({});
  useEffect(() => {
    setStats(loadStats());
  }, []);

  // Derived pools (always computed; safe even before seed is ready)
  const pool = useMemo<WordWithIdx[]>(
    () => allWithIdx.filter((w) => w.category === cat),
    [allWithIdx, cat]
  );

  // Build one question deterministically for this session + qIndex
  const question = useMemo(() => {
    // If seed not ready or pool empty, signal "not ready"
    if (sessionSeed === null || pool.length === 0) {
      return null as null | {
        correct: WordWithIdx;
        options: { label: string; correct: boolean }[];
        correctIndex: number;
      };
    }

    const seed = sessionSeed + qIndex * 777;
    const rand = mulberry32(seed);

    // pick correct from pool
    const correctIdxInPool = Math.floor(rand() * pool.length);
    const correct = pool[correctIdxInPool]; // WordWithIdx

    // distractors: same category first (exclude correct)
    let distractors: WordWithIdx[] = pool.filter(
      (_, i) => i !== correctIdxInPool
    );

    if (distractors.length < 2) {
      // fallback: bring from global other categories
      const globalOthers = allWithIdx.filter((w) => w.category !== cat);
      distractors = distractors.concat(globalOthers);
    }

    // shuffle & take 2 distinct from correct
    const picked = shuffleSeeded(distractors, seed + 17)
      .filter((d) => d.idx !== correct.idx)
      .slice(0, 2);

    const raw = [
      { label: correct.meaning, correct: true },
      ...picked.map((d) => ({ label: d.meaning, correct: false })),
    ];
    const options = shuffleSeeded(raw, seed + 99);
    const correctIndex = options.findIndex((o) => o.correct);

    return { correct, options, correctIndex };
  }, [pool, allWithIdx, cat, sessionSeed, qIndex]);

  function submit(i: number) {
    if (!question) return;
    setSelected(i);
    const ok = i === question.correctIndex;
    setResult(ok ? "correct" : "wrong");

    // update per-category stats
    const s = { ...stats };
    const key = cat;
    const curr = s[key] || { played: 0, correct: 0, streak: 0 };
    curr.played += 1;
    if (ok) {
      curr.correct += 1;
      curr.streak += 1;
    } else {
      curr.streak = 0;
    }
    s[key] = curr;
    setStats(s);
    saveStats(s);
  }

  function nextQuestion() {
    setSelected(null);
    setResult("idle");
    setQIndex((q) => q + 1);
  }

  const catStats = stats[cat] || { played: 0, correct: 0, streak: 0 };
  const acc = catStats.played
    ? Math.round((catStats.correct / catStats.played) * 100)
    : 0;

  // ----------- single return; skeleton rendered conditionally -----------
  return (
    <section
      style={{
        borderRadius: 16,
        border: "1px solid #eee",
        padding: 24,
        boxShadow: "0 6px 30px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header: category + stats + speak */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <label style={{ fontSize: 14, opacity: 0.8 }}>Category</label>
        <select
          value={cat}
          onChange={(e) => {
            setCat(e.target.value);
            setQIndex(0);
            setSelected(null);
            setResult("idle");
          }}
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
        >
          {catSet.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, opacity: 0.8 }}>
            Played: <strong>{catStats.played}</strong>
          </span>
          <span style={{ fontSize: 13, opacity: 0.8 }}>
            Correct: <strong>{catStats.correct}</strong> ({acc}%)
          </span>
          <span style={{ fontSize: 13, opacity: 0.8 }}>
            🔥 Streak: <strong>{catStats.streak}</strong>
          </span>
          <button
            onClick={() => {
              if (!question) return;
              speakWord(question.correct.word, question.correct.romanization);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
            title="Pronounce (ko-KR), then romanization"
          >
            🔊 Speak
          </button>
        </div>
      </div>

      {/* When not mounted / no seed / no pool, show skeleton */}
      {!mounted || sessionSeed === null || !question ? (
        <>
          <div
            style={{
              height: 36,
              width: 180,
              background: "#f5f5f5",
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
          <div
            style={{
              height: 18,
              width: 240,
              background: "#f5f5f5",
              borderRadius: 6,
              marginBottom: 16,
            }}
          />
          <div style={{ display: "grid", gap: 10 }}>
            <div
              style={{ height: 44, background: "#f5f5f5", borderRadius: 10 }}
            />
            <div
              style={{ height: 44, background: "#f5f5f5", borderRadius: 10 }}
            />
            <div
              style={{ height: 44, background: "#f5f5f5", borderRadius: 10 }}
            />
          </div>
        </>
      ) : (
        <>
          {/* Prompt */}
          <h1 style={{ fontSize: 32, margin: "6px 0" }}>
            {question.correct.word}
          </h1>
          <div style={{ fontSize: 16, opacity: 0.8, marginBottom: 12 }}>
            {question.correct.romanization}
          </div>
          <p style={{ fontSize: 16, opacity: 0.9, margin: "6px 0 16px" }}>
            What does this word mean?{" "}
            <span style={{ opacity: 0.7 }}>(Category: {cat})</span>
          </p>

          {/* Options */}
          <div style={{ display: "grid", gap: 10 }}>
            {question.options.map((opt, i) => {
              const isSelected = selected === i;
              const showCorrect = result !== "idle" && opt.correct;
              const showWrong =
                result === "wrong" && isSelected && !opt.correct;
              const border = showCorrect
                ? "#16a34a"
                : showWrong
                ? "#ef4444"
                : "#ddd";
              const bg = showCorrect
                ? "#f0fdf4"
                : showWrong
                ? "#fef2f2"
                : "white";
              return (
                <button
                  key={i}
                  onClick={() => submit(i)}
                  disabled={result === "correct"}
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

          {/* Feedback + explanation */}
          {result !== "idle" && (
            <div style={{ marginTop: 12, fontSize: 14 }}>
              {result === "correct" ? "✅ Correct!" : "❌ Try again"}
              {result === "correct" && (
                <div style={{ marginTop: 8, opacity: 0.85 }}>
                  <div>
                    <strong>Explanation:</strong> {question.correct.meaning}
                  </div>
                  <div style={{ marginTop: 4, fontStyle: "italic" }}>
                    “{question.correct.example}”
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Next */}
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              onClick={nextQuestion}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
              }}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </section>
  );
}
