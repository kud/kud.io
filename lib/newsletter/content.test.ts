import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  getEditions,
  getLatestEdition,
  listEditionDates,
  loadEdition,
  neighbours,
  parseEdition,
  sectionsWithItems,
} from "./content.ts"
import { parseEditionMarkdown } from "./body.ts"

const FIXTURES = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "__fixtures__",
  "content",
)

describe("newsletter loader", () => {
  it("lists edition folders newest first", async () => {
    assert.deepEqual(await listEditionDates(FIXTURES), [
      "2026-11-13",
      "2026-11-12",
    ])
  })

  it("treats a missing content directory as no editions", async () => {
    const missing = path.join(tmpdir(), "kud-newsletter-does-not-exist")
    assert.deepEqual(await listEditionDates(missing), [])
    assert.equal(await getLatestEdition(missing), null)
  })

  it("skips folders that are not dates or have no edition.json", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "kud-newsletter-"))
    await mkdir(path.join(dir, "drafts"))
    await mkdir(path.join(dir, "2026-02-30"))
    await mkdir(path.join(dir, "2026-11-01"))
    assert.deepEqual(await listEditionDates(dir), ["2026-11-01"])
    assert.deepEqual(await getEditions(dir), [])
  })

  it("loads an edition with each item's body in both languages", async () => {
    const edition = await loadEdition("2026-11-13", FIXTURES)
    assert.ok(edition)
    assert.equal(edition.items.length, 8)
    assert.match(edition.narrative.overview?.fr ?? "", /Ce soir/)
    assert.match(edition.bodies.fr["01"], /\*\*Les dates clés\*\*/)
    assert.equal(edition.inBrief.length, 1)
    assert.ok(edition.readingMinutes && edition.readingMinutes.en >= 1)
    assert.match(edition.bodies.fr["02"], /Valmoreau/)
    assert.match(edition.bodies.en["02"], /Valmoreau/)
    assert.doesNotMatch(edition.bodies.fr["02"], /Sources/)
    assert.doesNotMatch(edition.bodies.en["01"], /data\.example\.org/)
  })

  it("refuses a date that is not a real day", async () => {
    assert.equal(await loadEdition("2026-13-01", FIXTURES), null)
    assert.equal(await loadEdition("../2026-11-13", FIXTURES), null)
  })

  it("rejects an edition.json whose date disagrees with its folder", () => {
    assert.throws(
      () =>
        parseEdition(
          {
            schema: 1,
            date: "2026-11-12",
            lede: { fr: null, en: null },
            sections: [],
            items: [],
          },
          "2026-11-13",
        ),
      /date differs/,
    )
  })

  it("rejects a non-https source", () => {
    const item = {
      id: "01",
      section: "brief",
      title: { fr: "a", en: "a" },
      summary: { fr: "b", en: "b" },
      sources: [{ url: "http://example.org", label: { fr: "x", en: "x" } }],
    }
    assert.throws(
      () =>
        parseEdition({
          schema: 1,
          date: "2026-11-13",
          lede: { fr: null, en: null },
          sections: [],
          items: [item],
        }),
      /item 0/,
    )
  })

  it("groups items under their sections in order", async () => {
    const edition = await loadEdition("2026-11-13", FIXTURES)
    assert.ok(edition)
    const sections = sectionsWithItems(edition)
    assert.deepEqual(
      sections.map((section) => section.key),
      [
        "overview",
        "depth",
        "brief",
        "explainer",
        "techsci",
        "inbrief",
        "finds",
        "watch",
        "closing",
      ],
    )
    assert.deepEqual(
      sections[2].entries.map((item) => item.id),
      ["02", "03", "04"],
    )
    assert.equal(sections[2].entries[0].kicker?.fr, "VALMOREAU")
  })

  it("finds the editions either side", () => {
    const dates = ["2026-11-13", "2026-11-12", "2026-11-11"]
    assert.deepEqual(neighbours(dates, "2026-11-12"), {
      newer: "2026-11-13",
      older: "2026-11-11",
    })
    assert.deepEqual(neighbours(dates, "2026-11-13"), {
      newer: null,
      older: "2026-11-12",
    })
  })

  it("loads from NEWSLETTER_CONTENT_DIR when set", async () => {
    const previous = process.env.NEWSLETTER_CONTENT_DIR
    process.env.NEWSLETTER_CONTENT_DIR = FIXTURES
    try {
      assert.equal((await getLatestEdition())?.date, "2026-11-13")
    } finally {
      if (previous === undefined) delete process.env.NEWSLETTER_CONTENT_DIR
      else process.env.NEWSLETTER_CONTENT_DIR = previous
    }
  })
})

describe("parseEditionMarkdown", () => {
  it("splits the lede, items and drops each sources block", async () => {
    const parsed = parseEditionMarkdown(
      [
        "---",
        "date: 2026-11-13",
        "---",
        "",
        "The lede.",
        "",
        "## The brief",
        "",
        "### 01 · First {#item-01}",
        "",
        "Body *one*.",
        "",
        "**Sources:**",
        "",
        "- [A](https://example.org)",
        "",
        "### 02 - Second",
        "",
        "Body two.",
        "",
        "## Watch next",
        "",
        "Stray text outside an item.",
      ].join("\n"),
    )
    assert.equal(parsed.lede, "The lede.")
    assert.deepEqual(parsed.items, { "01": "Body *one*.", "02": "Body two." })
  })

  it("accepts the French spacing before the colon", () => {
    const parsed = parseEditionMarkdown(
      "### 01 · Titre\n\nCorps.\n\nSources :\n\n- [A](https://example.org)\n",
    )
    assert.equal(parsed.items["01"], "Corps.")
  })
})
