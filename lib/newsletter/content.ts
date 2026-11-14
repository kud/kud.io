import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { parseEditionMarkdown } from "./body.ts"
import { isEditionDate, LANGS, type Lang } from "./language.ts"

// The reading side of the newsletter. It reads only the derived build
// artefacts under content/newsletter/<date>/ (edition.json, fr.md, en.md),
// which the publication workflow writes and validates; it never talks to the
// editorial store. Its checks are the ones a renderer needs to not fall over,
// not the publication rules, which are enforced before anything is committed.

export type Localised<T = string> = Record<Lang, T>

export const SECTION_KEYS = [
  "overview",
  "depth",
  "brief",
  "explainer",
  "analysis",
  "techsci",
  "timeline",
  "inbrief",
  "finds",
  "watch",
  "closing",
] as const

// What a section holds. Narrative sections are written prose with inline
// citations (edition.narrative); list sections are bullets (edition.timeline,
// edition.inBrief); item sections hold the numbered, selectable stories.
export type SectionKind = "narrative" | "list" | "items"

export const SECTION_KIND: Record<SectionKey, SectionKind> = {
  overview: "narrative",
  depth: "items",
  brief: "items",
  explainer: "items",
  closing: "narrative",
  analysis: "narrative",
  techsci: "items",
  timeline: "list",
  inbrief: "list",
  finds: "items",
  watch: "items",
}

export type SectionKey = (typeof SECTION_KEYS)[number]

export type EditionSource = { url: string; label: Localised }

export type EditionItem = {
  id: string
  section: SectionKey
  // A short uppercase topic label ("CLIMATE"); a story may carry only this.
  kicker: Localised | null
  title: Localised
  summary: Localised
  sources: EditionSource[]
}

export type EditionSection = {
  key: SectionKey
  kind: SectionKind
  title: Localised
  items: string[]
}

export type TimelineEntry = { date: string; text: Localised; urls: string[] }

export type FastFact = { text: Localised; urls: string[] }

export type Edition = {
  schema: 1
  date: string
  generatedAt: string | null
  publishedAt: string | null
  languages: Lang[]
  lede: Localised<string | null>
  // Markdown, links inline on the source name. The overview is required by
  // the publication rules; null here only for an artefact older than it.
  narrative: {
    overview: Localised | null
    analysis: Localised | null
    closing: Localised | null
  }
  timeline: TimelineEntry[]
  inBrief: FastFact[]
  readingMinutes: Localised<number> | null
  wordCount: Localised<number> | null
  sections: EditionSection[]
  items: EditionItem[]
}

// The edition plus each item's Markdown body per language, keyed by item id.
// A body may be missing (an older artefact, a hand-made fixture): the page
// then falls back to the item's summary.
export type LoadedEdition = Edition & {
  bodies: Localised<Record<string, string>>
}

// The production directory unless NEWSLETTER_CONTENT_DIR points elsewhere,
// which is how local development and the tests read the invented fixtures
// without a fake edition ever being committed under content/newsletter/.
// The turbopackIgnore marks keep the bundler from tracing a path it cannot
// know at build time; the pages are prerendered, so nothing reads it later.
export const contentDir = () =>
  process.env.NEWSLETTER_CONTENT_DIR
    ? path.resolve(
        /* turbopackIgnore: true */ process.cwd(),
        process.env.NEWSLETTER_CONTENT_DIR,
      )
    : path.join(
        /* turbopackIgnore: true */ process.cwd(),
        "content",
        "newsletter",
      )

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isLocalised = (value: unknown, nullable = false) =>
  isObject(value) &&
  LANGS.every(
    (lang) =>
      typeof value[lang] === "string" || (nullable && value[lang] === null),
  )

