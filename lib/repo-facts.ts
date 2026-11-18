import { readFileSync } from "node:fs"
import { join } from "node:path"

// The part of a package.json the site reads, as scripts/lib/repo-facts.js
// stores it.
export type PackageFact = {
  name: string | null
  private: boolean
  bin: string | Record<string, string> | null
  node: string | null
  peers: string[]
  dependencies: string[]
}

export type RepoFacts = {
  // Keyed by folder: "" is the repo root, "cli" a monorepo surface. A null
  // value means the sync looked and the repo has no package.json there.
  packages: Record<string, PackageFact | null>
  tag: {
    name: string
    version: string
    sha: string | null
    date: string | null
  } | null
}

// Written by scripts/sync-content.js, so releases are read from disk rather
// than asked of GitHub per project on every build. A repo missing from the
// file (new since the last sync) falls back to the live lookups.
let cache: Record<string, RepoFacts> | null = null

const readFacts = (): Record<string, RepoFacts> => {
  if (cache) return cache
  try {
    cache = JSON.parse(
      readFileSync(
        join(process.cwd(), "content", "projects", "repo-facts.json"),
        "utf8",
      ),
    ) as Record<string, RepoFacts>
  } catch {
    cache = {}
  }
  return cache
}

export const getRepoFacts = (slug: string): RepoFacts | null =>
  readFacts()[slug] ?? null

// undefined: the sync never looked, so ask GitHub. null: it looked and found
// no package.json there.
export const getPackageFact = (
  slug: string,
  path = "",
): PackageFact | null | undefined => {
  const facts = getRepoFacts(slug)
  if (!facts || !Object.hasOwn(facts.packages, path)) return undefined
  return facts.packages[path]
}
