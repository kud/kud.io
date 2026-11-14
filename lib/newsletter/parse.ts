// Notion page body → typed edition, plus every reason it must not be published.
//
// Pure: the sync script fetches the blocks (children attached under `children`)
// and hands them here, so the whole contract is testable on invented fixtures
// without a network. Parsing never throws on bad content. It collects issues and
// keeps going, so one run reports every problem with an edition rather than the
// first, and the editor fixes them in one pass.

import { hrefsOf, plainText, richText } from "../../scripts/lib/notion-markdown.js"
import {
  ITEM_HEADING,
  LANGS,
  LANGUAGE_HEADINGS,
  SECTIONS,
  TIMELINE_ENTRY,
  isSourcesMarker,
  splitItemTitle,
  isValidDate,
  sectionFor,
  sectionIndex,
  type Lang,
  type SectionKey,
  type SectionKind,
  type SectionSpec,
} from "./sections.ts"
import { redact, scanText } from "./safety.ts"
import { cleanUrl, hostOf, normaliseUrl, urlProblem } from "./url.ts"

// The slice of Notion's block and rich-text objects this module reads.
export type RichTextNode = {
  type?: string
  plain_text?: string
  href?: string | null
  annotations?: Record<string, boolean | string>
  text?: { content?: string; link?: { url: string } | null }
  mention?: { type?: string }
  equation?: { expression: string }
}

export type NotionBlock = {
  type: string
  has_children?: boolean
  children?: NotionBlock[]
  [payload: string]: unknown
}

export type Issue = {
  code: string
  severity: "error" | "warning"
  where: string
  message: string
}

export type Source = { url: string; label: string }

export type RenditionItem = {
  id: string
  kicker: string | null
  section: SectionKey
  title: string
  summary: string
  body: string
  sources: Source[]
}

export type NarrativeKey = "overview" | "analysis" | "closing"
export type BulletKey = "timeline" | "inbrief"
export const NARRATIVE_KEYS: readonly NarrativeKey[] = ["overview", "analysis", "closing"]
export const BULLET_KEYS: readonly BulletKey[] = ["timeline", "inbrief"]

export type Narrative = { markdown: string; paragraphs: number; links: string[] }
export type Bullet = { date?: string; markdown: string; urls: string[] }

export type Rendition = {
  lede: string[]
  sections: Array<{ key: SectionKey; kind: SectionKind; items: string[] }>
  items: RenditionItem[]
  narrative: Partial<Record<NarrativeKey, Narrative>>
  bullets: Partial<Record<BulletKey, Bullet[]>>
}

export type ParsedEdition = {
  date: string
  generatedAt: string | null
  renditions: Record<Lang, Rendition>
}

export type ParseResult = {
  edition: ParsedEdition | null
  issues: Issue[]
}

const BODY_TYPES = new Set([
  "paragraph",
  "bulleted_list_item",
  "numbered_list_item",
  "quote",
])

const MAX_DEPTH = 3

const textOf = (block: NotionBlock): RichTextNode[] =>
  ((block[block.type] as { rich_text?: RichTextNode[] } | undefined)?.rich_text ??
    []) as RichTextNode[]

const indent = (markdown: string, spaces: number) =>
  markdown
    .split("\n")
    .map((line) => (line ? " ".repeat(spaces) + line : line))
    .join("\n")

// Splits a sentence count off a lede paragraph. A heuristic, so a long lede is
// a warning, never a rejection: "U.S." must not hold back an edition.
const sentenceCount = (text: string) =>
  text.split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ«“"])/u).filter((part) => part.trim()).length

class Collector {
  issues: Issue[] = []
  error(code: string, where: string, message: string) {
    this.issues.push({ code, severity: "error", where, message })
  }
  warn(code: string, where: string, message: string) {
    this.issues.push({ code, severity: "warning", where, message })
  }
}

