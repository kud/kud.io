// Builders for invented Notion block trees, for the newsletter tests only.
// Every title, host and claim here is fictional; real public hosts appear only
// where an allow-list rule is the thing under test.

import type { NotionBlock, RichTextNode } from "./parse.ts"

export const t = (text: string, href?: string): RichTextNode => ({
  type: "text",
  plain_text: text,
  href: href ?? null,
  text: { content: text, link: href ? { url: href } : null },
  annotations: {},
})

const block = (type: string, rich: Array<RichTextNode | string>, children?: NotionBlock[]): NotionBlock => ({
  type,
  has_children: Boolean(children?.length),
  ...(children ? { children } : {}),
  [type]: { rich_text: rich.map((r) => (typeof r === "string" ? t(r) : r)) },
})

export const h1 = (text: string) => block("heading_1", [text])
export const h2 = (text: string) => block("heading_2", [text])
export const h3 = (text: string) => block("heading_3", [text])
export const p = (...rich: Array<RichTextNode | string>) => block("paragraph", rich)
export const li = (rich: Array<RichTextNode | string>, children?: NotionBlock[]) =>
  block("bulleted_list_item", rich, children)
export const ol = (...rich: Array<RichTextNode | string>) => block("numbered_list_item", rich)
export const quote = (...rich: Array<RichTextNode | string>) => block("quote", rich)
export const image = (): NotionBlock => ({ type: "image", image: { type: "external", external: { url: "https://example.org/a.png" } } })
export const mention = (kind: string): RichTextNode => ({
  type: "mention",
  plain_text: "@Somebody",
  mention: { type: kind },
})

export const sources = (lang: "fr" | "en", list: Array<[string, string]>) => [
  p(lang === "fr" ? "Sources :" : "Sources:"),
  ...list.map(([label, url]) => li([t(label, url)])),
]

type ItemSpec = {
  id: string
  title: [string, string]
  body?: [string, string]
  sources?: Array<[string, string, string]> // url, fr label, en label
}

// An items section, or (with `blocks`) any other kind written out by hand.
type SectionSpec = {
  fr: string
  en: string
  items: ItemSpec[]
  blocks?: { fr: NotionBlock[]; en: NotionBlock[] }
}

// The intro: one paragraph saying what the edition holds, citing two stories.
export const introBlock = (lang: "fr" | "en") =>
  lang === "fr"
    ? p("Ce soir, on revient sur le port de Glassmere (", t("Le Quotidien fictif", SRC_A[0]), ") et sur une ", t("étude", SRC_B[0]), ". Et une trouvaille qui mérite un clic.")
    : p("Tonight, back to Glassmere’s harbour (", t("The Fictional Daily", SRC_A[0]), ") and an ", t("invented study", SRC_B[0]), ". And one find worth a click.")

const rendition = (lang: "fr" | "en", intro: string | null | undefined, spec: SectionSpec[], overview: "plain" | "heading" | false) => {
  const out: NotionBlock[] = []
  if (overview === "heading") out.push(h2(OVERVIEW[lang]))
  if (overview) out.push(intro === undefined ? introBlock(lang) : p(intro ?? ""))
  for (const section of spec) {
    out.push(h2(section[lang]))
    if (section.blocks) {
      out.push(...section.blocks[lang])
      continue
    }
    for (const item of section.items) {
      const i = lang === "fr" ? 0 : 1
      out.push(h3(`${item.id} · ${item.title[i]}`))
      out.push(p(item.body?.[i] ?? (lang === "fr" ? "Un paragraphe inventé." : "An invented paragraph.")))
      if (item.sources)
        out.push(
          ...sources(
            lang,
            item.sources.map(([url, frLabel, enLabel]) => [lang === "fr" ? frLabel : enLabel, url]),
          ),
        )
    }
  }
  return out
}

export const OVERVIEW = { fr: "L’essentiel du jour", en: "Today’s briefing" }
export const BRIEF = { fr: "L’essentiel", en: "The essentials" }
export const DEPTH = { fr: "Le sujet du jour", en: "Today’s focus" }
export const EXPLAINER = { fr: "C’est quoi ?", en: "Explainer" }
export const CLOSING = { fr: "Pour finir", en: "To close" }
export const ANALYSIS = { fr: "Analyse", en: "Analysis" }
export const TIMELINE = { fr: "Chronologie", en: "Timeline" }
export const INBRIEF = { fr: "En bref", en: "In brief" }
export const FINDS = { fr: "Ça vaut un clic", en: "Worth a click" }
export const WATCH = { fr: "À surveiller", en: "Watch next" }

export const SRC_A: [string, string, string] = ["https://news.example.org/story/1", "Le Quotidien fictif", "The Fictional Daily"]
export const SRC_B: [string, string, string] = ["https://research.example.net/paper", "Étude inventée", "Invented study"]
export const SRC_C: [string, string, string] = ["https://tools.example.com/", "Outil exemple", "Example tool"]

export const sampleSpec = (): SectionSpec[] => [
  {
    ...BRIEF,
    items: [
      {
        id: "01",
        title: ["GLASSMERE · Le canal rouvre", "GLASSMERE · The canal reopens"],
        body: [
          "Après deux ans de travaux, le canal fictif rouvre au trafic.",
          "After two years of works, the fictional canal reopens to traffic.",
        ],
        sources: [SRC_A, SRC_B],
      },
      {
        id: "02",
        title: ["OSTRAVA-SUR-MER", "OSTRAVA-ON-SEA"],
        sources: [SRC_B],
      },
    ],
  },
  { ...FINDS, items: [{ id: "03", title: ["Un atlas des phares", "An atlas of lighthouses"], sources: [SRC_C] }] },
  { ...WATCH, items: [{ id: "04", title: ["Le vote de demain", "Tomorrow’s vote"] }] },
]

export const editionBlocks = (
  spec: SectionSpec[] = sampleSpec(),
  options: { frLede?: string; enLede?: string; en?: SectionSpec[]; overview?: "plain" | "heading" | false } = {},
) => [
  h1("🇫🇷 Français"),
  ...rendition("fr", options.frLede, spec, options.overview ?? "plain"),
  h1("🇬🇧 English"),
  ...rendition("en", options.enLede, options.en ?? spec, options.overview ?? "plain"),
]
