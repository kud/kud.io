// The fixed shape of an edition. Notion's page body is parsed against this and
// nothing else, so a heading typed slightly wrong is an error rather than a new
// section nobody designed.

export type Lang = "fr" | "en"
export const LANGS: readonly Lang[] = ["fr", "en"]

// The two top-level headings that split a page body into its renditions, in
// this order. Compared after trimming, never loosely: a third heading_1, or
// these two swapped, is a malformed edition.
export const LANGUAGE_HEADINGS: Record<Lang, string> = {
  fr: "🇫🇷 Français",
  en: "🇬🇧 English",
}

export type SectionKey =
  | "overview"
  | "depth"
  | "brief"
  | "explainer"
  | "analysis"
  | "techsci"
  | "timeline"
  | "inbrief"
  | "finds"
  | "watch"
  | "closing"

// narrative: written synthesis, paragraphs with inline citations, no ids.
// items: numbered stories, `NN · Title`, each with its own source list.
// bullets: one-line entries, each carrying at least one link, no ids.
export type SectionKind = "narrative" | "items" | "bullets"

export type SectionSpec = {
  key: SectionKey
  kind: SectionKind
  title: Record<Lang, string>
  required: boolean
  // items only. Every substantive story carries its public provenance; "Watch
  // next" looks forward, so a source there is welcome but not required.
  sourcesRequired: boolean
  // items: most items; narrative: the paragraph range the format expects.
  maxItems?: number
  paragraphs?: [number, number]
  // narrative: whether a paragraph count outside the range rejects the edition
  // (the intro and the closing line) or only warns (the analysis).
  strict?: boolean
  // narrative: whether inline links are allowed at all.
  links?: boolean
}

const narrative = (
  key: SectionKey,
  fr: string,
  en: string,
  options: { required?: boolean; paragraphs: [number, number]; strict?: boolean; links?: boolean },
): SectionSpec => ({
  key,
  kind: "narrative",
  title: { fr, en },
  required: options.required ?? false,
  sourcesRequired: false,
  paragraphs: options.paragraphs,
  strict: options.strict ?? false,
  links: options.links ?? true,
})
const items = (key: SectionKey, fr: string, en: string, sourcesRequired = true, maxItems?: number): SectionSpec =>
  ({ key, kind: "items", title: { fr, en }, required: false, sourcesRequired, maxItems })
const bullets = (key: SectionKey, fr: string, en: string): SectionSpec =>
  ({ key, kind: "bullets", title: { fr, en }, required: false, sourcesRequired: false })

// Order is the order sections must appear in, in both languages: an
// explanatory daily brief. A short intro says what tonight's edition holds,
// the focus story and the kicker-led essentials follow, and a closing line
// ends it.
//
// The intro is normally the paragraphs before the first section heading, with
// no heading of its own; the overview heading is still accepted for it.
export const SECTIONS: readonly SectionSpec[] = [
  narrative("overview", "Ce soir", "Tonight", { required: true, paragraphs: [1, 2], strict: true }),
  items("depth", "Le sujet du jour", "Today’s focus", true, 1),
  items("brief", "L’essentiel", "The essentials"),
  items("explainer", "C’est quoi ?", "Explainer", true, 1),
  narrative("analysis", "Analyse", "Analysis", { paragraphs: [2, 3] }),
  items("techsci", "Technologie & science", "Technology & science"),
  bullets("timeline", "Chronologie", "Timeline"),
  bullets("inbrief", "En bref", "In brief"),
  items("finds", "Ça vaut un clic", "Worth a click"),
  items("watch", "À surveiller", "Watch next", false),
  narrative("closing", "Pour finir", "To close", { paragraphs: [1, 1], strict: true, links: false }),
]

// Typed apostrophes drift between ' and ’ depending on the keyboard and on
// Notion's smart quotes, so both spellings of L’essentiel (and of C’est
// quoi ?) are the same section.
const canonical = (text: string) =>
  text.normalize("NFC").replace(/[‘’']/g, "’").replace(/\s+/g, " ").trim()

export const sectionFor = (heading: string, lang: Lang): SectionSpec | undefined =>
  SECTIONS.find((section) => canonical(section.title[lang]) === canonical(heading))

export const sectionIndex = (key: SectionKey) =>
  SECTIONS.findIndex((section) => section.key === key)

// The paragraph that opens an item's source list. French typography puts a
// space before the colon; both forms are accepted there.
export const isSourcesMarker = (text: string, lang: Lang) => {
  const trimmed = text.trim()
  return lang === "fr"
    ? trimmed === "Sources :" || trimmed === "Sources :" || trimmed === "Sources:"
    : trimmed === "Sources:"
}

export const SOURCES_LABEL: Record<Lang, string> = {
  fr: "Sources :",
  en: "Sources:",
}

// `NN · Title`, NN 01–99. ` - ` is accepted when parsing (it is what a quick
// edit types) and normalised to the middle dot on the way out.
export const ITEM_HEADING = /^(\d{2})\s+(?:·|-)\s+(\S.*)$/

// After the id, a story may open with a kicker: a short upper-case topic
// (`03 · CLIMAT · Le titre`, or the kicker alone, `03 · CLIMAT`). A heading
// whose first part has any lower-case letter is a plain title, as in the finds.
export const KICKER = /^[\p{Lu}\p{N}][\p{Lu}\p{N}\p{M} &'’.\-/]{0,39}$/u

export const splitItemTitle = (rest: string): { kicker: string | null; title: string } => {
  const parts = rest.split(/\s+·\s+/)
  const first = parts[0].trim()
  if (!KICKER.test(first)) return { kicker: null, title: rest.trim() }
  const title = parts.slice(1).join(" · ").trim()
  return { kicker: first, title: title || first }
}

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const isValidDate = (date: string) => {
  if (!DATE_PATTERN.test(date)) return false
  const parsed = new Date(`${date}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
}

const MONTHS: Record<Lang, string[]> = {
  fr: [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
}

// Spelled out by hand rather than through Intl: the runner's ICU data decides
// what Intl prints, and a derived file must not change because Node did.
export const longDate = (date: string, lang: Lang) => {
  const [year, month, day] = date.split("-").map(Number)
  const dayText = lang === "fr" && day === 1 ? "1er" : String(day)
  return `${dayText} ${MONTHS[lang][month - 1]} ${year}`
}

export const editionTitle = (date: string, lang: Lang) =>
  `Newsletter · ${longDate(date, lang)}`

// A timeline entry opens with its date: `2026-11-12 — what happened`. The em
// dash is canonical; an en dash or a hyphen is what a quick edit types.
export const TIMELINE_ENTRY = /^(\d{4}-\d{2}-\d{2})\s+[—–-]\s+(\S[\s\S]*)$/