// Every rich-text array on the page goes through here, whatever block it sits
// in: its links are checked as URLs, its text as text, and a mention of a Notion
// user or page (which would publish a workspace name or a private page title) is
// refused. A date mention is just a date.
const inspectRichText = (nodes: RichTextNode[], where: string, out: Collector) => {
  for (const node of nodes) {
    if (node.type === "mention" && node.mention?.type !== "date")
      out.error(
        "PRIVATE_MENTION",
        where,
        `${where}: a Notion ${node.mention?.type ?? "unknown"} mention cannot be published; write it out as plain text`,
      )
  }
  for (const href of hrefsOf(nodes)) {
    const problem = urlProblem(href)
    if (problem)
      out.error(problem, where, `${where}: link to ${hostOf(href)} rejected (${problem})`)
  }
  for (const finding of scanText(plainText(nodes)))
    out.error(finding.code, where, `${where}: text contains ${finding.label}`)
}

const renderBody = (
  block: NotionBlock,
  where: string,
  out: Collector,
  depth = 0,
): string => {
  if (!BODY_TYPES.has(block.type)) {
    out.error(
      "UNSUPPORTED_BLOCK",
      where,
      `${where}: a ${block.type} block is not part of the edition format (paragraphs, lists and quotes only)`,
    )
    return ""
  }
  const nodes = textOf(block)
  inspectRichText(nodes, where, out)
  const text = richText(nodes)
  const children = block.children ?? []
  if (children.length && depth >= MAX_DEPTH) {
    out.error("NESTING_TOO_DEEP", where, `${where}: lists nest at most ${MAX_DEPTH} deep`)
    return text
  }
  const kids = (spaces: number) =>
    children.length
      ? indent(
          children
            .map((child) => renderBody(child, where, out, depth + 1))
            .filter(Boolean)
            .join("\n"),
          spaces,
        )
      : ""

  switch (block.type) {
    case "bulleted_list_item":
      return [`- ${text}`, kids(2)].filter(Boolean).join("\n")
    case "numbered_list_item":
      return [`1. ${text}`, kids(3)].filter(Boolean).join("\n")
    case "quote":
      return [`> ${text}`, kids(2)].filter(Boolean).join("\n")
    default:
      return [text, kids(0)].filter(Boolean).join("\n\n")
  }
}

// One item's blocks, from just after its heading to just before the next one.
const parseItem = (
  id: string,
  title: string,
  section: SectionKey,
  blocks: NotionBlock[],
  lang: Lang,
  where: string,
  out: Collector,
): RenditionItem => {
  const body: string[] = []
  const sources: Source[] = []
  let summary = ""
  let inSources = false
  let sawMarker = false

  for (const block of blocks) {
    const text = plainText(textOf(block))

    if (block.type === "paragraph" && isSourcesMarker(text, lang)) {
      if (sawMarker)
        out.error("SOURCES_DUPLICATE", where, `${where}: more than one Sources list`)
      inSources = true
      sawMarker = true
      continue
    }

    if (inSources) {
      if (block.type !== "bulleted_list_item") {
        out.error(
          "SOURCES_NOT_LAST",
          where,
          `${where}: the Sources list must be a bulleted list ending the item`,
        )
        continue
      }
      const nodes = textOf(block)
      const sourceWhere = `${where} · source ${sources.length + 1}`
      inspectRichText(nodes, sourceWhere, out)
      const links = [...new Set(hrefsOf(nodes))]
      if (links.length !== 1) {
        out.error(
          "SOURCE_LINK_COUNT",
          sourceWhere,
          `${sourceWhere}: each source bullet holds exactly one link (found ${links.length})`,
        )
        continue
      }
      const label = nodes
        .filter((node) => (node.href ?? node.text?.link?.url) === links[0])
        .map((node) => node.plain_text ?? "")
        .join("")
        .trim()
      if (!label)
        out.error("SOURCE_LABEL_MISSING", sourceWhere, `${sourceWhere}: the link needs its publication's name as text`)
      if (block.children?.length)
        out.error("SOURCE_NESTED", sourceWhere, `${sourceWhere}: a source bullet has no sub-items`)
      sources.push({ url: cleanUrl(links[0]), label })
      continue
    }

    const rendered = renderBody(block, where, out)
    if (rendered) body.push(rendered)
    if (!summary && block.type === "paragraph" && text.trim()) summary = text.trim()
  }

  if (!body.length) out.error("ITEM_EMPTY", where, `${where}: the item has no text`)
  if (sawMarker && !sources.length)
    out.error("SOURCES_EMPTY", where, `${where}: "Sources" is followed by no source`)

  const seen = new Set<string>()
  for (const source of sources) {
    const key = normaliseUrl(source.url)
    if (seen.has(key))
      out.error("SOURCE_DUPLICATE", where, `${where}: ${hostOf(source.url)} is listed twice`)
    seen.add(key)
  }

  const { kicker, title: plainTitle } = splitItemTitle(title)
  return { id, kicker, title: plainTitle, section, summary, body: body.join("\n\n"), sources }
}

