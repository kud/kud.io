// A parsed edition → the files the site renders from: one Markdown file per
// language and edition.json, the machine contract the pages, the archive, the
// research prompt and the email teaser all read.
//
// Derived, never authored: Notion is canonical and these are its committed cache.
// Nothing here carries a Notion id, a Notion URL or an account id, so the files
// say nothing about where the edition was written.

import {
  LANGS,
  SECTIONS,
  SOURCES_LABEL,
  editionTitle,
  type Lang,
  type SectionKey,
  type SectionKind,
} from "./sections.ts"
import type { Bullet, ParsedEdition, Rendition } from "./parse.ts"
import { normaliseUrl } from "./url.ts"

export type EditionJson = {
  schema: 1
  date: string
  generatedAt: string | null
  publishedAt: string | null
  languages: Lang[]
  lede: Record<Lang, string | null>
  readingMinutes: Record<Lang, number>
  wordCount: Record<Lang, number>
  narrative: {
    overview: Record<Lang, string>
    analysis: Record<Lang, string> | null
    closing: Record<Lang, string> | null
  }
  sections: Array<{
    key: SectionKey
    kind: SectionKind
    title: Record<Lang, string>
    items: string[]
  }>
  items: Array<{
    id: string
    section: SectionKey
    // A short upper-case topic leading the story, or null. When a heading is
    // the kicker alone, the title repeats it.
    kicker: Record<Lang, string> | null
    title: Record<Lang, string>
    summary: Record<Lang, string>
    sources: Array<{ url: string; label: Record<Lang, string> }>
  }>
  timeline: Array<{ date: string; text: Record<Lang, string>; urls: string[] }>
  inBrief: Array<{ text: Record<Lang, string>; urls: string[] }>
}

const byLang = <T>(pick: (lang: Lang) => T) =>
  Object.fromEntries(LANGS.map((lang) => [lang, pick(lang)])) as Record<Lang, T>

const sameSource = (a: string, b: string) => normaliseUrl(a) === normaliseUrl(b)

const titleOf = (key: SectionKey) => SECTIONS.find((s) => s.key === key)!.title

// Words a reader actually reads: the narratives (the intro among them), every story's title
// and text, the list entries. Source lists are skipped; nobody reads a
// publication's name as prose. Markdown punctuation and link targets are
// dropped before counting.
const WORDS_PER_MINUTE = 210

