"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/archive", label: "Archive" },
  { href: "/practice", label: "Practice" },
  { href: "/favorites", label: "Favorites" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/archive?q=${encodeURIComponent(q.trim())}`);
      setQ("");
    }
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "saturate(180%) blur(6px)",
        background: "rgba(255,255,255,0.9)",
        borderBottom: "1px solid #eee",
      }}
    >
      <nav
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Brand */}
        <span style={{ fontWeight: 700, marginRight: 10 }}>K-AJC</span>

        {/* Main links */}
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: active ? "1px solid #111" : "1px solid #ddd",
                background: active ? "#111" : "white",
                color: active ? "#fff" : "#111",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            🔍
          </button>
        </form>

        {/* SNS links */}
        <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
          <a
            href="https://www.youtube.com/@K-AJC"
            target="_blank"
            rel="noopener noreferrer"
            title="YouTube"
            style={{ fontSize: 18, textDecoration: "none" }}
          >
            ▶️
          </a>
          <a
            href="https://www.instagram.com/kajc"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            style={{ fontSize: 18, textDecoration: "none" }}
          >
            📸
          </a>
        </div>
      </nav>
    </header>
  );
}
