import { getWordOfTheDay } from "@/lib/getWordOfTheDay";
import WordCard from "@/components/WordCard";

export default function Page() {
  const word = getWordOfTheDay(); // runs on server

  return (
    <main>
      <WordCard word={word} />
      <footer style={{ marginTop: 24, opacity: 0.7 }}>
        <p>
          Tip: Add to Home Screen for quick access. • Built by K-AJC (Korean
          Ajusshi)
        </p>
        <p style={{ fontSize: 14 }}>
          Want yesterday’s word? Try <a href="/archive">the archive</a>.
        </p>
      </footer>
    </main>
  );
}