const proseOf = (markdown: string) =>
  markdown
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/\\(.)/g, "$1")
    .replace(/[*_`~#>[\]|]/g, " ")

export const countWords = (text: string) =>
  proseOf(text)
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length

const renditionWords = (r: Rendition) =>
  countWords(
    [
      ...Object.values(r.narrative).map((n) => n?.markdown ?? ""),
      ...r.items.flatMap((item) => [item.title, item.body]),
      ...Object.values(r.bullets).flatMap((entries) => (entries ?? []).map((e) => e.markdown)),
    ].join("\n"),
  )

export const readingMinutes = (words: number) =>
  Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

const pairBullets = (edition: ParsedEdition, key: "timeline" | "inbrief") => {
  const fr = edition.renditions.fr.bullets[key] ?? []
  const en = edition.renditions.en.bullets[key] ?? []
  return fr.map((entry: Bullet, index) => ({
    date: entry.date ?? "",
    text: { fr: entry.markdown, en: en[index]?.markdown ?? entry.markdown },
    urls: [...entry.urls],
  }))
}

export const toEditionJson = (
  edition: ParsedEdition,
  publishedAt: string | null,
): EditionJson => {
  const { fr, en } = edition.renditions
  const words = byLang((lang) => renditionWords(edition.renditions[lang]))
  return {
    schema: 1,
    date: edition.date,
    generatedAt: edition.generatedAt,
    publishedAt,
    languages: [...LANGS],
    lede: byLang((lang) => edition.renditions[lang].lede.join("\n\n") || null),
    readingMinutes: byLang((lang) => readingMinutes(words[lang])),
    wordCount: words,
    narrative: {
      overview: byLang((lang) => edition.renditions[lang].narrative.overview?.markdown ?? ""),
      analysis: fr.narrative.analysis
        ? byLang((lang) => edition.renditions[lang].narrative.analysis?.markdown ?? "")
        : null,
      closing: fr.narrative.closing
        ? byLang((lang) => edition.renditions[lang].narrative.closing?.markdown ?? "")
        : null,
    },
    sections: fr.sections.map((section) => ({
      key: section.key,
      kind: section.kind,
      title: { ...titleOf(section.key) },
      items: [...section.items],
    })),
    // Sources keep the French order; parity has already proved the English set
    // is the same, so each English label is found by its normalised URL.
    items: fr.items.map((frItem) => {
      const enItem = en.items.find((item) => item.id === frItem.id)!
      return {
        id: frItem.id,
        section: frItem.section,
        kicker: frItem.kicker && enItem.kicker ? { fr: frItem.kicker, en: enItem.kicker } : null,
        title: { fr: frItem.title, en: enItem.title },
        summary: { fr: frItem.summary, en: enItem.summary },
        sources: frItem.sources.map((source) => ({
          url: source.url,
          label: {
            fr: source.label,
            en: enItem.sources.find((s) => sameSource(s.url, source.url))?.label ?? source.label,
          },
        })),
      }
    }),
    timeline: pairBullets(edition, "timeline"),
    inBrief: pairBullets(edition, "inbrief").map(({ text, urls }) => ({ text, urls })),
  }
}

const escapeLinkText = (text: string) => text.replace(/([\\[\]])/g, "\\$1")
const escapeHeading = (text: string) => text.replace(/([\\`*_[\]<>{}#])/g, "\\$1")

const frontmatter = (fields: Record<string, string | number | null>) =>
  [
    "---",
    ...Object.entries(fields)
      .filter(([, value]) => value !== null && value !== "")
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`),
    "---",
    "",
    "",
  ].join("\n")

// Item headings carry a stable anchor, `{#item-01}`, so a link to one story
// survives a retitle and is the same in both languages.
export const toMarkdown = (edition: ParsedEdition, lang: Lang) => {
  const rendition = edition.renditions[lang]
  const parts: string[] = []

  // The intro opens the page and the closing line ends it; neither shows a
  // heading.
  for (const section of rendition.sections) {
    if (section.key !== "overview" && section.key !== "closing")
      parts.push(`## ${titleOf(section.key)[lang]}`)

    if (section.kind === "narrative") {
      const narrative = rendition.narrative[section.key as "overview" | "analysis" | "closing"]
      if (narrative?.markdown) parts.push(narrative.markdown)
      continue
    }

    if (section.kind === "bullets") {
      const entries = rendition.bullets[section.key as "timeline" | "inbrief"] ?? []
      parts.push(
        entries
          .map((entry) => `- ${entry.date ? `${entry.date} — ` : ""}${entry.markdown}`)
          .join("\n"),
      )
      continue
    }

    for (const id of section.items) {
      const item = rendition.items.find((i) => i.id === id)!
      const heading = item.kicker && item.kicker !== item.title
        ? `${escapeHeading(item.kicker)} · ${escapeHeading(item.title)}`
        : escapeHeading(item.title)
      parts.push(`### ${item.id} · ${heading} {#item-${item.id}}`)
      if (item.body) parts.push(item.body)
      if (item.sources.length)
        parts.push(
          SOURCES_LABEL[lang],
          item.sources.map((s) => `- [${escapeLinkText(s.label)}](${s.url})`).join("\n"),
        )
    }
  }

  const words = renditionWords(rendition)
  return (
    frontmatter({
      title: editionTitle(edition.date, lang),
      date: edition.date,
      lang,
      lede: rendition.lede[0] ?? null,
      generatedAt: edition.generatedAt,
      readingMinutes: readingMinutes(words),
      wordCount: words,
    }) +
    parts.join("\n\n") +
    "\n"
  )
}

export type DerivedFiles = Record<"fr.md" | "en.md" | "edition.json", string>

export const deriveFiles = (
  edition: ParsedEdition,
  publishedAt: string | null,
): DerivedFiles => ({
  "fr.md": toMarkdown(edition, "fr"),
  "en.md": toMarkdown(edition, "en"),
  "edition.json": JSON.stringify(toEditionJson(edition, publishedAt), null, 2) + "\n",
})
