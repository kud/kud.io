import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { countWords, deriveFiles, toEditionJson, toMarkdown } from "./derive.ts"
import {
  ANALYSIS,
  BRIEF,
  CLOSING,
  DEPTH,
  EXPLAINER,
  INBRIEF,
  OVERVIEW,
  TIMELINE,
  FINDS,
  SRC_A,
  SRC_B,
  WATCH,
  editionBlocks,
  h1,
  h2,
  h3,
  image,
  li,
  mention,
  p,
  quote,
  sampleSpec,
  sources,
  t,
} from "./fixtures.ts"
import { errorsOf, parseEdition, type NotionBlock } from "./parse.ts"
import { redact, scanText } from "./safety.ts"
import { editionTitle, isValidDate, sectionFor, sectionIndex } from "./sections.ts"
import { cleanUrl, normaliseUrl, urlProblem } from "./url.ts"

const DATE = "2026-11-14"
const parse = (blocks: NotionBlock[]) => parseEdition(blocks, { date: DATE, generatedAt: "2026-11-14T18:05:00.000Z" })
const codes = (blocks: NotionBlock[]) => errorsOf(parse(blocks).issues).map((i) => i.code)

// Replaces the n-th block matching `test` (0-based among matches).
const swap = (blocks: NotionBlock[], test: (b: NotionBlock) => boolean, replacement: NotionBlock[], n = 0) => {
  let seen = -1
  return blocks.flatMap((b) => (test(b) && ++seen === n ? replacement : [b]))
}
const isText = (b: NotionBlock, text: string) =>
  ((b[b.type] as { rich_text?: Array<{ plain_text?: string }> })?.rich_text ?? [])
    .map((r) => r.plain_text)
    .join("") === text

describe("url rules", () => {
  it("accepts ordinary public https links", () => {
    for (const url of [
      "https://www.bbc.co.uk/news",
      "https://www.lemonde.fr/international/",
      "https://arxiv.org/abs/2401.00001",
      "https://github.com/example/project",
      "https://www.figma.com/community/file/123",
      "https://news.example.org/a?page=2&utm_source=x",
    ])
      assert.equal(urlProblem(url), undefined, url)
  })

  it("rejects each unsafe shape with its own code", () => {
    const cases: Array<[string, string]> = [
      ["not a url", "URL_INVALID"],
      ["http://example.org/", "URL_NOT_HTTPS"],
      ["ftp://example.org/", "URL_NOT_HTTPS"],
      ["https://user:pass@example.org/", "URL_CREDENTIALS"],
      ["https://192.168.1.10/admin", "URL_IP_HOST"],
      ["https://[::1]/", "URL_IP_HOST"],
      ["https://localhost/", "URL_PRIVATE_HOST"],
      ["https://intranet/", "URL_PRIVATE_HOST"],
      ["https://nas.local/share", "URL_PRIVATE_HOST"],
      ["https://wiki.corp/page", "URL_PRIVATE_HOST"],
      ["https://build.internal/x", "URL_PRIVATE_HOST"],
      ["https://mail.google.com/mail/u/0/#inbox", "URL_PRIVATE_SERVICE"],
      ["https://docs.google.com/document/d/abc/edit", "URL_PRIVATE_SERVICE"],
      ["https://drive.google.com/file/d/abc", "URL_PRIVATE_SERVICE"],
      ["https://www.notion.so/Some-page-1234", "URL_PRIVATE_SERVICE"],
      ["https://someone.notion.site/page", "URL_PRIVATE_SERVICE"],
      ["https://app.todoist.com/app/task/1", "URL_PRIVATE_SERVICE"],
      ["https://team.slack.com/archives/C1", "URL_PRIVATE_SERVICE"],
      ["https://acme.atlassian.net/browse/X-1", "URL_PRIVATE_SERVICE"],
      ["https://linear.app/acme/issue/X-1", "URL_PRIVATE_SERVICE"],
      ["https://www.figma.com/file/abc/Design", "URL_PRIVATE_SERVICE"],
      ["https://www.dropbox.com/s/abc/file.pdf", "URL_PRIVATE_SERVICE"],
      ["https://app.raindrop.io/my/0", "URL_PRIVATE_SERVICE"],
      ["https://e.pcloud.link/publink/show?code=x", "URL_PRIVATE_SERVICE"],
      ["https://my-site-git-branch.vercel.app/", "URL_PRIVATE_SERVICE"],
      ["https://cdn.example.org/f.pdf?token=abc", "URL_SECRET_PARAM"],
      ["https://cdn.example.org/f.pdf?X-Amz-Signature=abc", "URL_SECRET_PARAM"],
      ["https://cdn.example.org/f.pdf?x-goog-credential=abc", "URL_SECRET_PARAM"],
      ["https://cdn.example.org/f.pdf?Expires=1&Signature=2", "URL_SECRET_PARAM"],
      ["https://api.example.org/v1?apikey=1", "URL_SECRET_PARAM"],
      ["https://api.example.org/v1?client_secret=1", "URL_SECRET_PARAM"],
    ]
    for (const [url, code] of cases) assert.equal(urlProblem(url), code, url)
  })

  it("normalises the spellings of one link to one key", () => {
    const key = normaliseUrl("https://News.Example.org/story/1/?utm_source=feed&fbclid=1")
    assert.equal(key, normaliseUrl("https://news.example.org/story/1"))
    assert.equal(normaliseUrl("https://example.org/"), normaliseUrl("https://EXAMPLE.org"))
    assert.notEqual(normaliseUrl("https://example.org/a?id=1"), normaliseUrl("https://example.org/a?id=2"))
  })

  it("keeps meaningful query parameters when cleaning", () => {
    assert.equal(cleanUrl("https://example.org/a?id=7&utm_medium=x&gclid=y"), "https://example.org/a?id=7")
  })
})

