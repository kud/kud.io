import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  editionDateOf,
  editionPath,
  editionSegments,
  formatEditionDate,
  isEditionDate,
  newsletterHref,
  parseLang,
  resolveLang,
  signupStateOf,
} from "./language.ts"

describe("newsletter language", () => {
  it("defaults to English", () => {
    assert.equal(resolveLang({}), "en")
    assert.equal(resolveLang({ query: "de", cookie: "xx" }), "en")
  })

  it("follows the browser's language when nothing was chosen", () => {
    assert.equal(resolveLang({ acceptLanguage: "fr-FR,fr;q=0.9,en;q=0.8" }), "fr")
    assert.equal(resolveLang({ acceptLanguage: "en-GB,en;q=0.9,fr;q=0.8" }), "en")
    assert.equal(resolveLang({ acceptLanguage: "de-DE,fr;q=0.5,en;q=0.7" }), "en")
    assert.equal(resolveLang({ acceptLanguage: "en;q=0,fr-CA" }), "fr")
  })

  it("uses the country only when the browser names neither language", () => {
    assert.equal(resolveLang({ acceptLanguage: "de-DE", country: "FR" }), "fr")
    assert.equal(resolveLang({ acceptLanguage: "en-US", country: "FR" }), "en")
    assert.equal(resolveLang({ country: "be" }), "fr")
    assert.equal(resolveLang({ country: "GB" }), "en")
  })

  it("lets a remembered choice beat the browser and the country", () => {
    assert.equal(
      resolveLang({ cookie: "en", acceptLanguage: "fr-FR", country: "FR" }),
      "en",
    )
    assert.equal(resolveLang({ cookie: "fr", acceptLanguage: "en-GB" }), "fr")
  })

  it("lets an explicit query beat the remembered choice", () => {
    assert.equal(resolveLang({ query: "fr", cookie: "en" }), "fr")
    assert.equal(resolveLang({ query: "en", cookie: "fr" }), "en")
  })

  it("falls back to the remembered choice", () => {
    assert.equal(resolveLang({ query: null, cookie: "en" }), "en")
    assert.equal(resolveLang({ query: "nope", cookie: "en" }), "en")
  })

  it("parses only the two languages", () => {
    assert.equal(parseLang("en"), "en")
    assert.equal(parseLang("EN"), null)
    assert.equal(parseLang(undefined), null)
  })

  it("keeps the date and the item anchor when switching language", () => {
    assert.equal(
      newsletterHref({ date: "2026-11-13" }, "en", { hash: "item-03" }),
      "/newsletter/2026/11/13?lang=en#item-03",
    )
    assert.equal(
      newsletterHref({ date: "2026-11-13" }, "fr", { hash: "item-03" }),
      "/newsletter/2026/11/13?lang=fr#item-03",
    )
    assert.equal(newsletterHref({}, "fr"), "/newsletter?lang=fr")
    assert.equal(newsletterHref({}, "en"), "/newsletter?lang=en")
    assert.equal(
      newsletterHref({ editions: true }, "en"),
      "/newsletter/editions?lang=en",
    )
    assert.equal(
      newsletterHref({ editions: true }, "fr"),
      "/newsletter/editions?lang=fr",
    )
  })

  it("nests an edition's address by date, like a blog post", () => {
    assert.equal(editionPath("2026-11-18"), "/newsletter/2026/11/18")
    assert.equal(
      newsletterHref({ date: "2026-11-18" }, "fr"),
      "/newsletter/2026/11/18?lang=fr",
    )
    assert.deepEqual(editionSegments("2026-11-18"), {
      year: "2026",
      month: "11",
      day: "18",
    })
  })

  it("reads a date back from the route's segments", () => {
    assert.equal(
      editionDateOf({ year: "2026", month: "11", day: "18" }),
      "2026-11-18",
    )
    assert.equal(editionDateOf(editionSegments("2028-02-29")), "2028-02-29")
    assert.equal(editionDateOf({ year: "2026", month: "02", day: "29" }), null)
    assert.equal(editionDateOf({ year: "2026", month: "1", day: "01" }), null)
  })

  it("accepts only real calendar days", () => {
    assert.ok(isEditionDate("2028-02-29"))
    assert.ok(!isEditionDate("2026-02-29"))
    assert.ok(!isEditionDate("2026-1-01"))
  })

  it("formats a day without shifting it across time zones", () => {
    assert.equal(
      formatEditionDate("2026-11-13", "en"),
      "Friday 13 November 2026",
    )
    assert.equal(
      formatEditionDate("2026-11-13", "fr"),
      "vendredi 13 novembre 2026",
    )
  })

  it("reads the signup outcome the routes redirect with", () => {
    assert.equal(signupStateOf(""), null)
    assert.equal(signupStateOf("?subscribed=check&lang=fr"), "check")
    assert.equal(signupStateOf("?subscribed=1&lang=en"), "confirmed")
    for (const reason of ["invalid", "link", "expired", "unavailable"])
      assert.equal(signupStateOf(`?subscribed=0&reason=${reason}`), reason)
    assert.equal(signupStateOf("?subscribed=0&reason=failed"), "failed")
    assert.equal(signupStateOf("?subscribed=0&reason=whatever"), "failed")
    assert.equal(signupStateOf("?subscribed=maybe"), null)
  })
})