type Block = { blocks: NotionBlock[]; where: string }

// A narrative section: written synthesis whose citations are inline links on
// the source's name. Its Markdown is published as is.
const parseNarrative = (spec: SectionSpec, blocks: NotionBlock[], lang: Lang, out: Collector): Narrative => {
  const where = `${lang} · ${spec.key}`
  const parts: string[] = []
  const links: string[] = []
  let paragraphs = 0
  for (const block of blocks) {
    if (block.type === "heading_3") continue
    const rendered = renderBody(block, where, out)
    if (rendered) parts.push(rendered)
    collectLinks(block, links)
    if (block.type === "paragraph" && plainText(textOf(block)).trim()) paragraphs += 1
  }
  const [min, max] = spec.paragraphs ?? [1, 99]
  if (spec.links === false && links.length)
    out.error("NARRATIVE_LINK_FORBIDDEN", where, `${where}: "${spec.title[lang]}" carries no links`)
  if (paragraphs && (paragraphs < min || paragraphs > max))
    (spec.strict ? out.error.bind(out) : out.warn.bind(out))(
      "NARRATIVE_LENGTH",
      where,
      `${where}: ${paragraphs} paragraph(s), the format expects ${min} to ${max}`,
    )
  return { markdown: parts.join("\n\n"), paragraphs, links: links.map(cleanUrl) }
}

const collectLinks = (block: NotionBlock, into: string[]) => {
  into.push(...hrefsOf(textOf(block)))
  for (const child of block.children ?? []) collectLinks(child, into)
}

// A bullet section: one entry per top-level bullet, each carrying at least one
// link. Timeline entries also open with their date.
const parseBullets = (spec: SectionSpec, blocks: NotionBlock[], lang: Lang, out: Collector): Bullet[] => {
  const entries: Bullet[] = []
  blocks.forEach((block, index) => {
    const where = `${lang} · ${spec.key} · entry ${index + 1}`
    if (block.type !== "bulleted_list_item") {
      out.error("BULLETS_ONLY", where, `${where}: "${spec.title[lang]}" holds a bulleted list and nothing else`)
      return
    }
    if (block.children?.length)
      out.error("BULLET_NESTED", where, `${where}: an entry has no sub-items`)
    const nodes = textOf(block)
    inspectRichText(nodes, where, out)
    const urls = [...new Set(hrefsOf(nodes).map(cleanUrl))]
    if (!urls.length) out.error("BULLET_LINK_MISSING", where, `${where}: each entry links at least one public source`)
    let markdown = richText(nodes).trim()
    let date: string | undefined
    if (spec.key === "timeline") {
      const match = TIMELINE_ENTRY.exec(markdown)
      if (!match || !isValidDate(match[1])) {
        out.error("TIMELINE_DATE_MALFORMED", where, `${where}: a timeline entry reads "YYYY-MM-DD — event"`)
      } else {
        date = match[1]
        markdown = match[2].trim()
      }
    }
    entries.push({ date, markdown, urls })
  })
  return entries
}

