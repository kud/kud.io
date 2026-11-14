import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  buildConfirmEmail,
  buildTeaser,
  campaignName,
  emailConfig,
  isEmailConfigured,
  normaliseEmail,
  signConfirmToken,
  verifyConfirmToken,
} from "./index.ts"
import { createResendProvider } from "./resend.ts"
import type { EditionJson } from "../derive.ts"

const SECRET = "test-secret-not-real"
const NOW = Date.UTC(2026, 10, 14, 19, 30)

describe("confirm tokens", () => {
  it("round-trips the address and language", () => {
    const token = signConfirmToken("reader@example.org", "en", SECRET, NOW)
    const result = verifyConfirmToken(token, SECRET, NOW + 1000)
    assert.deepEqual(result.ok && { email: result.payload.email, lang: result.payload.lang }, {
      email: "reader@example.org",
      lang: "en",
    })
  })
  it("expires", () => {
    const token = signConfirmToken("reader@example.org", "fr", SECRET, NOW, 60)
    assert.deepEqual(verifyConfirmToken(token, SECRET, NOW + 61_000), { ok: false, reason: "expired" })
  })
  it("rejects a token signed with another secret", () => {
    const token = signConfirmToken("reader@example.org", "fr", "other", NOW)
    assert.deepEqual(verifyConfirmToken(token, SECRET, NOW), { ok: false, reason: "signature" })
  })
  it("rejects an edited payload", () => {
    const token = signConfirmToken("reader@example.org", "fr", SECRET, NOW)
    const [, signature] = token.split(".")
    const forged = Buffer.from(JSON.stringify({ email: "someone@example.org", lang: "fr", exp: NOW / 1000 + 999 })).toString("base64url")
    assert.deepEqual(verifyConfirmToken(`${forged}.${signature}`, SECRET, NOW), { ok: false, reason: "signature" })
  })
  it("rejects garbage", () => {
    for (const bad of ["", "abc", "a.b.c", ".x", "x."])
      assert.equal(verifyConfirmToken(bad, SECRET, NOW).ok, false)
  })
})

describe("email input", () => {
  it("trims and lowercases a plausible address", () => {
    assert.equal(normaliseEmail("  Reader@Example.ORG "), "reader@example.org")
  })
  it("turns away what is not one", () => {
    for (const bad of ["", "nope", "a@b", "a b@c.d", 42, null, `${"a".repeat(250)}@b.cd`])
      assert.equal(normaliseEmail(bad), null)
  })
})

describe("configuration", () => {
  const full = {
    RESEND_API_KEY: "k",
    RESEND_SEGMENT_FR: "f",
    RESEND_SEGMENT_EN: "e",
    NEWSLETTER_FROM: "News <news@example.org>",
    NEWSLETTER_SIGNING_SECRET: "s",
  }
  it("is on only when every value is set", () => {
    assert.equal(isEmailConfigured(full), true)
    assert.equal(isEmailConfigured({ ...full, RESEND_SEGMENT_EN: " " }), false)
    assert.equal(emailConfig({}), null)
  })
})

const edition = (): EditionJson => ({
  schema: 1,
  date: "2026-11-14",
  generatedAt: null,
  publishedAt: "2026-11-14T19:31:00Z",
  languages: ["fr", "en"],
  lede: { fr: null, en: null },
  readingMinutes: { fr: 7, en: 7 },
  wordCount: { fr: 1400, en: 1350 },
  narrative: {
    overview: {
      fr: "Ce soir, on revient sur [une étude](https://research.example.net/paper) <inventée>.",
      en: "Tonight, an **invented** study.",
    },
    analysis: null,
    closing: null,
  },
  sections: [],
  items: ["01", "02", "03", "04"].map((id) => ({
    id,
    section: "brief" as const,
    kicker: id === "01" ? { fr: "CLIMAT", en: "CLIMATE" } : null,
    title: { fr: `Sujet ${id}`, en: `Story ${id}` },
    summary: { fr: "", en: "" },
    sources: [],
  })),
  timeline: [],
  inBrief: [],
})

