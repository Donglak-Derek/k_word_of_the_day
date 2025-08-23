import { getAllWords } from "@/lib/getWordOfTheDay";

export const metadata = { title: "Archive • K-AJC Word of the Day" };

export default function ArchivePage() {
  const words = getAllWords();

  return (
    <main>
      <h1 style={{ marginBottom: 16 }}>Archive</h1>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {words.map((w, i) => (
          <li
            key={i}
            style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}
          >
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {w.word}{" "}
              <span style={{ opacity: 0.6, fontWeight: 400 }}>
                ({w.romanization})
              </span>
            </div>
            <div style={{ opacity: 0.8 }}>{w.meaning}</div>
            <div style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>
              “{w.example}”
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