describe("text safety", () => {
  it("flags private-looking text without echoing it", () => {
    const cases: Array<[string, string]> = [
      ["Write to someone@example.org for details", "TEXT_EMAIL"],
      ["Call +44 20 7946 0000 today", "TEXT_PHONE"],
      ["Appelez le 06 12 34 56 78", "TEXT_PHONE"],
      ["Pay FR76 3000 6000 0112 3456 7890 189", "TEXT_IBAN"],
      ["key sk-abcdefghijklmnopqrstuv", "TEXT_API_KEY"],
      ["ghp_abcdefghijklmnopqrstuvwxyz0123", "TEXT_API_KEY"],
      ["AKIAABCDEFGHIJKLMNOP", "TEXT_API_KEY"],
      ["xoxb-1234567890-abcdef", "TEXT_API_KEY"],
      ["hash 0123456789abcdef0123456789abcdef", "TEXT_TOKEN"],
    ]
    for (const [text, code] of cases)
      assert.ok(scanText(text).some((f) => f.code === code), `${code}: ${text}`)
  })

  it("leaves ordinary editorial prose alone", () => {
    for (const text of [
      "1 200 000 people voted in 2025-2026, up 3.4%.",
      "Le PIB a progressé de 0,3 % au troisième trimestre 2026.",
      "The UN's COP31 talks open on 9 November.",
      "Inflation fell to 2.1% (from 2.4%).",
      "A €45bn package, approved 312 votes to 201.",
    ])
      assert.deepEqual(scanText(text), [], text)
  })

  it("redacts and truncates error text", () => {
    const out = redact("failed for someone@example.org with sk-abcdefghijklmnopqrstuv")
    assert.ok(!out.includes("someone@example.org"))
    assert.ok(!out.includes("sk-abc"))
    assert.equal(redact("x".repeat(500), 50).length, 50)
  })
})

describe("sections and dates", () => {
  it("accepts both apostrophes in L’essentiel", () => {
    assert.equal(sectionFor("L'essentiel du jour", "fr")?.key, "overview")
    assert.equal(sectionFor("L’essentiel du jour", "fr")?.key, "overview")
    assert.equal(sectionFor("Today's briefing", "en")?.key, "overview")
    assert.equal(sectionFor("The essentials", "fr"), undefined)
    assert.equal(sectionFor("C'est quoi\u00a0?", "fr")?.key, "explainer")
  })

  it("validates calendar dates and spells titles out", () => {
    assert.ok(isValidDate("2026-11-14"))
    assert.ok(!isValidDate("2026-02-30"))
    assert.ok(!isValidDate("14/11/2026"))
    assert.equal(editionTitle("2026-11-01", "fr"), "Newsletter · 1er novembre 2026")
    assert.equal(editionTitle("2026-11-14", "en"), "Newsletter · 14 November 2026")
  })
})

