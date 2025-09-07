import Link from "next/link";
import PracticeQuiz from "../../components/PracticeQuiz";

export const metadata = { title: "Practice by Category • K-LOL" };

export default function PracticePage() {
  return (
    <main>
      <PracticeQuiz />
      <nav style={{ marginTop: 16 }}>
        <Link
          href="/"
          style={{
            border: "1px solid #ddd",
            padding: "8px 12px",
            borderRadius: 10,
          }}
        >
          ← Back to Word of the Day
        </Link>
      </nav>
    </main>
  );
}
