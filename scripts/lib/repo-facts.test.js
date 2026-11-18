import { test } from "node:test"
import assert from "node:assert/strict"
import {
  latestSemverTag,
  packageFact,
  reusableDate,
  sortFacts,
  surfacePathsByRepo,
} from "./repo-facts.js"

const tag = (name, sha = `sha-${name}`) => ({ name, commit: { sha } })

test("latestSemverTag picks the highest version, not the first listed", () => {
  const latest = latestSemverTag([
    tag("v1.9.0"),
    tag("v1.10.0"),
    tag("v1.2.3"),
  ])
  assert.deepEqual(latest, {
    name: "v1.10.0",
    version: "1.10.0",
    sha: "sha-v1.10.0",
  })
})

test("latestSemverTag ignores a monorepo part's prefixed tags", () => {
  assert.equal(
    latestSemverTag([tag("webext-v9.0.0"), tag("v0.1.0")]).name,
    "v0.1.0",
  )
  assert.equal(latestSemverTag([tag("webext-v9.0.0")]), null)
  assert.equal(latestSemverTag(undefined), null)
})

test("packageFact keeps dependency names, never their ranges", () => {
  const fact = packageFact({
    name: "@kud/thing",
    bin: { thing: "dist/cli.js" },
    engines: { node: ">=22" },
    dependencies: { zod: "^4.0.0", ink: "^6.0.0" },
    peerDependencies: { react: "^19.0.0" },
  })
  assert.deepEqual(fact, {
    name: "@kud/thing",
    private: false,
    bin: { thing: "dist/cli.js" },
    node: ">=22",
    peers: ["react"],
    dependencies: ["ink", "zod"],
  })
  assert.equal(packageFact(null), null)
  assert.equal(packageFact({ private: true }).private, true)
})

test("reusableDate reuses a date only for the same tag at the same commit", () => {
  const previous = { name: "v1.0.0", sha: "a", date: "2026-01-01T00:00:00Z" }
  assert.equal(
    reusableDate(previous, { name: "v1.0.0", sha: "a" }),
    previous.date,
  )
  assert.equal(reusableDate(previous, { name: "v1.0.0", sha: "b" }), undefined)
  assert.equal(reusableDate(previous, { name: "v1.0.1", sha: "a" }), undefined)
  assert.equal(reusableDate(undefined, { name: "v1.0.0", sha: "a" }), undefined)
})

test("surfacePathsByRepo groups surface folders under the repo they ship from", () => {
  const paths = surfacePathsByRepo([
    {
      surfaces: [
        { slug: "foxhop-cli", from: "foxhop", path: "cli" },
        { slug: "foxhop", category: "webext" },
      ],
    },
  ])
  assert.deepEqual(paths, { foxhop: ["", "cli"] })
})

test("sortFacts orders repos and package paths so the file diffs cleanly", () => {
  const sorted = sortFacts({
    b: { packages: { cli: null, "": null }, tag: null },
    a: { packages: {}, tag: null },
  })
  assert.deepEqual(Object.keys(sorted), ["a", "b"])
  assert.deepEqual(Object.keys(sorted.b.packages), ["", "cli"])
})
