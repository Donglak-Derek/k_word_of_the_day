export const metadata = {
  title: "K-AJC | Korean Word of the Day",
  description:
    "One Korean word a day with meaning, pronunciation, and a funny example.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="En">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
