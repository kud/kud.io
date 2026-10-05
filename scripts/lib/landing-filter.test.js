import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  filterLanding,
  normaliseHeading,
  countWords,
  LANDING_WORD_BUDGET,
} from "./landing-filter.js"

const sample = `# my-tool

A punchy intro line.

## 🌟 Features

- **Fast** — very fast
- **Small** — very small

## 🚀 Quick Start

\`\`\`sh
npm install -g my-tool
\`\`\`

## Usage

Basic use:

\`\`\`console
my-tool run
\`\`\`

### Advanced flags

\`\`\`console
my-tool run --all
\`\`\`

### Scripting

Pipe it anywhere.

## Development

Clone and hack.

## Licence

MIT
`

describe("normaliseHeading", () => {
  it("strips emoji and lowercases", () => {
    assert.equal(normaliseHeading("🌟 Features"), "features")
    assert.equal(normaliseHeading("🚀 Quick Start"), "quick start")
  })
  it("strips punctuation and trims", () => {
    assert.equal(normaliseHeading("  **Why?** "), "why")
  })
})

describe("filterLanding", () => {
  it("keeps the intro before the first H2", () => {
    const out = filterLanding(sample)
    assert.match(out, /A punchy intro line\./)
  })

  it("keeps one section per bucket via synonyms, in original order", () => {
    const out = filterLanding(sample)
    const headings = [...out.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1])
    assert.deepEqual(headings, ["🌟 Features", "🚀 Quick Start", "Usage"])
  })

  it("keeps only the first matching section per bucket", () => {
    const out = filterLanding(
      "# t\n\nintro\n\n## Features\n\na\n\n## Highlights\n\nb\n\n## Install\n\nnpm i t\n",
    )
    assert.match(out, /## Features/)
    assert.doesNotMatch(out, /## Highlights/)
    assert.match(out, /\ba\b/)
    assert.doesNotMatch(out, /\bb\b/)
  })

  it("drops H3 subsections under usage but keeps its lead text", () => {
    const out = filterLanding(sample)
    assert.match(out, /Basic use:/)
    assert.match(out, /my-tool run/)
    assert.doesNotMatch(out, /### Advanced flags/)
    assert.doesNotMatch(out, /### Scripting/)
    assert.doesNotMatch(out, /--all/)
  })

  it("drops non-allowlist sections", () => {
    const out = filterLanding(sample)
    assert.doesNotMatch(out, /## Development/)
    assert.doesNotMatch(out, /## Licence/)
  })

  it("returns the README unchanged when nothing matches", () => {
    const readme =
      "# t\n\nintro\n\n## Design notes\n\nwords\n\n## Changelog\n\nmore\n"
    assert.equal(filterLanding(readme), readme)
  })

  it("keeps a disclaimer section after the pitch", () => {
    const out = filterLanding(
      "# t\n\nintro\n\n## Disclaimer\n\nunofficial\n\n## Features\n\na\n\n## Install\n\nnpm i t\n\n## Development\n\ndev\n",
    )
    assert.match(out, /## Disclaimer\n\nunofficial/)
    assert.doesNotMatch(out, /## Development/)
    assert.doesNotMatch(out, /\n\n\n/)
  })

  it("returns the README unchanged when only one bucket matches", () => {
    const readme =
      "# t\n\nintro\n\n## Install\n\nnpm i t\n\n## Issues\n\nlong reference\n"
    assert.equal(filterLanding(readme), readme)
  })

  it("does not mistake fenced '#' lines for headings", () => {
    const readme = [
      "# t",
      "",
      "intro",
      "",
      "```sh",
      "## not a heading",
      "### not a subheading",
      "```",
      "",
      "## Usage",
      "",
      "real use",
      "",
      "```console",
      "## sample output",
      "```",
      "",
    ].join("\n")
    const out = filterLanding(readme)
    assert.match(out, /## Usage/)
    assert.match(out, /## sample output/)
    assert.match(out, /## not a heading/)
  })

  it("keeps H3 subsections outside the usage bucket", () => {
    const readme =
      "# t\n\nintro\n\n## Features\n\nlist\n\n### Details\n\nkept\n"
    const out = filterLanding(readme)
    assert.match(out, /### Details/)
    assert.match(out, /kept/)
  })
})

describe("countWords", () => {
  it("counts whitespace-separated tokens", () => {
    assert.equal(countWords("one two\nthree"), 3)
    assert.equal(countWords(""), 0)
  })
  it("the budget is ~350 words", () => {
    assert.equal(LANDING_WORD_BUDGET, 350)
  })
})
