import localFont from "next/font/local"

// Commit Mono, self-hosted. The blog uses one mono for two jobs — the dates,
// tags and metadata that give the index its voice, and the code inside the
// card — so the face has to survive at 12px without drawing attention to
// itself. Shipped as woff2 in the repo rather than fetched: a CDN would put a
// third-party request in front of first paint for a font that never changes.
export const mono = localFont({
  src: [
    {
      path: "./fonts/commit-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/commit-mono-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/commit-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "SF Mono",
    "Menlo",
    "Consolas",
    "monospace",
  ],
})
