import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import { unified } from "unified"
import type { Lang } from "./language.ts"
import { itemAnchor } from "./language.ts"
import { isSourcesMarker } from "./sections.ts"
import type { LoadedEdition } from "./content.ts"

// What the listen button reads: the edition as plain spoken text, in reading
// order, one passage per paragraph. Short passages are what make the browser's
// speech synthesis behave: Chrome cuts a long utterance off mid-sentence, and
// pausing on a paragraph boundary is the only pause every engine honours. Each
// passage names the element it belongs to, so the page can mark and follow it.
//
// Read: the intro, the analysis, every story (its number, kicker and title,
// then its body) and the closing line. Skipped: the timeline and in-brief
// bullets (dates and links, not prose), every source list, URLs, footnote
// markers and the citation arrows, which are drawn by the page, not written.

export type Passage = { target: string; text: string }

type Node = {
  type: string
  value?: string
  children?: Node[]
  url?: string
}

const URL_LIKE = /^(?:https?:\/\/|www\.)\S+$/i

// A link reads as its words; an autolinked bare URL has no words worth saying.
const inline = (node: Node): string => {
  if (node.type === "text" || node.type === "inlineCode")
    return (node.value ?? "").replace(/https?:\/\/\S+/g, "")
  if (node.type === "break") return " "
  if (node.type === "footnoteReference" || node.type === "html") return ""
  const text = (node.children ?? []).map(inline).join("")
  if (node.type === "link" && URL_LIKE.test(text.trim())) return ""
  return text
}

// The middle dot that separates a date or a label from its sentence in the
// bodies (`**11 September 2001** · The first…`) is read as a full stop.
const tidy = (text: string) =>
  text
    .replace(/\s+·\s+/g, ". ")
    .replace(/\[\^?\d+\]/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;:!?])(?!\S)/g, (match, mark: string) =>
      // French keeps its space before high punctuation.
      /[;:!?]/.test(mark) ? match : mark,
    )
    .replace(/\s+/g, " ")
    .trim()

const blocks = (node: Node, lang: Lang, out: string[]) => {
  for (const child of node.children ?? []) {
    switch (child.type) {
      case "paragraph":
      case "heading": {
        const text = tidy(inline(child))
        if (isSourcesMarker(text, lang) || isSourcesMarker(`${text}:`, lang))
          return true
        if (text) out.push(text)
        break
      }
      case "list":
        for (const item of child.children ?? []) {
          const text = tidy(
            inline({
              type: "item",
              children: (item.children ?? []).flatMap(
                (part) => part.children ?? [part],
              ),
            }),
          )
          if (text) out.push(text)
        }
        break
      case "blockquote":
        if (blocks(child, lang, out)) return true
        break
      default:
        // Code, tables, rules and raw HTML have nothing to say aloud.
        break
    }
  }
  return false
}

// Markdown to spoken paragraphs. Everything from a "Sources:" line on is the
// item's provenance, which the page lists and the voice leaves out.
export const spokenParagraphs = (markdown: string, lang: Lang) => {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Node
  const out: string[] = []
  blocks(tree, lang, out)
  return out
}

// Kickers are set in capitals (`TRANSPORT AÉRIEN`), which some voices spell
// out letter by letter. Sentence case reads as words; a short word (US, IA)
// stays an acronym.
const speakable = (kicker: string, lang: Lang) =>
  kicker
    .split(/(\s+)/)
    .map((word, index) => {
      if (/^\s+$/.test(word) || word.length <= 2) return word
      const lower = word.toLocaleLowerCase(lang === "fr" ? "fr-FR" : "en-GB")
      return index === 0
        ? lower.charAt(0).toLocaleUpperCase() + lower.slice(1)
        : lower
    })
    .join("")

const NUMBER: Record<Lang, (n: number) => string> = {
  fr: (n) => `Numéro ${n}.`,
  en: (n) => `Number ${n}.`,
}

const end = (text: string) => (/[.!?…»”"]$/.test(text) ? text : `${text}.`)

type Readable = Pick<
  LoadedEdition,
  "narrative" | "sections" | "items" | "bodies"
>

export const listeningScript = (edition: Readable, lang: Lang): Passage[] => {
  const byId = new Map(edition.items.map((item) => [item.id, item]))
  const passages: Passage[] = []
  const add = (target: string, texts: string[]) =>
    texts.forEach((text) => passages.push({ target, text }))

  for (const section of edition.sections) {
    const target = `section-${section.key}`
    if (section.kind === "narrative") {
      const markdown =
        edition.narrative[section.key as "overview" | "analysis" | "closing"]?.[
          lang
        ]
      if (markdown) add(target, spokenParagraphs(markdown, lang))
      continue
    }
    if (section.kind !== "items") continue
    const items = section.items
      .map((id) => byId.get(id))
      .filter((item) => item !== undefined)
    if (items.length === 0) continue
    add(target, [end(section.title[lang])])
    for (const item of items) {
      const anchor = itemAnchor(item.id)
      const kicker = item.kicker?.[lang]
      const title = item.title[lang]
      const heading = [
        NUMBER[lang](Number(item.id)),
        kicker ? end(speakable(kicker, lang)) : null,
        kicker !== title ? end(title) : null,
      ]
        .filter(Boolean)
        .join(" ")
      add(anchor, [heading])
      add(
        anchor,
        spokenParagraphs(
          edition.bodies[lang][item.id] || item.summary[lang],
          lang,
        ),
      )
    }
  }
  return passages
}
