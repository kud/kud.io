import { test } from "node:test"
import assert from "node:assert/strict"
import { access } from "node:fs/promises"
import { isAbsolute, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  CONTENT_DIR,
  IGNORE_FILE,
  PUBLIC_APPS_DIR,
  ROOT,
  taggedAndArchivedLine,
} from "./check-repos.js"

const repoRoot = fileURLToPath(new URL("..", import.meta.url))

test("site-side paths resolve from the repo root, not the working directory", async () => {
  const cwd = process.cwd()
  try {
    process.chdir(join(repoRoot, "scripts"))
    assert.equal(ROOT, repoRoot)
    for (const path of [CONTENT_DIR, PUBLIC_APPS_DIR, IGNORE_FILE]) {
      assert.ok(isAbsolute(path), `${path} is absolute`)
      assert.ok(path.startsWith(repoRoot), `${path} sits under the repo root`)
      await access(path)
    }
  } finally {
    process.chdir(cwd)
  }
})

test("an archived tagged repo reads as a stale topic, not a live page", () => {
  const line = taggedAndArchivedLine("gh-pr-comments")
  assert.match(line, /^⚠ gh-pr-comments is tagged kud-site and archived/)
  assert.match(line, /the sync skips it/)
  assert.doesNotMatch(line, /rendering as live/)
})
