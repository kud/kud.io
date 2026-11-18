// Temporary: remove after 2026-11-25, with dashed-date-redirects.mjs.
import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match.js"
import { compileNonPath } from "next/dist/shared/lib/router/utils/prepare-destination.js"
import { dashedDateRedirects } from "./dashed-date-redirects.mjs"

// Matched the way Next matches a redirect's source.
const redirect = (pathname: string) => {
  for (const { source, destination, permanent } of dashedDateRedirects) {
    const params = getPathMatch(source, {
      removeUnnamedParams: true,
      strict: true,
    })(pathname)
    if (params) return { to: compileNonPath(destination, params), permanent }
  }
  return null
}

describe("dashed edition addresses", () => {
  it("send the old address to the slashed one, permanently", () => {
    assert.deepEqual(redirect("/newsletter/2026-11-18"), {
      to: "/newsletter/2026/11/18",
      permanent: true,
    })
  })

  it("send the English twin's old address to its slashed one", () => {
    assert.deepEqual(redirect("/newsletter/en/2026-11-18"), {
      to: "/newsletter/en/2026/11/18",
      permanent: true,
    })
  })

  it("leave every other newsletter address alone", () => {
    for (const pathname of [
      "/newsletter",
      "/newsletter/editions",
      "/newsletter/2026/11/18",
      "/newsletter/en/2026/11/18",
      "/newsletter/og/2026-11-18/en",
      "/newsletter/2026-1-18",
    ])
      assert.equal(redirect(pathname), null, pathname)
  })
})
