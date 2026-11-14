import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { deriveFixtures, FIXTURE_CONTENT } from "./generate.ts"

// The pages are built and tested against these files, so they must be exactly
// what the pipeline writes. On a failure, run `npm run newsletter:fixtures`.
describe("newsletter fixtures", () => {
  it("match what the pipeline derives from editions.ts", async () => {
    const derived = deriveFixtures()
    assert.ok(derived.length >= 2)
    for (const { date, files } of derived)
      for (const [name, text] of Object.entries(files))
        assert.equal(
          await readFile(path.join(FIXTURE_CONTENT, date, name), "utf8"),
          text,
          `${date}/${name} drifted: run npm run newsletter:fixtures`,
        )
  })
})
