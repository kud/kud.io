import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { richText } from "./notion-markdown.js"

const node = (plain_text, annotations = {}) => ({ type: "text", plain_text, annotations })

describe("rich text line breaks", () => {
  it("turns a Notion soft line break into a Markdown hard break", () => {
    assert.equal(richText([node("Headline\nExplanation")]), "Headline  \nExplanation")
  })
  it("keeps a key-date bullet's bold year and its break intact", () => {
    const nodes = [node("1966", { bold: true }), node(" — Headline\nWhat happened that year.")]
    assert.equal(richText(nodes), "**1966** — Headline  \nWhat happened that year.")
  })
  it("keeps emphasis valid when the break sits inside the bold run", () => {
    assert.equal(richText([node("Headline\n", { bold: true }), node("Explanation")]), "**Headline**  \nExplanation")
  })
  it("moves a bolded trailing space outside the markers", () => {
    assert.equal(richText([node("1966 ", { bold: true }), node("— x")]), "**1966** — x")
  })
})
