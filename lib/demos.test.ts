import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match.js"
import { compileNonPath } from "next/dist/shared/lib/router/utils/prepare-destination.js"
import { demoPath, demoRewrites, readDemos } from "./demos.mjs"

const rewrites = demoRewrites({ inkblot: "https://inkblot-demo.vercel.app/" })

// Matched the way Next matches a rewrite's source.
const rewrite = (pathname: string) => {
  for (const { source, destination } of rewrites) {
    const params = getPathMatch(source, {
      removeUnnamedParams: true,
      strict: true,
    })(pathname)
    if (params) return compileNonPath(destination, params)
  }
  return null
}

describe("project demos", () => {
  it("serve the demo's root at /projects/<slug>/demo", () => {
    assert.equal(demoPath("inkblot"), "/projects/inkblot/demo")
    assert.equal(
      rewrite("/projects/inkblot/demo"),
      "https://inkblot-demo.vercel.app/",
    )
  })

  it("map the demo's assets onto the deployment's root", () => {
    assert.equal(
      rewrite("/projects/inkblot/demo/assets/index-abc.js"),
      "https://inkblot-demo.vercel.app/assets/index-abc.js",
    )
  })

  it("leave the project's own pages alone", () => {
    assert.equal(rewrite("/projects/inkblot"), null)
    assert.equal(rewrite("/projects/inkblot/docs"), null)
    assert.equal(rewrite("/projects/other/demo"), null)
  })

  it("read the committed registry", () => {
    const demos = readDemos()
    for (const [slug, origin] of Object.entries(demos)) {
      assert.match(slug, /^[a-z0-9-]+$/)
      assert.match(String(origin), /^https:\/\/[^/]+\.vercel\.app\/?$/)
    }
  })
})