describe("teaser", () => {
  it("leads with the intro as plain, escaped text", () => {
    const { html, text } = buildTeaser(edition(), "fr", "{{{UNSUB}}}")
    assert.match(text, /Ce soir, on revient sur une étude <inventée>\./)
    assert.match(html, /une étude &lt;inventée&gt;/)
    assert.doesNotMatch(html, /research\.example\.net/)
  })
  it("lists the first three stories with their kickers, in the reader's language", () => {
    const { text } = buildTeaser(edition(), "en", "{{{UNSUB}}}")
    assert.match(text, /- CLIMATE · Story 01\n- Story 02\n- Story 03\n/)
    assert.doesNotMatch(text, /Story 04/)
  })
  it("links to the edition in that language and carries the unsubscribe link", () => {
    const { html, text, subject } = buildTeaser(edition(), "en", "{{{UNSUB}}}")
    assert.match(text, /https:\/\/kud\.io\/newsletter\/2026-11-14\?lang=en/)
    assert.match(html, /href="\{\{\{UNSUB\}\}\}"/)
    assert.match(text, /Unsubscribe: \{\{\{UNSUB\}\}\}/)
    assert.equal(subject, "Tonight on kud.io · 14 November 2026")
    assert.equal(buildTeaser(edition(), "fr", "u").subject, "Ce soir sur kud.io · 14 novembre 2026")
  })
  it("names campaigns per date and language", () => {
    assert.equal(campaignName("2026-11-14", "fr"), "newsletter-2026-11-14-fr")
  })
  it("builds a confirm mail with the link in both parts", () => {
    const { html, text } = buildConfirmEmail("fr", "https://kud.io/api/newsletter/confirm?token=a.b")
    assert.match(text, /confirm\?token=a\.b/)
    assert.match(html, /href="https:\/\/kud\.io\/api\/newsletter\/confirm\?token=a\.b"/)
  })
})

describe("resend provider", () => {
  type Call = { url: string; method: string; body?: unknown }
  const fake = (responses: Array<[number, unknown]>) => {
    const calls: Call[] = []
    const fetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, method: init.method!, body: init.body ? JSON.parse(String(init.body)) : undefined })
      const [status, body] = responses.shift() ?? [200, {}]
      return new Response(JSON.stringify(body), { status })
    }) as typeof globalThis.fetch
    const provider = createResendProvider({
      apiKey: "k",
      from: "News <news@example.org>",
      segments: { fr: "seg-fr", en: "seg-en" },
      fetch,
    })
    return { provider, calls }
  }

  it("creates a new contact straight into its language's segment", async () => {
    const { provider, calls } = fake([[200, { id: "c1" }]])
    await provider.addSubscriber("reader@example.org", "en")
    assert.deepEqual(calls, [
      { url: "https://api.resend.com/contacts", method: "POST", body: { email: "reader@example.org", unsubscribed: false, segments: [{ id: "seg-en" }] } },
    ])
  })
  it("adds an existing contact to the segment and resubscribes it", async () => {
    const { provider, calls } = fake([[409, { message: "exists" }], [200, {}], [200, {}]])
    await provider.addSubscriber("reader@example.org", "fr")
    assert.deepEqual(calls.slice(1).map((c) => `${c.method} ${c.url}`), [
      "POST https://api.resend.com/contacts/reader%40example.org/segments/seg-fr",
      "PATCH https://api.resend.com/contacts/reader%40example.org",
    ])
  })
  it("does not retry on a server error", async () => {
    const { provider, calls } = fake([[500, { message: "down" }]])
    await assert.rejects(provider.addSubscriber("reader@example.org", "fr"), /resend create contact: 500/)
    assert.equal(calls.length, 1)
  })
  it("finds a campaign by name across pages", async () => {
    const { provider, calls } = fake([
      [200, { data: [{ id: "b1", name: "other" }], has_more: true }],
      [200, { data: [{ id: "b2", name: "newsletter-2026-11-14-fr" }], has_more: false }],
    ])
    assert.equal(await provider.hasCampaign("newsletter-2026-11-14-fr"), true)
    assert.match(calls[1].url, /after=b1/)
  })
  it("sends a broadcast to the language's segment in one call", async () => {
    const { provider, calls } = fake([[200, { id: "b" }]])
    await provider.sendCampaign("n", "fr", { subject: "s", html: "h", text: "t" })
    assert.deepEqual(calls[0].body, { segment_id: "seg-fr", from: "News <news@example.org>", subject: "s", html: "h", text: "t", name: "n", send: true })
  })
})
