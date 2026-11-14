import { describe, it } from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadEdition } from "./content.ts"
import { buildResearchPrompt } from "./prompt.ts"

const FIXTURES = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "__fixtures__",
  "content",
)

const edition = (await loadEdition("2026-11-13", FIXTURES))!

describe("buildResearchPrompt", () => {
  it("carries the date, titles, summaries and every public source", () => {
    const prompt = buildResearchPrompt(edition, ["01"], "en")
    assert.match(prompt, /2026-11-13/)
    assert.match(prompt, /Friday 13 November 2026/)
    assert.match(prompt, /### 01 · Why water costs more in Port-Lune/)
    assert.ok(prompt.includes(edition.items[0].summary.en))
    for (const source of edition.items[0].sources)
      assert.ok(prompt.includes(source.url), source.url)
  })

  it("asks for primary sources, cross-reading and an honest line on certainty", () => {
    const prompt = buildResearchPrompt(edition, ["01"], "en")
    assert.match(prompt, /research the subject further/)
    assert.match(prompt, /primary sources/)
    assert.match(prompt, /rulings, studies, filings/)
    assert.match(prompt, /independent account/)
    assert.match(prompt, /timeline/)
    assert.match(prompt, /established fact.*attributed.*uncertain/)
    assert.match(prompt, /disputed or unknown/)
    assert.match(prompt, /self-contained explanation in British English/)
    assert.match(prompt, /your own list of sources/)
  })

  it("is written in French for a French reader", () => {
    const prompt = buildResearchPrompt(edition, ["02"], "fr")
    assert.match(prompt, /vendredi 13 novembre 2026/)
    assert.match(prompt, /### 02 · VALMOREAU · Le port fermé aux voitures/)
    assert.match(prompt, /Délibération du conseil \(fictive\)/)
    assert.match(prompt, /Rédige en français/)
    assert.match(prompt, /sources primaires/)
  })

  it("keeps the edition's order whatever order the items were ticked in", () => {
    const prompt = buildResearchPrompt(edition, ["05", "02"], "en")
    assert.ok(prompt.indexOf("### 02 ·") < prompt.indexOf("### 05 ·"))
    assert.match(prompt, /the following subjects/)
  })

  it("ignores unknown ids and refuses an empty selection", () => {
    assert.doesNotMatch(buildResearchPrompt(edition, ["01", "99"], "en"), /99/)
    assert.throws(() => buildResearchPrompt(edition, [], "en"), RangeError)
    assert.throws(() => buildResearchPrompt(edition, ["99"], "fr"), RangeError)
  })

  it("adds the day's briefing as context, after the subjects", () => {
    const prompt = buildResearchPrompt(edition, ["02"], "en")
    assert.match(prompt, /## Context: tonight’s edition/)
    assert.ok(prompt.indexOf("### 02 ·") < prompt.indexOf("## Context"))
    assert.ok(prompt.includes(edition.narrative.overview!.en))
    const bare = buildResearchPrompt(
      { date: edition.date, items: edition.items },
      ["02"],
      "en",
    )
    assert.doesNotMatch(bare, /## Context/)
  })

  it("names no assistant and calls nothing", () => {
    const prompt = buildResearchPrompt(edition, ["01", "02", "03"], "en")
    assert.doesNotMatch(prompt, /claude|chatgpt|gpt|gemini|copilot|perplexity/i)
  })

  it("omits the sources line for an item without sources", () => {
    const prompt = buildResearchPrompt(edition, ["08"], "en")
    assert.doesNotMatch(prompt, /Starting sources/)
  })
})
