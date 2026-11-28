import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  chunkText,
  cleanSpokenText,
  pickVoice,
  speakableKicker,
  spokenHeading,
} from "./speech.ts"

describe("speech", () => {
  it("reads a kicker in words, keeping short acronyms", () => {
    assert.equal(speakableKicker("ARMES AUTONOMES", "fr"), "Armes autonomes")
    assert.equal(speakableKicker("IA & SÉCURITÉ", "fr"), "IA et sécurité")
    assert.equal(speakableKicker("AI & SECURITY", "en"), "AI and security")
  })

  it("reads a story heading as number, kicker, title", () => {
    assert.equal(
      spokenHeading(
        { id: "01", kicker: "CLIMAT", title: "La COP31 bloquée" },
        "fr",
      ),
      "1. Climat. La COP31 bloquée",
    )
    assert.equal(
      spokenHeading({ id: "07", kicker: null, title: "A find" }, "en"),
      "7. A find",
    )
  })

  it("leaves out addresses, footnote markers and arrows", () => {
    assert.equal(
      cleanSpokenText(
        "See BBC ↗ at https://bbc.co.uk/x [1] · and www.example.com now .",
      ),
      "See BBC at, and now.",
    )
    assert.equal(
      cleanSpokenText("Pourquoi ?  Parce que : oui"),
      "Pourquoi ? Parce que : oui",
    )
  })

  it("splits long text into whole sentences under the limit", () => {
    const text =
      "One short sentence. " + "word ".repeat(80).trim() + ". Last one."
    const chunks = chunkText(text, 100)
    assert.ok(chunks.every((chunk) => chunk.length <= 100))
    assert.equal(chunks[0], "One short sentence.")
    assert.ok(chunks.at(-1)?.endsWith("Last one."))
    assert.equal(chunks.join(" ").replace(/\s+/g, " "), text)
  })

  it("prefers the edition's region, then on-device voices", () => {
    const voices = [
      { name: "en-US", lang: "en-US", localService: true, default: true },
      { name: "fr-CA", lang: "fr-CA", localService: true, default: false },
      { name: "fr-FR net", lang: "fr-FR", localService: false, default: false },
      { name: "en-GB", lang: "en_GB", localService: true, default: false },
    ]
    assert.equal(pickVoice(voices, "fr")?.name, "fr-FR net")
    assert.equal(pickVoice(voices, "en")?.name, "en-GB")
    assert.equal(pickVoice([voices[0]], "fr"), null)
  })
})
