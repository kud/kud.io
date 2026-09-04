import { getAllPosts, postPath } from "@/lib/blog"

// Prerendered at build time and served as a static asset, exactly like /cv.pdf.
// Nothing here reads a request, so a dynamic route would buy a lambda per poll
// from every feed reader in exchange for the same bytes.
export const dynamic = "force-static"

const SITE = "https://kud.io"
const TITLE = "Writing — kud.io"
const DESCRIPTION =
  "Notes on systems, tooling, and the trade-offs behind them — by Erwann Mest."

// Real escaping rather than CDATA: a CDATA section has one thing that can end it
// early and no way to escape that thing, whereas this is uniform and total. The
// five XML predefined entities, applied to every interpolated value.
const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const rfc822 = (value: string) => new Date(value).toUTCString()

// Summary only, never the rendered body. The code card is a design that depends
// on this site's CSS and Shiki theme; a feed reader strips both, so a
// full-content feed would ship the posts at their least legible.
const toItem = (post: {
  slug: string
  title: string
  description: string
  date: string
}) => {
  const url = `${SITE}${postPath(post)}`
  return [
    "    <item>",
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${escapeXml(url)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
    post.date ? `      <pubDate>${rfc822(post.date)}</pubDate>` : null,
    post.description
      ? `      <description>${escapeXml(post.description)}</description>`
      : null,
    "    </item>",
  ]
    .filter(Boolean)
    .join("\n")
}

export const GET = async () => {
  const posts = await getAllPosts()
  const newest = posts.find((post) => post.date)?.date

  const xml = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(TITLE)}</title>`,
    `    <link>${SITE}/blog</link>`,
    `    <description>${escapeXml(DESCRIPTION)}</description>`,
    "    <language>en-GB</language>",
    newest ? `    <lastBuildDate>${rfc822(newest)}</lastBuildDate>` : null,
    `    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>`,
    ...posts.map(toItem),
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter(Boolean)
    .join("\n")

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
