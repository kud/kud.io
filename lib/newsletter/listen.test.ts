import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { listeningScript, spokenParagraphs } from "./listen.ts"
import { pickVoice } from "./voice.ts"

const localised = (fr: string, en: string) => ({ fr, en })

const edition = {
  narrative: {
    overview: localised(
      "Ce soir, la panne, selon [Le Monde](https://lemonde.fr/a).",
      "Tonight, the outage, according to [the BBC](https://bbc.co.uk/a).",
    ),
    analysis: null,
    closing: localised("Bonne soirée.", "Good night."),
  },
  sections: [
    {
      key: "overview",
      kind: "narrative",
      title: localised("Ce soir", "Tonight"),
      items: [],
    },
    {
      key: "depth",
      kind: "items",
      title: localised("Le sujet du jour", "Today’s focus"),
      items: ["01"],
    },
    {
      key: "brief",
      kind: "items",
      title: localised("L’essentiel", "The essentials"),
      items: ["02"],
    },
    {
      key: "timeline",
      kind: "bullets",
      title: localised("Chronologie", "Timeline"),
      items: [],
    },
    {
      key: "watch",
      kind: "items",
      title: localised("À surveiller", "Watch next"),
      items: [],
    },
    {
      key: "closing",
      kind: "narrative",
      title: localised("Pour finir", "To close"),
      items: [],
    },
  ],
  items: [
    {
      id: "01",
      section: "depth",
      kicker: localised("TRANSPORT AÉRIEN", "AVIATION"),
      title: localised("Un câble de cuivre", "A copper wire"),
      summary: localised("Résumé.", "Summary."),
      sources: [],
    },
    {
      id: "02",
      section: "brief",
      kicker: localised("UKRAINE", "UKRAINE"),
      title: localised("UKRAINE", "UKRAINE"),
      summary: localised("Le résumé seul.", "Only the summary."),
      sources: [],
    },
  ],
  bodies: {
    fr: {
      "01": "Premier paragraphe.\n\n**Les dates clés**\n\n- **11 septembre 2001** · Première interdiction.\n\nSources :\n\n- [BBC](https://bbc.co.uk/x)",
    },
    en: {
      "01": "First paragraph, see https://example.com/page for more.\n\n**Key dates**\n\n- **11 September 2001** · The first stop.\n\nSources:\n\n- [BBC](https://bbc.co.uk/x)",
    },
  },
  timeline: [{ date: "2026-11-13", text: localised("Fait", "Fact"), urls: [] }],
} as unknown as Parameters<typeof listeningScript>[0]

describe("newsletter listening script", () => {
  it("reads the intro, each story and the closing, in order", () => {
    assert.deepEqual(listeningScript(edition, "en"), [
      {
        target: "section-overview",
        text: "Tonight, the outage, according to the BBC.",
      },
      { target: "section-depth", text: "Today’s focus." },
      { target: "item-01", text: "Number 1. Aviation. A copper wire." },
      { target: "item-01", text: "First paragraph, see for more." },
      { target: "item-01", text: "Key dates" },
      { target: "item-01", text: "11 September 2001. The first stop." },
      { target: "section-brief", text: "The essentials." },
      { target: "item-02", text: "Number 2. Ukraine." },
      { target: "item-02", text: "Only the summary." },
      { target: "section-closing", text: "Good night." },
    ])
  })

  it("reads French in French, keeping its spacing", () => {
    const script = listeningScript(edition, "fr")
    assert.equal(
      script[2].text,
      "Numéro 1. Transport aérien. Un câble de cuivre.",
    )
    assert.equal(script[5].text, "11 septembre 2001. Première interdiction.")
    assert.equal(script.at(-1)?.text, "Bonne soirée.")
  })

  it("skips sources, bullets sections and empty sections", () => {
    const text = listeningScript(edition, "en")
      .map((passage) => passage.text)
      .join(" ")
    assert.doesNotMatch(
      text,
      /Sources|https?:|\]\(|Timeline|Fact|Watch next/,
    )
  })
})

describe("spoken paragraphs", () => {
  it("drops URLs, footnote markers and markup but keeps link words", () => {
    assert.deepEqual(
      spokenParagraphs(
        "A *claim*[^1] by [Reuters](https://reuters.com) [2], at <https://x.org>.\n\n> Quoted `words`.\n\n[^1]: https://note.example",
        "en",
      ),
      ["A claim by Reuters, at.", "Quoted words."],
    )
  })

  it("stops at the sources line, bare or in bold", () => {
    assert.deepEqual(
      spokenParagraphs("Body.\n\n**Sources :**\n\nAfter.", "fr"),
      ["Body."],
    )
  })
})

describe("voice choice", () => {
  const voice = (name: string, lang: string, isDefault = false) => ({
    name,
    lang,
    default: isDefault,
  })

  it("prefers the page's accent, then a better voice, then the default", () => {
    const voices = [
      voice("Google US English", "en-US"),
      voice("Daniel", "en-GB", true),
      voice("Serena (Premium)", "en-GB"),
      voice("Thomas", "fr-FR"),
    ]
    assert.equal(pickVoice(voices, "en")?.name, "Serena (Premium)")
    assert.equal(pickVoice(voices.slice(0, 2), "en")?.name, "Daniel")
    assert.equal(pickVoice(voices, "fr")?.name, "Thomas")
  })

  it("falls back to another region, and to nothing", () => {
    assert.equal(pickVoice([voice("Amélie", "fr_CA")], "fr")?.name, "Amélie")
    assert.equal(pickVoice([voice("Anna", "de-DE")], "fr"), null)
    assert.equal(pickVoice([], "en"), null)
  })
})