const parseRendition = (blocks: NotionBlock[], lang: Lang, out: Collector): Rendition => {
  const rendition: Rendition = { lede: [], sections: [], items: [], narrative: {}, bullets: {} }

  // First split the rendition at its section headings; each section then
  // parses by its kind.
  const chunks: Array<{ spec: SectionSpec; blocks: NotionBlock[] }> = []
  let current: { spec: SectionSpec; blocks: NotionBlock[] } | undefined
  let discarding = false
  const intro: NotionBlock[] = []
  for (const block of blocks) {
    if (block.type === "heading_2") {
      const heading = plainText(textOf(block)).trim()
      const spec = sectionFor(heading, lang)
      if (!spec) {
        out.error("UNKNOWN_SECTION", lang, `${lang}: "${redact(heading, 60)}" is not one of the edition's sections`)
        current = undefined
        discarding = true
        continue
      }
      const previous = chunks.at(-1)
      if (chunks.some((c) => c.spec.key === spec.key))
        out.error("SECTION_DUPLICATE", lang, `${lang}: section "${spec.title[lang]}" appears twice`)
      else if (previous && sectionIndex(previous.spec.key) > sectionIndex(spec.key))
        out.error("SECTION_ORDER", lang, `${lang}: section "${spec.title[lang]}" is out of order`)
      current = { spec, blocks: [] }
      chunks.push(current)
      discarding = false
      continue
    }
    if (current) current.blocks.push(block)
    else if (discarding) continue
    else if (block.type === "paragraph") intro.push(block)
    else if (block.type === "heading_3")
      out.error("ITEM_OUTSIDE_SECTION", lang, `${lang}: an item must sit under a section heading`)
    else
      out.error("UNEXPECTED_BLOCK", lang, `${lang}: a ${block.type} block sits before the first section`)
  }

  // Paragraphs before the first heading are the intro, the overview section
  // written without its heading. Both forms at once would be two intros.
  if (intro.some((block) => plainText(textOf(block)).trim())) {
    if (chunks.some((c) => c.spec.key === "overview"))
      out.error("OVERVIEW_TWICE", lang, `${lang}: the intro is written both before the sections and under its heading`)
    else chunks.unshift({ spec: SECTIONS[0], blocks: intro })
  }
  const overviewChunk = chunks.find((c) => c.spec.key === "overview")
  rendition.lede = (overviewChunk?.blocks ?? [])
    .filter((block) => block.type === "paragraph")
    .map((block) => plainText(textOf(block)).trim())
    .filter(Boolean)

  let lastId = 0
  const ids = new Set<string>()

  for (const { spec, blocks: sectionBlocks } of chunks) {
    const where = `${lang} · ${spec.key}`
    const entry = { key: spec.key, kind: spec.kind, items: [] as string[] }
    rendition.sections.push(entry)

    if (spec.kind !== "items") {
      const strayItem = sectionBlocks.find((b) => b.type === "heading_3")
      if (strayItem)
        out.error("ITEM_IN_UNNUMBERED_SECTION", where, `${where}: "${spec.title[lang]}" has no numbered items`)
    }

    if (spec.kind === "narrative") {
      const narrative = parseNarrative(spec, sectionBlocks, lang, out)
      rendition.narrative[spec.key as NarrativeKey] = narrative
      if (!narrative.markdown) out.error("SECTION_EMPTY", where, `${where}: section "${spec.title[lang]}" is empty`)
      continue
    }

    if (spec.kind === "bullets") {
      const entries = parseBullets(spec, sectionBlocks, lang, out)
      rendition.bullets[spec.key as BulletKey] = entries
      if (!sectionBlocks.length) out.error("SECTION_EMPTY", where, `${where}: section "${spec.title[lang]}" is empty`)
      continue
    }

    let item: (Block & { id: string; title: string }) | undefined
    const closeItem = () => {
      if (!item) return
      rendition.items.push(parseItem(item.id, item.title, spec.key, item.blocks, lang, item.where, out))
      entry.items.push(item.id)
      item = undefined
    }
    for (const block of sectionBlocks) {
      if (block.type === "heading_3") {
        closeItem()
        const heading = plainText(textOf(block)).trim()
        const headingWhere = `${lang} · "${redact(heading, 40)}"`
        const match = ITEM_HEADING.exec(heading)
        if (!match || match[1] === "00") {
          out.error("ITEM_ID_MALFORMED", headingWhere, `${headingWhere}: an item heading reads "NN · Title", NN from 01 to 99`)
          continue
        }
        const [, id, title] = match
        const itemWhere = `${lang} · item ${id}`
        inspectRichText(textOf(block), itemWhere, out)
        if (ids.has(id)) out.error("ITEM_ID_DUPLICATE", itemWhere, `${itemWhere}: id used twice`)
        else if (Number(id) <= lastId)
          out.error("ITEM_ID_ORDER", itemWhere, `${itemWhere}: ids must ascend through the edition`)
        ids.add(id)
        lastId = Math.max(lastId, Number(id))
        item = { id, title: title.trim(), blocks: [], where: itemWhere }
        continue
      }
      if (item) item.blocks.push(block)
      else
        out.error(
          "UNEXPECTED_BLOCK",
          where,
          `${where}: a ${block.type} block sits between the section heading and its first item`,
        )
    }
    closeItem()
    if (!entry.items.length) out.error("SECTION_EMPTY", where, `${where}: section "${spec.title[lang]}" has no items`)
    if (spec.maxItems && entry.items.length > spec.maxItems)
      out.error("SECTION_TOO_MANY", where, `${where}: "${spec.title[lang]}" holds at most ${spec.maxItems} item(s)`)
  }

  for (const spec of SECTIONS)
    if (spec.required && !chunks.some((c) => c.spec.key === spec.key))
      out.error("SECTION_MISSING", lang, `${lang}: section "${spec.title[lang]}" is required`)
  if (!rendition.items.length) out.error("EDITION_EMPTY", lang, `${lang}: the rendition has no numbered stories`)
  if (rendition.lede.length && sentenceCount(rendition.lede.join(" ")) > 4)
    out.warn("INTRO_LONG", `${lang} · overview`, `${lang}: the intro runs past four sentences`)

  return rendition
}

