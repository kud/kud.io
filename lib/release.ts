import { ghHeaders } from "@/lib/projects"
import { surfaceSource } from "@/lib/monorepo"

const OWNER = "kud"

export type Release = {
  version: string
  url: string
  // ISO date the version shipped; null when the source does not say.
  publishedAt: string | null
}

type PackageJson = { name?: string; private?: boolean }

type Packument = {
  "dist-tags"?: { latest?: string }
  time?: Record<string, string>
}

const SEMVER_TAG = /^v?(\d+)\.(\d+)\.(\d+)$/

const compareSemver = (a: number[], b: number[]) =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

// What `npm install` gets: the registry's latest, read through the package
// name in the repo's own package.json. Private and unpublished packages fall
// through to the tags.
const fromNpm = async (slug: string, path = ""): Promise<Release | null> => {
  const pkgRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${slug}/contents/${path ? `${path}/` : ""}package.json`,
    {
      headers: { ...ghHeaders(), Accept: "application/vnd.github.raw+json" },
      next: { revalidate: false },
    },
  )
  if (!pkgRes.ok) return null
  const pkg = (await pkgRes.json()) as PackageJson
  if (!pkg.name || pkg.private) return null

  // The full packument carries `time[version]`, the publish date; the
  // `/latest` shortcut does not.
  const npmRes = await fetch(
    `https://registry.npmjs.org/${pkg.name.replace("/", "%2F")}`,
    { next: { revalidate: false } },
  )
  if (!npmRes.ok) return null
  const packument = (await npmRes.json()) as Packument
  const version = packument["dist-tags"]?.latest
  return version
    ? {
        version,
        url: `https://www.npmjs.com/package/${pkg.name}`,
        publishedAt: packument.time?.[version] ?? null,
      }
    : null
}

// Apps, extensions and themes ship from tags. Only plain `vX.Y.Z` tags count:
// a monorepo's prefixed tags (`webext-v1.5.0`) belong to one of its parts.
// The API lists tags by name, not by version, so the highest is picked here.
const fromTags = async (slug: string): Promise<Release | null> => {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${slug}/tags?per_page=100`,
    { headers: ghHeaders(), next: { revalidate: false } },
  )
  if (!res.ok) return null
  const tags = (await res.json()) as { name: string; commit: { sha: string } }[]
  const latest = tags
    .map((tag) => ({ tag, parts: SEMVER_TAG.exec(tag.name) }))
    .filter((t): t is { tag: (typeof tags)[number]; parts: RegExpExecArray } =>
      Boolean(t.parts),
    )
    .map((t) => ({ tag: t.tag, version: t.parts.slice(1).map(Number) }))
    .sort((a, b) => compareSemver(b.version, a.version))[0]
  if (!latest) return null
  return {
    version: latest.version.join("."),
    url: `https://github.com/${OWNER}/${slug}/releases/tag/${latest.tag.name}`,
    publishedAt: await tagDate(slug, latest.tag.commit.sha),
  }
}

// A tag has no date of its own in the tags list; its commit's does. A failed
// lookup costs only the date, never the version.
const tagDate = async (slug: string, sha: string): Promise<string | null> => {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${slug}/commits/${sha}`,
    { headers: ghHeaders(), next: { revalidate: false } },
  )
  if (!res.ok) return null
  const commit = (await res.json()) as {
    commit?: { committer?: { date?: string } }
  }
  return commit.commit?.committer?.date ?? null
}

// The latest version of a project, for its landing hero: npm when published
// there, else the highest semver tag, else null and nothing shows. A surface
// synthesised from a monorepo (foxhop-cli) has no repo of its own: its version
// is what its folder publishes, and the monorepo's tags are not its own.
export const getRelease = async (slug: string): Promise<Release | null> => {
  try {
    const surface = surfaceSource(slug)
    if (surface) return await fromNpm(surface.repo, surface.path)
    return (await fromNpm(slug)) ?? (await fromTags(slug))
  } catch {
    return null
  }
}

const DAY = 86_400_000
const FRESH_DAYS = 14

// "3 days ago", and whether the release is new enough to call out.
export const releaseAge = (
  publishedAt: string | null,
  now = Date.now(),
): { label: string; fresh: boolean } | null => {
  const at = publishedAt ? Date.parse(publishedAt) : NaN
  if (Number.isNaN(at)) return null
  const days = Math.max(0, Math.floor((now - at) / DAY))
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" })
  const label =
    days < 30
      ? rtf.format(-days, "day")
      : days < 365
        ? rtf.format(-Math.floor(days / 30), "month")
        : rtf.format(-Math.floor(days / 365), "year")
  return { label, fresh: days < FRESH_DAYS }
}
