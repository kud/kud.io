import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  chatGptUrl,
  editionMarkdown,
  listenPrompt,
  markdownHref,
  markdownPath,
} from "./markdown.ts"

const SOURCE = `---
title: "Newsletter · 21 novembre 2026"
lang: "fr"
---

Ce soir, une introduction.

## Le sujet du jour

### 01 · CLIMAT · Un titre {#item-01}

Un paragraphe.

Sources :

- [BBC](https://www.bbc.co.uk/news/x)
`

describe("edition markdown", () => {
  it("lives at the edition's address with .md, language in the query", () => {
    assert.equal(markdownPath("2026-11-21"), "/newsletter/2026/11/21.md")
    assert.equal(
      markdownHref("2026-11-21", "en"),
      "/newsletter/2026/11/21.md?lang=en",
    )
  })

  it("drops the front matter and heading anchors, keeps the text", () => {
    const md = editionMarkdown({
      date: "2026-11-21",
      lang: "fr",
      markdown: SOURCE,
    })
    assert.ok(
      md.startsWith(
        "# Newsletter · Samedi 21 novembre 2026\n\n> **Comment lire",
      ),
    )
    assert.ok(!md.includes('title: "'))
    assert.ok(!md.includes("{#item-01}"))
    assert.ok(md.includes("### 01 · CLIMAT · Un titre\n\nUn paragraphe."))
    assert.ok(md.includes("- [BBC](https://www.bbc.co.uk/news/x)"))
    assert.ok(md.endsWith("\n"))
  })

  it("prefaces each language in its own words, naming the author", () => {
    const fr = editionMarkdown({
      date: "2026-11-21",
      lang: "fr",
      markdown: "",
    })
    const en = editionMarkdown({
      date: "2026-11-21",
      lang: "en",
      markdown: "",
    })
    assert.match(fr, /en français, écrite par Erwann Mest/)
    assert.match(en, /in English, written by Erwann Mest/)
    assert.match(en, /do not read web addresses aloud/)
    assert.match(en, /https:\/\/kud\.io\/newsletter\/2026\/11\/21\?lang=en/)
  })

  it("builds a prompt that points at the markdown, in the edition's language", () => {
    assert.equal(
      listenPrompt("2026-11-21", "fr"),
      "Lis-moi à voix haute la newsletter du samedi 21 novembre 2026, en français, sans lire les liens : https://kud.io/newsletter/2026/11/21.md?lang=fr",
    )
    assert.match(
      listenPrompt("2026-11-21", "en"),
      /in English, without reading the links: https:\/\/kud\.io\/newsletter\/2026\/11\/21\.md\?lang=en$/,
    )
    assert.equal(chatGptUrl("a b&c"), "https://chatgpt.com/?q=a%20b%26c")
  })
})
