import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { isTiledIcon, svgHasTile } from "./icons.ts"

const svg = (inner: string, root = 'viewBox="0 0 512 512"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${root}>${inner}</svg>`

describe("svgHasTile", () => {
  it("finds the shared cream ground", () => {
    assert.equal(
      svgHasTile(svg('<rect width="512" height="512" fill="#fff7eb"/><path d="M1 1"/>')),
      true,
    )
  })

  it("looks past comments, titles and defs", () => {
    assert.equal(
      svgHasTile(
        `<!-- a --><svg viewBox="0 0 1024 1024"><title>x</title><defs><clipPath id="t"><rect x="9" width="1" height="1"/></clipPath></defs><rect width="1024" height="1024" rx="228" fill="#FFF"/></svg>`,
      ),
      true,
    )
  })

  it("reads a canvas traced as a path", () => {
    assert.equal(svgHasTile(svg('<path fill="#0B0C0E" d="M0 0H512V512H0Z"/>')), true)
  })

  it("leaves a bare glyph on the plate", () => {
    assert.equal(
      svgHasTile(
        svg(
          '<rect x="4.5" y="10.5" width="55" height="43" rx="6" fill="none"/>',
          'viewBox="0 0 64 64"',
        ),
      ),
      false,
    )
    assert.equal(svgHasTile(svg('<g><circle cx="50" cy="50" r="7"/></g>', 'viewBox="0 0 100 100"')), false)
    assert.equal(svgHasTile(svg('<path d="M16.72 5.908a1.496 1.496 0 1 1 2.442 1.729z"/>', 'viewBox="0 0 24 24"')), false)
  })

  it("falls back to width and height without a viewBox", () => {
    assert.equal(svgHasTile(svg('<rect width="100%" height="100%" fill="#fff"/>', 'width="64" height="64"')), true)
  })
})

describe("isTiledIcon", () => {
  it("treats rasters as tiled and unknown kinds as bare", async () => {
    assert.equal(await isTiledIcon("https://example.com/icon.png"), true)
    assert.equal(await isTiledIcon("https://files.raycast.com/abc123"), false)
    assert.equal(await isTiledIcon(null), false)
  })

  it("reads a local SVG from public", async () => {
    assert.equal(await isTiledIcon("/icons/foxhop-cli.svg"), true)
  })
})
