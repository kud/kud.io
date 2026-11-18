import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match.js"
import { proxyRoute } from "./proxy-route.ts"

// proxy.ts's matcher must be a literal for Next to read it at build time, so
// it is read here from the source rather than imported.
const matcher = [
  ...readFileSync(new URL("../../proxy.ts", import.meta.url), "utf8")
    .split("matcher:")[1]
    .matchAll(/"([^"]+)"/g),
].map(([, pattern]) => getPathMatch(pattern.replaceAll("\\\\", "\\")))

const proxied = (pathname: string) => matcher.some((match) => match(pathname))

describe("newsletter proxy", () => {
  it("runs on an edition's slashed address, in both trees", () => {
    assert.ok(proxied("/newsletter/2026/11/18"))
    assert.ok(proxied("/newsletter/en/2026/11/18"))
    assert.ok(proxied("/newsletter"))
    assert.ok(proxied("/newsletter/editions"))
  })

  it("leaves everything else under /newsletter alone", () => {
    assert.ok(!proxied("/newsletter/2026-11-18"))
    assert.ok(!proxied("/newsletter/2026/11"))
    assert.ok(!proxied("/newsletter/og/2026-11-18/en"))
    assert.ok(!proxied("/newsletter/privacy"))
    assert.ok(!proxied("/newsletter/fr.xml"))
  })

  it("rewrites an English reader onto the English twin", () => {
    assert.deepEqual(proxyRoute("/newsletter/2026/11/18", "en"), {
      rewrite: "/newsletter/en/2026/11/18",
    })
    assert.deepEqual(proxyRoute("/newsletter/editions", "en"), {
      rewrite: "/newsletter/en/editions",
    })
  })

  it("serves French from the plain route", () => {
    assert.deepEqual(proxyRoute("/newsletter/2026/11/18", "fr"), { next: true })
  })

  it("sends a direct visit to the English twin to the public address", () => {
    for (const lang of ["fr", "en"] as const)
      assert.deepEqual(proxyRoute("/newsletter/en/2026/11/18", lang), {
        redirect: "/newsletter/2026/11/18",
      })
    assert.deepEqual(proxyRoute("/newsletter/en", "fr"), {
      redirect: "/newsletter",
    })
  })
})
