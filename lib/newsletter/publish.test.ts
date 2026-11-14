import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  choosePublishedAt,
  datesToPublish,
  invalidDates,
  issueSummary,
  markDecision,
  notifyDecision,
  porcelainPaths,
  reportEntry,
  strayPaths,
} from "./publish.ts"
import type { Issue } from "./parse.ts"

const error = (message: string): Issue => ({ code: "X", severity: "error", where: "fr", message })
const warning: Issue = { code: "W", severity: "warning", where: "fr", message: "soft" }

describe("report", () => {
  it("calls an edition with any error invalid, whatever changed", () => {
    assert.equal(reportEntry({ previousStatus: "Ready", issues: [error("x")], changed: true }).state, "invalid")
  })
  it("tells synced from unchanged, warnings aside", () => {
    assert.equal(reportEntry({ previousStatus: "Ready", issues: [warning], changed: true }).state, "synced")
    assert.equal(reportEntry({ previousStatus: "Ready", issues: [], changed: false }).state, "unchanged")
  })
  it("publishes valid editions not yet Published, in date order", () => {
    const report = {
      "2026-11-14": reportEntry({ previousStatus: "Ready", issues: [], changed: true }),
      "2026-11-12": reportEntry({ previousStatus: "Failed", issues: [], changed: false }),
      "2026-11-13": reportEntry({ previousStatus: "Published", issues: [], changed: false }),
      "2026-11-11": reportEntry({ previousStatus: "Ready", issues: [error("x")], changed: false }),
    }
    assert.deepEqual(datesToPublish(report), ["2026-11-12", "2026-11-14"])
    assert.deepEqual(invalidDates(report), ["2026-11-11"])
  })
  it("summarises the first errors only", () => {
    const summary = issueSummary([warning, ...["a", "b", "c", "d", "e", "f"].map(error)])
    assert.equal(summary, "a\nb\nc\nd\n… and 2 more")
  })
})

describe("publishedAt", () => {
  it("keeps an existing time so a re-sync is byte-stable", () => {
    assert.equal(choosePublishedAt("2026-11-13T19:31:02Z", new Date("2026-11-14T00:00:00Z")), "2026-11-13T19:31:02Z")
  })
  it("stamps a first publication to the second", () => {
    assert.equal(choosePublishedAt(null, new Date("2026-11-14T19:30:05.123Z")), "2026-11-14T19:30:05Z")
  })
})

describe("status changes", () => {
  it("never knocks a published edition back to Failed", () => {
    assert.equal(markDecision("Published", "failed").apply, false)
    assert.equal(markDecision("Ready", "failed").apply, true)
    assert.equal(markDecision("Published", "published").apply, true)
    assert.equal(markDecision(null, "published").apply, false)
  })
})

describe("notify", () => {
  const base = { status: "Published" as const, configured: true, alreadySent: false, lang: "fr" as const }
  it("sends a published edition once", () => {
    assert.equal(notifyDecision(base).send, true)
    assert.equal(notifyDecision({ ...base, alreadySent: true }).send, false)
  })
  it("never sends an edition that is not Published", () => {
    for (const status of ["Draft", "Ready", "Failed", null] as const)
      assert.equal(notifyDecision({ ...base, status }).send, false)
  })
  it("skips cleanly without email", () => {
    assert.deepEqual(notifyDecision({ ...base, configured: false }), { send: false, reason: "email not configured" })
  })
})

describe("path guard", () => {
  it("reads porcelain, renames and quoted paths included", () => {
    assert.deepEqual(
      porcelainPaths(' M a.txt\n?? content/newsletter/2026-11-14/fr.md\nR  old.md -> new.md\n?? "sp ace.md"\n'),
      ["a.txt", "content/newsletter/2026-11-14/fr.md", "old.md", "new.md", "sp ace.md"],
    )
  })
  it("allows the newsletter folder and whatever was dirty already", () => {
    const before = " M README.md\n"
    const after = " M README.md\n?? content/newsletter/2026-11-14/edition.json\n"
    assert.deepEqual(strayPaths(before, after), [])
  })
  it("flags anything new outside it", () => {
    const after = "?? content/newsletter/x/fr.md\n M package.json\n?? content/blog/x.md\n"
    assert.deepEqual(strayPaths("", after), ["package.json", "content/blog/x.md"])
  })
  it("does not let a look-alike prefix through", () => {
    assert.deepEqual(strayPaths("", "?? content/newsletter-old/x.md\n"), ["content/newsletter-old/x.md"])
  })
})