const linkSet = (urls: string[]) => [...new Set(urls.map(normaliseUrl))].sort().join("\n")

// The French and English renditions are one edition told twice: same sections,
// same items in the same places, same sources, same links in every narrative
// and list. Labels and prose may differ.
const compareRenditions = (fr: Rendition, en: Rendition, out: Collector) => {
  const keys = (r: Rendition) => r.sections.map((s) => s.key).join(",")
  if (keys(fr) !== keys(en))
    out.error("SECTION_MISMATCH", "fr/en", `fr/en: sections differ (fr: ${keys(fr) || "none"}; en: ${keys(en) || "none"})`)

  const ids = (r: Rendition) => r.items.map((i) => i.id).join(",")
  if (ids(fr) !== ids(en))
    out.error("ITEM_MISMATCH", "fr/en", `fr/en: item ids differ (fr: ${ids(fr) || "none"}; en: ${ids(en) || "none"})`)

  for (const frItem of fr.items) {
    const enItem = en.items.find((i) => i.id === frItem.id)
    if (!enItem) continue
    const where = `item ${frItem.id}`
    if ((enItem.kicker === null) !== (frItem.kicker === null))
      out.error("KICKER_MISMATCH", where, `${where}: a kicker in one language and not the other`)
    if (enItem.section !== frItem.section)
      out.error("ITEM_SECTION_MISMATCH", where, `${where}: in ${frItem.section} in French, ${enItem.section} in English`)
    if (linkSet(frItem.sources.map((s) => s.url)) !== linkSet(enItem.sources.map((s) => s.url)))
      out.error("SOURCE_MISMATCH", where, `${where}: French and English cite different sources`)
  }

  for (const key of NARRATIVE_KEYS) {
    const a = fr.narrative[key]
    const b = en.narrative[key]
    if (a && b && linkSet(a.links) !== linkSet(b.links))
      out.error("LINK_MISMATCH", key, `${key}: French and English cite different links`)
  }

  for (const key of BULLET_KEYS) {
    const a = fr.bullets[key]
    const b = en.bullets[key]
    if (!a || !b) continue
    if (a.length !== b.length) {
      out.error("BULLET_COUNT_MISMATCH", key, `${key}: ${a.length} entries in French, ${b.length} in English`)
      continue
    }
    a.forEach((entry, index) => {
      const where = `${key} · entry ${index + 1}`
      if (entry.date !== b[index].date)
        out.error("TIMELINE_DATE_MISMATCH", where, `${where}: French and English give different dates`)
      if (linkSet(entry.urls) !== linkSet(b[index].urls))
        out.error("LINK_MISMATCH", where, `${where}: French and English cite different links`)
    })
  }
}

