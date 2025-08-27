"use client";

import Link from "next/link";
import WordActions from "@/components/WordActions";
import type { Word } from "@/lib/wordSchema";
import ShareButton from "@/components/ShareButton";

export default function WordListItem({ w }: { w: Word }) {
  return (
    <li
      style={{
        padding: "12px 0",
        borderBottom: "1px solid #eee",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>
          <Link href={`/word/${w.slug}`} style={{ textDecoration: "none" }}>
            {w.word}
          </Link>{" "}
          <span style={{ opacity: 0.6, fontWeight: 400 }}>
            ({w.romanization})
          </span>
        </div>
        <div style={{ opacity: 0.85 }}>
          <strong style={{ textTransform: "capitalize" }}>{w.category}</strong>{" "}
          • {w.meaning}
        </div>
        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>
          “{w.example}”
        </div>
        <div
          style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          <WordActions word={w} />
          <ShareButton
            title={`K-AJC • ${w.word} (${w.romanization})`}
            text={`${w.meaning}\nExample: ${w.example}`}
            url={`${
              typeof window !== "undefined" ? window.location.origin : ""
            }/word/${w.slug}`}
          />
        </div>
      </div>

      <div>
        <Link
          href={`/word/${w.slug}`}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        >
          View →
        </Link>
      </div>
    </li>
  );
}
