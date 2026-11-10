import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { parse } from "yaml"
import { prepareDoc, titleFromFilename } from "./doc-file.js"

const frontmatterOf = (text) => parse(text.match(/^---\n([\s\S]*?)\n---/)[1])

describe("prepareDoc", () => {
  it("leaves a doc with a title untouched", async () => {
    const text = "---\ntitle: ⚡ Usage\n---\n\nHello.\n"
    assert.deepEqual(await prepareDoc("usage.mdx", text), {
      text,
      note: undefined,
    })
  })

  it("promotes the first heading to the title and drops it from the body", async () => {
    const result = await prepareDoc(
      "reverse/bravia-connect.md",
      "# Reverse map\n\nBody text.\n",
    )
    assert.equal(frontmatterOf(result.text).title, "Reverse map")
    assert.ok(!result.text.includes("# Reverse map"))
    assert.ok(result.text.endsWith("Body text.\n"))
    assert.match(result.note, /Reverse map/)
  })

  it("keeps existing frontmatter fields when adding a title", async () => {
    const result = await prepareDoc(
      "spec.md",
      "---\ndescription: The spec\n---\n\n# Spec\n\nText.\n",
    )
    assert.deepEqual(frontmatterOf(result.text), {
      description: "The spec",
      title: "Spec",
    })
  })

  it("ignores a shell comment inside a fence when looking for a heading", async () => {
    const result = await prepareDoc(
      "release-notes.md",
      "```sh\n# install\nnpm i\n```\n\nText.\n",
    )
    assert.equal(frontmatterOf(result.text).title, "Release notes")
  })

  it("skips a doc whose frontmatter is not valid YAML", async () => {
    const result = await prepareDoc("bad.mdx", "---\ntitle: [oops\n---\n\nx\n")
    assert.match(result.skip, /invalid frontmatter/)
  })

  it("skips an .mdx doc that does not compile", async () => {
    const result = await prepareDoc(
      "broken.mdx",
      "---\ntitle: Broken\n---\n\n<div>\n",
    )
    assert.match(result.skip, /does not compile/)
  })

  it("compiles .md as markdown, so a stray brace is fine", async () => {
    const result = await prepareDoc("notes.md", "# Notes\n\nA {brace}.\n")
    assert.equal(result.skip, undefined)
  })

  it("skips invalid JSON and passes valid JSON through", async () => {
    assert.match((await prepareDoc("meta.json", "{")).skip, /invalid JSON/)
    const meta = '{ "pages": ["index"] }'
    assert.deepEqual(await prepareDoc("meta.json", meta), { text: meta })
  })
})

describe("titleFromFilename", () => {
  it("turns a stem into a sentence-case title", () => {
    assert.equal(
      titleFromFilename("adr/0001-settings-sync.md"),
      "0001 settings sync",
    )
    assert.equal(titleFromFilename("brand_icons.mdx"), "Brand icons")
  })
})