// Provenance belongs to the stories a reader can select: every citation in the
// written overview and analysis must also be one of some item's sources, so the
// research prompt built from the selected stories carries it.
const checkNarrativeProvenance = (rendition: Rendition, lang: Lang, out: Collector) => {
  const sourced = new Set(rendition.items.flatMap((item) => item.sources.map((s) => normaliseUrl(s.url))))
  for (const key of NARRATIVE_KEYS) {
    const narrative = rendition.narrative[key]
    if (!narrative) continue
    for (const link of narrative.links)
      if (!sourced.has(normaliseUrl(link)))
        out.error(
          "NARRATIVE_LINK_UNSOURCED",
          `${lang} · ${key}`,
          `${lang} · ${key}: the link to ${hostOf(link)} is not among any story's sources`,
        )
  }
}

const checkRequiredSources = (rendition: Rendition, lang: Lang, out: Collector) => {
  for (const item of rendition.items) {
    const spec = SECTIONS.find((s) => s.key === item.section)
    if (spec?.sourcesRequired && !item.sources.length)
      out.error(
        "MISSING_SOURCES",
        `${lang} · item ${item.id}`,
        `${lang} · item ${item.id}: every item in "${spec.title[lang]}" needs a "${lang === "fr" ? "Sources :" : "Sources:"}" list`,
      )
  }
}

export type EditionMeta = { date: string; generatedAt?: string | null }

export const parseEdition = (blocks: NotionBlock[], meta: EditionMeta): ParseResult => {
  const out = new Collector()

  if (!isValidDate(meta.date))
    out.error("DATE_INVALID", "page", "page: the Date property must be a calendar date (YYYY-MM-DD)")

  const headings = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.type === "heading_1")
  const expected = LANGS.map((lang) => LANGUAGE_HEADINGS[lang])
  const found = headings.map(({ block }) => plainText(textOf(block)).trim())

  for (const heading of found)
    if (!expected.includes(heading))
      out.error("UNKNOWN_LANGUAGE_HEADING", "page", `page: "${redact(heading, 60)}" is not a language heading`)
  for (const heading of expected) {
    const count = found.filter((h) => h === heading).length
    if (count === 0) out.error("MISSING_LANGUAGE", "page", `page: no "${heading}" heading`)
    if (count > 1) out.error("DUPLICATE_LANGUAGE", "page", `page: "${heading}" appears ${count} times`)
  }
  if (
    found.length === 2 &&
    found[0] === LANGUAGE_HEADINGS.en &&
    found[1] === LANGUAGE_HEADINGS.fr
  )
    out.error("LANGUAGE_ORDER", "page", "page: French comes first, then English")

  if (out.issues.some((issue) => issue.severity === "error"))
    return { edition: null, issues: out.issues }

  // Whatever precedes the French heading is the editor's scratch space and is
  // never published, nor scanned: it never leaves Notion.
  const [frStart, enStart] = headings.map(({ index }) => index)
  const renditions = {
    fr: parseRendition(blocks.slice(frStart + 1, enStart), "fr", out),
    en: parseRendition(blocks.slice(enStart + 1), "en", out),
  }
  for (const lang of LANGS) {
    checkRequiredSources(renditions[lang], lang, out)
    checkNarrativeProvenance(renditions[lang], lang, out)
  }
  compareRenditions(renditions.fr, renditions.en, out)

  const failed = out.issues.some((issue) => issue.severity === "error")
  return {
    edition: failed
      ? null
      : { date: meta.date, generatedAt: meta.generatedAt ?? null, renditions },
    issues: out.issues,
  }
}

export const errorsOf = (issues: Issue[]) => issues.filter((i) => i.severity === "error")
