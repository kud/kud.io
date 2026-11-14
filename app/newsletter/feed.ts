import { getEditions } from "@/lib/newsletter/content"
import {
  COPY,
  formatEditionDate,
  newsletterHref,
  type Lang,
} from "@/lib/newsletter/language"

// One feed per language, like the blog's: summary only, prerendered. Each
// entry is an edition; its description is the lede, or its first stories.
const SITE = "https://kud.io"

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const rfc822 = (iso: string) => new Date(iso).toUTCString()

export const feed = async (lang: Lang) => {
  const editions = await getEditions()
  const copy = COPY[lang]
  const self = `${SITE}/newsletter/${lang}.xml`
  const items = editions.map((edition) => {
    const url = `${SITE}${newsletterHref({ date: edition.date }, lang, { explicit: true })}`
    const description =
      edition.lede[lang] ??
      edition.items
        .slice(0, 3)
        .map((item) => item.title[lang])
        .join(" · ")
    return [
      "    <item>",
      `      <title>${escapeXml(`${copy.name} · ${formatEditionDate(edition.date, lang)}`)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <pubDate>${rfc822(edition.publishedAt ?? `${edition.date}T19:00:00Z`)}</pubDate>`,
      `      <description>${escapeXml(description)}</description>`,
      "    </item>",
    ].join("\n")
  })
  const xml = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(`${copy.name} — kud.io`)}</title>`,
    `    <link>${SITE}${newsletterHref({}, lang, { explicit: true })}</link>`,
    `    <description>${escapeXml(copy.tagline)}</description>`,
    `    <language>${lang === "fr" ? "fr" : "en-GB"}</language>`,
    `    <atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n")
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