// Throws with the field that failed, so a broken artefact fails the build
// loudly rather than rendering a half-edition.
export const parseEdition = (raw: unknown, expectedDate?: string): Edition => {
  const fail = (what: string): never => {
    throw new Error(
      `newsletter ${expectedDate ?? "edition"}: invalid edition.json (${what})`,
    )
  }
  if (!isObject(raw)) return fail("not an object")
  if (raw.schema !== 1) fail("schema must be 1")
  if (typeof raw.date !== "string" || !isEditionDate(raw.date)) fail("date")
  if (expectedDate && raw.date !== expectedDate)
    fail("date differs from folder")
  if (!isLocalised(raw.lede, true)) fail("lede")
  if (!Array.isArray(raw.sections)) fail("sections")
  if (!Array.isArray(raw.items)) fail("items")

  const items = raw.items as unknown[]
  items.forEach((item, index) => {
    if (
      !isObject(item) ||
      typeof item.id !== "string" ||
      !/^\d{2}$/.test(item.id) ||
      !(SECTION_KEYS as readonly unknown[]).includes(item.section) ||
      !isLocalised(item.title) ||
      !isLocalised(item.summary) ||
      !Array.isArray(item.sources) ||
      !item.sources.every(
        (source) =>
          isObject(source) &&
          typeof source.url === "string" &&
          /^https:\/\//.test(source.url) &&
          isLocalised(source.label),
      )
    )
      fail(`item ${index}`)
  })

  const ids = new Set(items.map((item) => (item as EditionItem).id))
  ;(raw.sections as unknown[]).forEach((section, index) => {
    if (
      !isObject(section) ||
      !(SECTION_KEYS as readonly unknown[]).includes(section.key) ||
      !isLocalised(section.title) ||
      !Array.isArray(section.items) ||
      !section.items.every((id) => typeof id === "string" && ids.has(id))
    )
      fail(`section ${index}`)
  })

  const narrative = isObject(raw.narrative) ? raw.narrative : {}
  const optionalLocalised = (value: unknown, what: string) => {
    if (value === undefined || value === null) return null
    if (!isLocalised(value)) fail(what)
    return value as Localised
  }
  const numbers = (value: unknown) =>
    isObject(value) && LANGS.every((lang) => typeof value[lang] === "number")
      ? (value as Localised<number>)
      : null
  const urlsOf = (value: unknown, what: string) => {
    if (
      !Array.isArray(value) ||
      !value.every((url) => typeof url === "string" && /^https:\/\//.test(url))
    )
      fail(what)
    return value as string[]
  }
  const timeline = (Array.isArray(raw.timeline) ? raw.timeline : []).map(
    (entry: unknown, index: number): TimelineEntry => {
      if (
        !isObject(entry) ||
        typeof entry.date !== "string" ||
        !isLocalised(entry.text)
      )
        fail(`timeline ${index}`)
      const value = entry as Record<string, unknown>
      return {
        date: value.date as string,
        text: value.text as Localised,
        urls: urlsOf(value.urls, `timeline ${index} urls`),
      }
    },
  )
  const inBrief = (Array.isArray(raw.inBrief) ? raw.inBrief : []).map(
    (entry: unknown, index: number): FastFact => {
      if (!isObject(entry) || !isLocalised(entry.text)) fail(`inBrief ${index}`)
      const value = entry as Record<string, unknown>
      return {
        text: value.text as Localised,
        urls: urlsOf(value.urls, `inBrief ${index} urls`),
      }
    },
  )

  return {
    schema: 1,
    date: raw.date as string,
    generatedAt: typeof raw.generatedAt === "string" ? raw.generatedAt : null,
    publishedAt: typeof raw.publishedAt === "string" ? raw.publishedAt : null,
    languages: [...LANGS],
    lede: raw.lede as Localised<string | null>,
    narrative: {
      overview: optionalLocalised(narrative.overview, "narrative.overview"),
      analysis: optionalLocalised(narrative.analysis, "narrative.analysis"),
      closing: optionalLocalised(narrative.closing, "narrative.closing"),
    },
    timeline,
    inBrief,
    readingMinutes: numbers(raw.readingMinutes),
    wordCount: numbers(raw.wordCount),
    sections: (raw.sections as Record<string, unknown>[]).map((section) => ({
      key: section.key as SectionKey,
      kind: SECTION_KIND[section.key as SectionKey],
      title: section.title as Localised,
      items: section.items as string[],
    })),
    items: items.map((item) => {
      const value = item as EditionItem
      return {
        ...value,
        kicker: isLocalised((item as Record<string, unknown>).kicker)
          ? value.kicker
          : null,
      }
    }),
  }
}

const readOptional = async (file: string) => {
  try {
    return await readFile(file, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

// Newest first. A missing directory is the honest empty state, not an error.
export const listEditionDates = async (dir = contentDir()) => {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isDirectory() && isEditionDate(entry.name))
      .map((entry) => entry.name)
      .sort()
      .reverse()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}

export const loadEdition = async (
  date: string,
  dir = contentDir(),
): Promise<LoadedEdition | null> => {
  if (!isEditionDate(date)) return null
  const json = await readOptional(path.join(dir, date, "edition.json"))
  if (json === null) return null
  const edition = parseEdition(JSON.parse(json), date)
  const [fr, en] = await Promise.all(
    LANGS.map((lang) => readOptional(path.join(dir, date, `${lang}.md`))),
  )
  return {
    ...edition,
    bodies: {
      fr: fr ? parseEditionMarkdown(fr).items : {},
      en: en ? parseEditionMarkdown(en).items : {},
    },
  }
}

// Every edition, newest first. A folder without edition.json is skipped: the
// workflow writes all three files in one commit, so that is a stray folder.
export const getEditions = async (dir = contentDir()) => {
  const dates = await listEditionDates(dir)
  const editions = await Promise.all(
    dates.map((date) => loadEdition(date, dir)),
  )
  return editions.filter(
    (edition): edition is LoadedEdition => edition !== null,
  )
}

export const getLatestEdition = async (dir = contentDir()) => {
  for (const date of await listEditionDates(dir)) {
    const edition = await loadEdition(date, dir)
    if (edition) return edition
  }
  return null
}

// The editions either side of a date, for the previous/next links.
export const neighbours = (dates: string[], date: string) => {
  const index = dates.indexOf(date)
  return {
    newer: index > 0 ? dates[index - 1] : null,
    older: index >= 0 && index < dates.length - 1 ? dates[index + 1] : null,
  }
}

// Items in reading order, grouped under their section.
export const sectionsWithItems = (edition: Edition) => {
  const byId = new Map(edition.items.map((item) => [item.id, item]))
  return edition.sections
    .map((section) => ({
      ...section,
      entries: section.items
        .map((id) => byId.get(id))
        .filter((item): item is EditionItem => item !== undefined),
    }))
    .filter((section) => {
      if (section.kind === "items") return section.entries.length > 0
      if (section.key === "overview") return edition.narrative.overview !== null
      if (section.key === "analysis") return edition.narrative.analysis !== null
      if (section.key === "closing") return edition.narrative.closing !== null
      if (section.key === "timeline") return edition.timeline.length > 0
      return edition.inBrief.length > 0
    })
}
