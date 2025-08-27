import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "K-AJC | Korean Word of the Day",
  description:
    "One Korean word a day with meaning, pronunciation, and a funny example.",
  metadataBase: new URL("https://YOUR_DOMAIN_HERE"), // e.g., https://kajc.app
  openGraph: {
    title: "K-AJC | Korean Word of the Day",
    description: "Learn Korean daily with culture & humor.",
    images: ["/og"], // our dynamic route
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="En">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#111111" />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <NavBar />
        <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
