import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  formatEditionDate,
  isEditionDate,
  newsletterHref,
  parseLang,
  resolveLang,
} from "./language.ts"

describe("newsletter language", () => {
  it("defaults to French", () => {
    assert.equal(resolveLang({}), "fr")
    assert.equal(resolveLang({ query: "de", cookie: "xx" }), "fr")
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
      "/newsletter/2026-11-13?lang=en#item-03",
    )
    assert.equal(
      newsletterHref({ date: "2026-11-13" }, "fr", {
        explicit: true,
        hash: "item-03",
      }),
      "/newsletter/2026-11-13?lang=fr#item-03",
    )
    assert.equal(newsletterHref({}, "fr"), "/newsletter")
    assert.equal(
      newsletterHref({ archive: true }, "en"),
      "/newsletter/archive?lang=en",
    )
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
})