describe("parseEdition: the valid path", () => {
  it("parses the sample edition with no errors", () => {
    const { edition, issues } = parse(editionBlocks())
    assert.deepEqual(errorsOf(issues), [])
    assert.ok(edition)
    assert.deepEqual(edition.renditions.fr.sections.map((s) => s.key), ["overview", "brief", "finds", "watch"])
    assert.deepEqual(edition.renditions.en.items.map((i) => i.id), ["01", "02", "03", "04"])
    assert.match(edition.renditions.en.lede[0], /^Tonight, back to Glassmere’s harbour/)
    assert.equal(edition.renditions.en.items[0].kicker, "GLASSMERE")
    assert.equal(edition.renditions.en.items[0].title, "The canal reopens")
    assert.equal(edition.renditions.fr.items[1].kicker, "OSTRAVA-SUR-MER")
    assert.equal(edition.renditions.fr.items[2].kicker, null)
    assert.equal(edition.renditions.fr.items[0].summary, "Après deux ans de travaux, le canal fictif rouvre au trafic.")
  })

  it("ignores editor notes before the French heading, even unsafe ones", () => {
    const blocks = [p("note: ask someone@example.org"), image(), ...editionBlocks()]
    assert.deepEqual(codes(blocks), [])
  })

  it("accepts ` - ` as the id separator and normalises it", () => {
    const blocks = swap(editionBlocks(), (b) => isText(b, "01 · GLASSMERE · The canal reopens"), [h3("01 - GLASSMERE · The canal reopens")])
    const { edition } = parse(blocks)
    assert.ok(edition)
    assert.match(toMarkdown(edition, "en"), /### 01 · GLASSMERE · The canal reopens \{#item-01\}/)
  })

  it("accepts lists, quotes and links in an item body", () => {
    const blocks = swap(editionBlocks(), (b) => isText(b, "An invented paragraph."), [
      p("Context with a ", t("link", "https://example.org/context"), "."),
      li(["first point"], [li(["nested point"])]),
      quote("A quoted line."),
    ])
    const { edition, issues } = parse(blocks)
    assert.deepEqual(errorsOf(issues), [])
    assert.match(edition!.renditions.en.items[1].body, /- first point\n  - nested point/)
  })

  it("lets a watch item go without sources", () => {
    assert.deepEqual(codes(editionBlocks()), [])
  })

  it("compares source sets order-insensitively and by normalised URL", () => {
    const en = sampleSpec()
    en[0].items[0].sources = [
      [SRC_B[0], SRC_B[1], SRC_B[2]],
      ["https://NEWS.example.org/story/1/?utm_source=x", SRC_A[1], SRC_A[2]],
    ]
    assert.deepEqual(codes(editionBlocks(sampleSpec(), { en })), [])
  })

  it("warns, never fails, on a long intro", () => {
    const { issues } = parse(editionBlocks(sampleSpec(), { frLede: "Un. Deux. Trois. Quatre. Cinq.", enLede: "One. Two. Three. Four. Five." }))
    assert.deepEqual(errorsOf(issues), [])
    assert.ok(issues.some((i) => i.code === "INTRO_LONG"))
  })
})

describe("parseEdition: structure errors", () => {
  it("rejects a missing, duplicated, unknown or reversed language heading", () => {
    const blocks = editionBlocks()
    assert.ok(codes(blocks.filter((b) => !isText(b, "🇬🇧 English"))).includes("MISSING_LANGUAGE"))
    assert.ok(codes([...blocks, h1("🇬🇧 English")]).includes("DUPLICATE_LANGUAGE"))
    assert.ok(codes([...blocks, h1("🇩🇪 Deutsch")]).includes("UNKNOWN_LANGUAGE_HEADING"))
    const frStart = blocks.findIndex((b) => isText(b, "🇬🇧 English"))
    const reversed = [...blocks.slice(frStart), ...blocks.slice(0, frStart)]
    assert.ok(codes(reversed).includes("LANGUAGE_ORDER"))
  })

  it("rejects an unknown, duplicated, out-of-order or empty section", () => {
    assert.ok(codes(swap(editionBlocks(), (b) => isText(b, "Worth a click"), [h2("Finds")])).includes("UNKNOWN_SECTION"))
    assert.ok(codes(swap(editionBlocks(), (b) => isText(b, "The essentials"), [h2("The stories")])).includes("UNKNOWN_SECTION"))
    const outOfOrder = editionBlocks([
      { ...FINDS, items: [{ id: "01", title: ["a", "a"], sources: [SRC_A] }] },
      { ...BRIEF, items: [{ id: "02", title: ["b", "b"], sources: [SRC_A] }] },
    ])
    assert.ok(codes(outOfOrder).includes("SECTION_ORDER"))
    const empty = editionBlocks([{ ...BRIEF, items: [] }, { ...WATCH, items: [{ id: "01", title: ["a", "a"], sources: [SRC_A, SRC_B] }] }])
    assert.ok(codes(empty).includes("SECTION_EMPTY"))
    const dup = editionBlocks([
      { ...BRIEF, items: [{ id: "01", title: ["a", "a"], sources: [SRC_A] }] },
      { ...BRIEF, items: [{ id: "02", title: ["b", "b"], sources: [SRC_A] }] },
    ])
    assert.ok(codes(dup).includes("SECTION_DUPLICATE"))
  })

  it("rejects malformed, duplicated and descending ids", () => {
    const one = (id: string) => editionBlocks([{ ...BRIEF, items: [{ id, title: ["a", "a"], sources: [SRC_A] }] }])
    assert.ok(codes(one("1")).includes("ITEM_ID_MALFORMED"))
    assert.ok(codes(one("00")).includes("ITEM_ID_MALFORMED"))
    assert.ok(codes(one("123")).includes("ITEM_ID_MALFORMED"))
    const two = (a: string, b: string) =>
      editionBlocks([{ ...BRIEF, items: [{ id: a, title: ["a", "a"], sources: [SRC_A] }, { id: b, title: ["b", "b"], sources: [SRC_A] }] }])
    assert.ok(codes(two("01", "01")).includes("ITEM_ID_DUPLICATE"))
    assert.ok(codes(two("02", "01")).includes("ITEM_ID_ORDER"))
  })

  it("rejects an item outside any section and stray blocks", () => {
    const blocks = editionBlocks()
    const frAt = blocks.findIndex((b) => isText(b, "🇫🇷 Français"))
    const withStray = [...blocks.slice(0, frAt + 1), h3("09 · Lost"), ...blocks.slice(frAt + 1)]
    assert.ok(codes(withStray).includes("ITEM_OUTSIDE_SECTION"))
    const withList = swap(editionBlocks(), (b) => b.type === "paragraph", [li(["a list before the sections"])])
    assert.ok(codes(withList).includes("UNEXPECTED_BLOCK"))
    const between = swap(editionBlocks(), (b) => isText(b, "L’essentiel"), [h2("L’essentiel"), p("stray")])
    assert.ok(codes(between).includes("UNEXPECTED_BLOCK"))
    assert.ok(codes(withList).includes("UNEXPECTED_BLOCK"))
  })

  it("rejects unsupported blocks in an item", () => {
    assert.ok(codes(swap(editionBlocks(), (b) => isText(b, "An invented paragraph."), [image()])).includes("UNSUPPORTED_BLOCK"))
  })
})

describe("parseEdition: sources", () => {
  it("requires sources outside Watch next", () => {
    const spec = sampleSpec()
    delete spec[1].items[0].sources
    assert.ok(codes(editionBlocks(spec)).includes("MISSING_SOURCES"))
  })

  it("validates sources in Watch next when present", () => {
    const spec = sampleSpec()
    spec[2].items[0].sources = [["http://example.org/", "a", "a"]]
    assert.ok(codes(editionBlocks(spec)).includes("URL_NOT_HTTPS"))
  })

  it("needs exactly one link per source bullet, with a label", () => {
    const replace = (bullet: NotionBlock) =>
      swap(editionBlocks(), (b) => b.type === "bulleted_list_item", [bullet], 0)
    assert.ok(codes(replace(li(["no link here"]))).includes("SOURCE_LINK_COUNT"))
    assert.ok(codes(replace(li([t("A", "https://a.example.org/"), " and ", t("B", "https://b.example.org/")]))).includes("SOURCE_LINK_COUNT"))
    assert.ok(codes(replace(li([t(" ", SRC_A[0])]))).includes("SOURCE_LABEL_MISSING"))
  })

  it("rejects body text after the source list, and a second list", () => {
    const blocks = editionBlocks()
    const at = blocks.findIndex((b) => isText(b, "Sources :"))
    const after = [...blocks.slice(0, at + 3), p("Afterthought."), ...blocks.slice(at + 3)]
    assert.ok(codes(after).includes("SOURCES_NOT_LAST"))
    const twice = [...blocks.slice(0, at + 3), ...sources("fr", [["x", "https://x.example.org/"]]), ...blocks.slice(at + 3)]
    assert.ok(codes(twice).includes("SOURCES_DUPLICATE"))
  })

  it("rejects the same source twice in one item", () => {
    const spec = sampleSpec()
    spec[0].items[1].sources = [SRC_B, [SRC_B[0] + "/", "x", "x"]]
    assert.ok(codes(editionBlocks(spec)).includes("SOURCE_DUPLICATE"))
  })

  it("rejects private links anywhere, not only in sources", () => {
    const blocks = swap(editionBlocks(), (b) => isText(b, "An invented paragraph."), [
      p("see ", t("this doc", "https://docs.google.com/document/d/x/edit")),
    ])
    assert.ok(codes(blocks).includes("URL_PRIVATE_SERVICE"))
  })
})

describe("parseEdition: FR/EN parity", () => {
  it("rejects different sections", () => {
    const en = sampleSpec().slice(0, 2)
    assert.ok(codes(editionBlocks(sampleSpec(), { en })).includes("SECTION_MISMATCH"))
  })

  it("rejects different item ids", () => {
    const en = sampleSpec()
    en[1].items[0].id = "05"
    assert.ok(codes(editionBlocks(sampleSpec(), { en })).includes("ITEM_MISMATCH"))
  })

  it("rejects an item in a different section", () => {
    const fr: Parameters<typeof editionBlocks>[0] = [
      { ...BRIEF, items: [{ id: "01", title: ["a", "a"], sources: [SRC_A] }] },
      { ...FINDS, items: [{ id: "02", title: ["b", "b"], sources: [SRC_A] }] },
    ]
    const en: Parameters<typeof editionBlocks>[0] = [
      { ...BRIEF, items: [{ id: "01", title: ["a", "a"], sources: [SRC_A] }, { id: "02", title: ["b", "b"], sources: [SRC_A] }] },
      { ...FINDS, items: [{ id: "03", title: ["c", "c"], sources: [SRC_A] }] },
    ]
    assert.ok(codes(editionBlocks(fr, { en })).includes("ITEM_SECTION_MISMATCH"))
  })

  it("rejects different source sets", () => {
    const en = sampleSpec()
    en[0].items[0].sources = [SRC_A]
    assert.ok(codes(editionBlocks(sampleSpec(), { en })).includes("SOURCE_MISMATCH"))
  })
})

describe("parseEdition: private content", () => {
  it("rejects user and page mentions but allows dates", () => {
    const withMention = (kind: string) =>
      swap(editionBlocks(), (b) => isText(b, "An invented paragraph."), [p("Met ", mention(kind), " today.")])
    assert.ok(codes(withMention("user")).includes("PRIVATE_MENTION"))
    assert.ok(codes(withMention("page")).includes("PRIVATE_MENTION"))
    assert.ok(!codes(withMention("date")).includes("PRIVATE_MENTION"))
  })

  it("rejects secrets in titles, ledes, bodies and labels without echoing them", () => {
    const leak = "sk-abcdefghijklmnopqrstuv"
    const spec = sampleSpec()
    spec[0].items[0].title[1] = `Leaked ${leak}`
    const { issues } = parse(editionBlocks(spec, { frLede: "Écrivez à someone@example.org." }))
    const found = errorsOf(issues).map((i) => i.code)
    assert.ok(found.includes("TEXT_API_KEY"))
    assert.ok(found.includes("TEXT_EMAIL"))
    for (const issue of issues) {
      assert.ok(!issue.message.includes(leak))
      assert.ok(!issue.message.includes("someone@example.org"))
    }
  })

  it("names only the host of a rejected URL", () => {
    const spec = sampleSpec()
    spec[0].items[1].sources = [["https://cdn.example.org/f?token=s3cr3tvalue", "a", "a"]]
    const { issues } = parse(editionBlocks(spec))
    const issue = issues.find((i) => i.code === "URL_SECRET_PARAM")
    assert.ok(issue)
    assert.ok(!issue.message.includes("s3cr3tvalue"))
    assert.match(issue.message, /cdn\.example\.org/)
  })

  it("rejects an invalid date", () => {
    assert.ok(errorsOf(parseEdition(editionBlocks(), { date: "2026-13-01" }).issues).some((i) => i.code === "DATE_INVALID"))
  })
})

describe("derived files", () => {
  const { edition } = parse(editionBlocks())

  it("builds edition.json to the contract", () => {
    const json = toEditionJson(edition!, "2026-11-14T19:00:00.000Z")
    assert.equal(json.schema, 1)
    assert.equal(json.date, DATE)
    assert.equal(json.generatedAt, "2026-11-14T18:05:00.000Z")
    assert.equal(json.publishedAt, "2026-11-14T19:00:00.000Z")
    assert.deepEqual(json.languages, ["fr", "en"])
    assert.match(json.lede.fr!, /^Ce soir, on revient sur le port de Glassmere/)
    assert.deepEqual(json.sections[0], { key: "overview", kind: "narrative", title: { fr: "L’essentiel du jour", en: "Today’s briefing" }, items: [] })
    assert.deepEqual(json.sections[1], { key: "brief", kind: "items", title: { fr: "L’essentiel", en: "The essentials" }, items: ["01", "02"] })
    assert.match(json.narrative.overview.en, /^Tonight, back to Glassmere’s harbour \(\[The Fictional Daily\]\(https:\/\/news\.example\.org\/story\/1\)\)/)
    assert.equal(json.narrative.analysis, null)
    assert.deepEqual(json.timeline, [])
    assert.deepEqual(json.inBrief, [])
    assert.ok(json.wordCount.fr > 30 && json.wordCount.en > 30)
    assert.deepEqual(json.readingMinutes, { fr: 1, en: 1 })
    assert.deepEqual(json.items[0].title, { fr: "Le canal rouvre", en: "The canal reopens" })
    assert.deepEqual(json.items[0].kicker, { fr: "GLASSMERE", en: "GLASSMERE" })
    assert.deepEqual(json.items[1].title, { fr: "OSTRAVA-SUR-MER", en: "OSTRAVA-ON-SEA" })
    assert.equal(json.items[2].kicker, null)
    assert.equal(json.narrative.closing, null)
    assert.deepEqual(json.items[0].sources[0], { url: SRC_A[0], label: { fr: SRC_A[1], en: SRC_A[2] } })
    assert.deepEqual(json.items[3].sources, [])
  })

  it("pairs labels by URL when the English order differs", () => {
    const en = sampleSpec()
    en[0].items[0].sources = [SRC_B, SRC_A]
    const json = toEditionJson(parse(editionBlocks(sampleSpec(), { en })).edition!, null)
    assert.deepEqual(json.items[0].sources.map((s) => s.label.en), [SRC_A[2], SRC_B[2]])
  })

  it("writes each language's Markdown with anchors and sources", () => {
    const fr = toMarkdown(edition!, "fr")
    assert.match(fr, /^---\ntitle: "Newsletter · 14 novembre 2026"\ndate: "2026-11-14"\nlang: "fr"/)
    assert.match(fr, /---\n\nCe soir, on revient sur le port de Glassmere/)
    assert.match(fr, /## L’essentiel\n\n### 01 · GLASSMERE · Le canal rouvre \{#item-01\}/)
    assert.match(fr, /readingMinutes: 1\nwordCount: \d+\n---/)
    assert.match(fr, /Sources :\n\n- \[Le Quotidien fictif\]\(https:\/\/news\.example\.org\/story\/1\)/)
    const en = toMarkdown(edition!, "en")
    assert.match(en, /## Watch next\n\n### 04 · Tomorrow’s vote \{#item-04\}\n\nAn invented paragraph\.\n$/)
  })

  it("carries no Notion identifiers", () => {
    const files = deriveFiles(edition!, null)
    for (const content of Object.values(files)) assert.doesNotMatch(content, /notion/i)
  })

  it("is deterministic", () => {
    assert.deepEqual(deriveFiles(edition!, null), deriveFiles(parse(editionBlocks()).edition!, null))
  })
})

const timeline = (fr: NotionBlock[], en: NotionBlock[]) => ({ ...TIMELINE, items: [], blocks: { fr, en } })
const inBrief = (fr: NotionBlock[], en: NotionBlock[]) => ({ ...INBRIEF, items: [], blocks: { fr, en } })
const analysis = (fr: NotionBlock[], en: NotionBlock[]) => ({ ...ANALYSIS, items: [], blocks: { fr, en } })
const withSections = (...extra: Array<{ at: number; section: NonNullable<Parameters<typeof editionBlocks>[0]>[number] }>) => {
  const spec = sampleSpec()
  for (const { at, section } of extra) spec.splice(at, 0, section)
  return spec.sort((a, b) => sectionIndex(sectionFor(a.fr, "fr")!.key) - sectionIndex(sectionFor(b.fr, "fr")!.key))
}

describe("amendment 1: narrative and list sections", () => {
  const fullSpec = () =>
    withSections(
      { at: 1, section: analysis(
        [p("Deuxième ordre, d’après ", t("l’étude", SRC_B[0]), "."), p("Qui gagne, qui perd.")],
        [p("Second-order effects, per ", t("the study", SRC_B[0]), "."), p("Who wins, who loses.")],
      ) },
      { at: 1, section: timeline(
        [li(["2026-11-12 — Fermeture du port, ", t("source", "https://news.example.org/story/0")]), li(["2026-11-14 – Réouverture ", t("ici", SRC_A[0])])],
        [li(["2026-11-12 — Harbour closes, ", t("source", "https://news.example.org/story/0")]), li(["2026-11-14 — Reopening ", t("here", SRC_A[0])])],
      ) },
      { at: 1, section: inBrief(
        [li(["Un chiffre : 42 % ", t("(source)", "https://stats.example.org/42")])],
        [li(["One figure: 42% ", t("(source)", "https://stats.example.org/42")])],
      ) },
    )

  it("parses analysis, timeline and in-brief into edition.json", () => {
    const { edition, issues } = parse(editionBlocks(fullSpec()))
    assert.deepEqual(errorsOf(issues), [])
    const json = toEditionJson(edition!, null)
    assert.deepEqual(json.sections.map((s) => [s.key, s.kind]), [
      ["overview", "narrative"], ["brief", "items"], ["analysis", "narrative"], ["timeline", "bullets"],
      ["inbrief", "bullets"], ["finds", "items"], ["watch", "items"],
    ])
    assert.match(json.narrative.analysis!.fr, /^Deuxième ordre/)
    assert.deepEqual(json.timeline.map((e) => e.date), ["2026-11-12", "2026-11-14"])
    assert.match(json.timeline[1].text.fr, /^Réouverture/)
    assert.deepEqual(json.timeline[0].urls, ["https://news.example.org/story/0"])
    assert.deepEqual(json.inBrief[0].urls, ["https://stats.example.org/42"])
    assert.match(json.inBrief[0].text.en, /^One figure: 42%/)
    const md = toMarkdown(edition!, "en")
    assert.match(md, /## Timeline\n\n- 2026-11-12 — Harbour closes, \[source\]/)
    assert.match(md, /## Analysis\n\nSecond-order effects/)
  })

  it("requires the overview", () => {
    assert.ok(codes(editionBlocks(sampleSpec(), { overview: false })).includes("SECTION_MISSING"))
  })

  it("accepts the intro under its heading, but not in both places", () => {
    assert.deepEqual(codes(editionBlocks(sampleSpec(), { overview: "heading" })), [])
    const blocks = editionBlocks(sampleSpec(), { overview: "heading" })
    const at = blocks.findIndex((b) => isText(b, "L’essentiel du jour"))
    const both = [...blocks.slice(0, at), p("Une autre intro."), ...blocks.slice(at)]
    assert.ok(codes(both).includes("OVERVIEW_TWICE"))
  })

  it("rejects an intro of more than two paragraphs", () => {
    const blocks = editionBlocks()
    const at = blocks.findIndex((b) => isText(b, "L’essentiel"))
    const long = [...blocks.slice(0, at), p("deux"), p("trois"), ...blocks.slice(at)]
    assert.ok(codes(long).includes("NARRATIVE_LENGTH"))
  })

  it("warns, never fails, on narrative length", () => {
    const spec = withSections({ at: 1, section: analysis([p("Un seul.")], [p("Only one.")]) })
    const { issues } = parse(editionBlocks(spec))
    assert.deepEqual(errorsOf(issues), [])
    assert.ok(issues.some((i) => i.code === "NARRATIVE_LENGTH"))
  })

  it("rejects a narrative link that no story cites", () => {
    const spec = withSections({ at: 1, section: analysis(
      [p("Voir ", t("ailleurs", "https://elsewhere.example.org/")), p("b")],
      [p("See ", t("elsewhere", "https://elsewhere.example.org/")), p("b")],
    ) })
    assert.ok(codes(editionBlocks(spec)).includes("NARRATIVE_LINK_UNSOURCED"))
  })

  it("rejects narrative link sets that differ between languages", () => {
    const spec = withSections({ at: 1, section: analysis(
      [p("Voir ", t("a", SRC_A[0])), p("b")],
      [p("See ", t("b", SRC_B[0])), p("b")],
    ) })
    assert.ok(codes(editionBlocks(spec)).includes("LINK_MISMATCH"))
  })

  it("rejects numbered items in a narrative or list section", () => {
    const spec = withSections({ at: 1, section: analysis([h3("05 · Nope"), p("a")], [h3("05 · Nope"), p("a")]) })
    assert.ok(codes(editionBlocks(spec)).includes("ITEM_IN_UNNUMBERED_SECTION"))
  })

  it("checks every list entry: bullets only, a link each, dated timeline", () => {
    const one = (fr: NotionBlock, en: NotionBlock) => codes(editionBlocks(withSections({ at: 1, section: timeline([fr], [en]) })))
    assert.ok(one(p("x"), p("x")).includes("BULLETS_ONLY"))
    assert.ok(one(li(["2026-11-12 — no link"]), li(["2026-11-12 — no link"])).includes("BULLET_LINK_MISSING"))
    assert.ok(one(li(["Mardi — ", t("a", SRC_A[0])]), li(["Tuesday — ", t("a", SRC_A[0])])).includes("TIMELINE_DATE_MALFORMED"))
    assert.ok(one(li(["2026-11-12 — ", t("a", "http://example.org/")]), li(["2026-11-12 — ", t("a", "http://example.org/")])).includes("URL_NOT_HTTPS"))
  })

  it("pairs list entries across languages by position", () => {
    const two = (fr: NotionBlock[], en: NotionBlock[]) => codes(editionBlocks(withSections({ at: 1, section: inBrief(fr, en) })))
    const a = li(["a ", t("a", "https://a.example.org/")])
    const b = li(["b ", t("b", "https://b.example.org/")])
    assert.ok(two([a, b], [a]).includes("BULLET_COUNT_MISMATCH"))
    assert.ok(two([a, b], [b, a]).includes("LINK_MISMATCH"))
    const dated = (date: string) => li([`${date} — x `, t("a", "https://a.example.org/")])
    assert.ok(codes(editionBlocks(withSections({ at: 1, section: timeline([dated("2026-11-12")], [dated("2026-11-13")]) }))).includes("TIMELINE_DATE_MISMATCH"))
  })

  it("holds In depth to one story", () => {
    const spec = sampleSpec()
    spec.unshift({ ...DEPTH, items: [
      { id: "01", title: ["a", "a"], sources: [SRC_A] },
      { id: "02", title: ["b", "b"], sources: [SRC_A] },
    ] })
    spec[1].items.forEach((item, i) => (item.id = `0${i + 3}`))
    spec[2].items[0].id = "05"
    spec[3].items[0].id = "06"
    assert.ok(codes(editionBlocks(spec)).includes("SECTION_TOO_MANY"))
  })

  it("counts words without link targets or Markdown", () => {
    assert.equal(countWords("**Bold** [a link](https://example.org/x/y) and _more_ — 42"), 6)
  })
})

describe("amendment 2: intro, kickers, explainer, closing", () => {
  const closing = (fr: NotionBlock[], en: NotionBlock[]) => ({ ...CLOSING, items: [], blocks: { fr, en } })

  it("reads kickers, with or without a title, and plain titles", async () => {
    const { splitItemTitle } = await import("./sections.ts")
    assert.deepEqual(splitItemTitle("ISRAËL · Un cessez-le-feu fragile"), { kicker: "ISRAËL", title: "Un cessez-le-feu fragile" })
    assert.deepEqual(splitItemTitle("CLIMATE"), { kicker: "CLIMATE", title: "CLIMATE" })
    assert.deepEqual(splitItemTitle("Des chèvres au conseil municipal"), { kicker: null, title: "Des chèvres au conseil municipal" })
    assert.deepEqual(splitItemTitle("IA & DROIT · Une décision"), { kicker: "IA & DROIT", title: "Une décision" })
  })

  it("rejects a kicker in one language only", () => {
    const en = sampleSpec()
    en[0].items[0].title = ["x", "The canal reopens"]
    assert.ok(codes(editionBlocks(sampleSpec(), { en })).includes("KICKER_MISMATCH"))
  })

  it("orders focus, essentials, explainer and closing, ids ascending throughout", () => {
    const spec = sampleSpec()
    spec.unshift({ ...DEPTH, items: [{ id: "01", title: ["CLIMAT · Le sujet", "CLIMATE · The focus"], sources: [SRC_A] }] })
    spec[1].items[0].id = "02"
    spec[1].items[1].id = "03"
    spec.splice(2, 0, { ...EXPLAINER, items: [{ id: "04", title: ["Le cabotage", "Cabotage"], sources: [SRC_B] }] })
    spec[3].items[0].id = "05"
    spec[4].items[0].id = "06"
    spec.push(closing([p("Bonne soirée.")], [p("Have a good evening.")]))
    const { edition, issues } = parse(editionBlocks(spec))
    assert.deepEqual(errorsOf(issues), [])
    const json = toEditionJson(edition!, null)
    assert.deepEqual(json.sections.map((s) => s.key), ["overview", "depth", "brief", "explainer", "finds", "watch", "closing"])
    assert.deepEqual(json.narrative.closing, { fr: "Bonne soirée.", en: "Have a good evening." })
    const md = toMarkdown(edition!, "en")
    assert.match(md, /## Explainer\n\n### 04 · Cabotage \{#item-04\}/)
    assert.match(md, /\n\nHave a good evening\.\n$/)
    assert.doesNotMatch(md, /## To close/)
  })

  it("keeps links out of the closing line", () => {
    const spec = sampleSpec()
    spec.push(closing([p("Voir ", t("ici", SRC_A[0]))], [p("See ", t("here", SRC_A[0]))]))
    assert.ok(codes(editionBlocks(spec)).includes("NARRATIVE_LINK_FORBIDDEN"))
  })

  it("rejects an intro link no story cites", () => {
    const blocks = swap(editionBlocks(), (b) => b.type === "paragraph", [p("Ce soir, ", t("ailleurs", "https://elsewhere.example.org/"), ".")])
    assert.ok(codes(blocks).includes("NARRATIVE_LINK_UNSOURCED"))
  })
})
