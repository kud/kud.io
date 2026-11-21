import type { MetadataRoute } from "next"

// Everything is open to crawlers; the line that matters is the sitemap's, an
// absolute URL like every entry in it (app/sitemap.ts).
const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: "*", allow: "/" },
  sitemap: "https://kud.io/sitemap.xml",
  host: "https://kud.io",
})

export default robots
