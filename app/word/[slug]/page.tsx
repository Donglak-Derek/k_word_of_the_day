// app/word/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllWordsValidated } from "@/lib/words";
import type { Word } from "@/lib/wordSchema";
import WordActions from "@/components/WordActions";
import ShareButton from "@/components/ShareButton";
import type { Metadata } from "next";

// ---- Dynamic OG image & title for this word page ----
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const all = getAllWordsValidated();
  const idx = Math.max(
    0,
    all.findIndex((w) => w.slug === slug)
  );
  const w = all[idx];

  const title = w
    ? `Word: ${w.word} (${w.romanization}) — K-LOL`
    : `Word: ${slug} — K-LOL`;

  return {
    title,
    openGraph: { images: [`/og?idx=${idx}`] },
    twitter: { card: "summary_large_image", images: [`/og?idx=${idx}`] },
  };
}

// Optional: prebuild pages for all words
export function generateStaticParams() {
  const all = getAllWordsValidated();
  return all.map((w) => ({ slug: w.slug }));
}

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // <-- Next 15: await params

  const all: Word[] = getAllWordsValidated();
  const word = all.find((w) => w.slug === slug);

  if (!word) {
    notFound();
  }

  const shareTitle = `K-LOL • ${word!.word} (${word!.romanization})`;
  const shareText = `${word!.meaning}\nExample: ${word!.example}`;

  const related = word!.relatedIds?.length
    ? all.filter((w) => word!.relatedIds!.includes(w.id))
    : [];

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <nav style={{ marginBottom: 12 }}>
        <Link href="/archive">← Back to Archive</Link>
      </nav>

      <h1 style={{ fontSize: 42, margin: "6px 0" }}>{word!.word}</h1>
      <div style={{ fontSize: 16, opacity: 0.8, marginBottom: 8 }}>
        {word!.romanization} • <strong>{word!.meaning}</strong>
      </div>
      <div
        style={{ textTransform: "capitalize", opacity: 0.8, marginBottom: 12 }}
      >
        Category: <strong>{word!.category}</strong>
      </div>

      <WordActions word={word as Word} />

      <div style={{ marginTop: 8 }}>
        <ShareButton title={shareTitle} text={shareText}>
          📤 Share
        </ShareButton>
      </div>

      <p style={{ fontSize: 18, lineHeight: 1.6, marginTop: 16 }}>
        “{word!.example}”
      </p>

      {word!.notes && (
        <section style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 8 }}>Notes</h3>
          <p style={{ opacity: 0.9 }}>{word!.notes}</p>
        </section>
      )}

      {(word!.tags?.length || 0) > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Tags</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {word!.tags!.map((t) => (
              <span
                key={t}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 13,
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        </section>
      )}

      {(word!.synonyms?.length || 0) > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Synonyms</h3>
          <ul>
            {word!.synonyms!.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Related</h3>
          <ul>
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/word/${r.slug}`}>{r.word}</Link> — {r.meaning}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
