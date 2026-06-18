import type { MetadataRoute } from "next"

// Web App Manifest — makes kud.io installable as a PWA. Next auto-injects the
// <link rel="manifest"> from this file. The colours match the cream landing
// (start_url "/") so the install splash and standalone chrome feel seamless.
const manifest = (): MetadataRoute.Manifest => ({
  name: "Erwann Mest — kud",
  short_name: "kud.io",
  description:
    "Systems designer and lead software engineer in London: systems thinking, developer experience, and AI-assisted engineering.",
  start_url: "/",
  display: "standalone",
  background_color: "#fdfbf8",
  theme_color: "#fdfbf8",
  icons: [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
})

export default manifest
