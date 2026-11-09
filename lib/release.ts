import { ghHeaders } from "@/lib/projects"

const OWNER = "kud"

export type Release = {
  version: string
  url: string
}

type PackageJson = { name?: string; private?: boolean }

const SEMVER_TAG = /^v?(\d+)\.(\d+)\.(\d+)$/

const compareSemver = (a: number[], b: number[]) =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

// What `npm install` gets: the registry's latest, read through the package
// name in the repo's own package.json. Private and unpublished packages fall
// through to the tags.
const fromNpm = async (slug: string): Promise<Release | null> => {
  const pkgRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${slug}/contents/package.json`,
    {
      headers: { ...ghHeaders(), Accept: "application/vnd.github.raw+json" },
      next: { revalidate: 3600 },
    },
  )
  if (!pkgRes.ok) return null
  const pkg = (await pkgRes.json()) as PackageJson
  if (!pkg.name || pkg.private) return null

  const npmRes = await fetch(
    `https://registry.npmjs.org/${pkg.name.replace("/", "%2F")}/latest`,
    { next: { revalidate: 3600 } },
  )
  if (!npmRes.ok) return null
  const { version } = (await npmRes.json()) as { version?: string }
  return version
    ? { version, url: `https://www.npmjs.com/package/${pkg.name}` }
    : null
}

// Apps, extensions and themes ship from tags. Only plain `vX.Y.Z` tags count:
// a monorepo's prefixed tags (`webext-v1.5.0`) belong to one of its parts.
// The API lists tags by name, not by version, so the highest is picked here.
const fromTags = async (slug: string): Promise<Release | null> => {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${slug}/tags?per_page=100`,
    { headers: ghHeaders(), next: { revalidate: 3600 } },
  )
  if (!res.ok) return null
  const tags = (await res.json()) as { name: string }[]
  const latest = tags
    .map((tag) => ({ tag: tag.name, parts: SEMVER_TAG.exec(tag.name) }))
    .filter((t): t is { tag: string; parts: RegExpExecArray } => !!t.parts)
    .map((t) => ({ tag: t.tag, version: t.parts.slice(1).map(Number) }))
    .sort((a, b) => compareSemver(b.version, a.version))[0]
  return latest
    ? {
        version: latest.version.join("."),
        url: `https://github.com/${OWNER}/${slug}/releases/tag/${latest.tag}`,
      }
    : null
}

// The latest version of a project, for its landing hero: npm when published
// there, else the highest semver tag, else null and nothing shows.
export const getRelease = async (slug: string): Promise<Release | null> => {
  try {
    return (await fromNpm(slug)) ?? (await fromTags(slug))
  } catch {
    return null
  }
}
