import Quiz from "@/components/Quiz";
import Link from "next/link";

export const metadata = { title: "Daily Quiz • K-LOL" };

export default function QuizPage() {
  return (
    <main>
      <Quiz />
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
      <footer>
        <p style={{ fontSize: 14, marginTop: 12 }}>
          Want more? <a href="/practice">Category practice</a>
        </p>
      </footer>
    </main>
  );
}
