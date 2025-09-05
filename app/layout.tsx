import "./globals.css";
import NavBar from "@/components/NavBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://k-word-of-the-day.vercel.app"),
  title: "K-SNACK | Korean Word of the Day",
  description: "Snack-sized Korean, powered by comedy.",
  openGraph: {
    title: "K-SNACK | Korean Word of the Day",
    description: "Snack-sized Korean, powered by comedy.",
    images: ["/og.png"], // our dynamic route
  },
  twitter: {
    card: "summary_large_image",
    title: "K Word of the Day",
    description: "Snack-sized Korean, powered by comedy.",
    images: ["/og.png"],
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
