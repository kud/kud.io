// What the build needs to know about each repo's releases, read once by the
// sync and committed as content/projects/repo-facts.json. The build used to ask
// GitHub for it on every run: a package.json, a tag list and a commit per
// project, about three calls each, so a cold build made a few hundred and grew
// with every repo. Unauthenticated (Vercel's own preview builds carry no
// token) that is past GitHub's 60 an hour by the twentieth project, and the
// preview of 2026-11-14 failed on it. Nothing here does I/O.

// Only plain `vX.Y.Z` tags count: a monorepo's prefixed tags (`webext-v1.5.0`)
// belong to one of its parts. Mirrors fromTags in lib/release.ts.
const SEMVER_TAG = /^v?(\d+)\.(\d+)\.(\d+)$/

// The highest semver tag in a GitHub tags listing, or null. The API lists tags
// by name, not by version, so the order it returns means nothing.
export const latestSemverTag = (tags) =>
  (Array.isArray(tags) ? tags : [])
    .map((tag) => ({ tag, parts: SEMVER_TAG.exec(tag?.name ?? "") }))
    .filter((entry) => entry.parts)
    .map((entry) => ({
      tag: entry.tag,
      version: entry.parts.slice(1).map(Number),
    }))
    .sort(
      (a, b) =>
        b.version[0] - a.version[0] ||
        b.version[1] - a.version[1] ||
        b.version[2] - a.version[2],
    )
    .map((entry) => ({
      name: entry.tag.name,
      version: entry.version.join("."),
      sha: entry.tag.commit?.sha ?? null,
    }))[0] ?? null

// The part of a package.json the site reads (lib/release.ts, lib/package-facts.ts).
// Dependencies keep their names only: a version bump is not news to the site,
// and keeping ranges would make every dependency PR rewrite the file.
export const packageFact = (pkg) => {
  if (!pkg || typeof pkg !== "object") return null
  return {
    name: typeof pkg.name === "string" ? pkg.name : null,
    private: pkg.private === true,
    bin: pkg.bin ?? null,
    node: pkg.engines?.node ?? null,
    peers: Object.keys(pkg.peerDependencies ?? {}).sort(),
    dependencies: Object.keys(pkg.dependencies ?? {}).sort(),
  }
}

// A tag's date is its commit's, one call per lookup. When the latest tag is
// the one already on file, at the same commit, its date is reused: in a
// steady state the sync pays one tags listing per repo and nothing more.
// (Skipping on the repo's pushed_at would save that listing too, but it has
// to be stored, and a stored pushed_at rewrites this committed file, which
// then triggers a production deploy, on every push to any repo.)
export const reusableDate = (previous, latest) =>
  previous &&
  latest &&
  previous.name === latest.name &&
  previous.sha === latest.sha
    ? previous.date
    : undefined

// Surfaces name the repo they ship from in `from`, which is not always the
// repo the declaration lives in; group the paths by that repo.
export const surfacePathsByRepo = (declarations) => {
  const byRepo = {}
  for (const decl of declarations)
    for (const surface of decl?.surfaces ?? [])
      if (surface?.from && surface?.path)
        (byRepo[surface.from] ??= new Set()).add(surface.path)
  return Object.fromEntries(
    Object.entries(byRepo).map(([repo, paths]) => [repo, ["", ...paths]]),
  )
}

// Stable key order, so the committed file only changes when a fact does.
export const sortFacts = (facts) =>
  Object.fromEntries(
    Object.keys(facts)
      .sort()
      .map((repo) => [
        repo,
        {
          ...facts[repo],
          packages: Object.fromEntries(
            Object.keys(facts[repo].packages ?? {})
              .sort()
              .map((path) => [path, facts[repo].packages[path]]),
          ),
        },
      ]),
  )
