import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { linkedProjectSlugs } from "./post-projects.ts"

const known = new Set(["incidents-cli", "claude-plugins", "tutti", "gh"])

describe("linkedProjectSlugs", () => {
  it("reads kud.io project pages and kud repositories, once each", () => {
    const body = [
      "[**incidents**](https://github.com/kud/incidents-cli)",
      "[plugin](https://kud.io/projects/claude-plugins/docs/incidents)",
      "[Docs](/projects/incidents-cli/docs)",
      "[notes](https://github.com/kud/tutti/releases/tag/v0.3.0)",
    ].join("\n")
    assert.deepEqual(linkedProjectSlugs(body, known), [
      "incidents-cli",
      "claude-plugins",
      "tutti",
    ])
  })

  it("ignores links to anything that is not a project", () => {
    const body = [
      "[env](https://github.com/kud/my/tree/master/bin/git)",
      "[Markdown](https://daringfireball.net/projects/markdown/syntax)",
      "[gh-cockpit](https://github.com/kud/gh-cockpit)",
      "[someone](https://github.com/other/gh)",
    ].join("\n")
    assert.deepEqual(linkedProjectSlugs(body, known), [])
  })

  it("leads with the most-linked project", () => {
    const body = [
      "[gh-cockpit](https://github.com/kud/gh)",
      "[tutti](https://github.com/kud/tutti)",
      "[source](https://github.com/kud/tutti)",
    ].join("\n")
    assert.deepEqual(linkedProjectSlugs(body, known), ["tutti", "gh"])
  })

  it("leads with the project the post's own slug names", () => {
    const body = [
      "[gh-cockpit](https://github.com/kud/gh)",
      "[tutti](https://github.com/kud/tutti)",
    ].join("\n")
    assert.deepEqual(
      linkedProjectSlugs(body, known, "tutti-one-remote-for-the-living-room"),
      ["tutti", "gh"],
    )
  })

  it("stops a repository slug at the end of the link", () => {
    assert.deepEqual(
      linkedProjectSlugs("[gh](https://github.com/kud/gh)", known),
      ["gh"],
    )
  })
})
