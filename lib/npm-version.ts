import { ghHeaders } from "@/lib/projects"

const OWNER = "kud"

export type NpmRelease = {
  name: string
  version: string
  url: string
}

type PackageJson = { name?: string; private?: boolean }

// The latest published npm version of a project, for its landing hero. The
// package name comes from the repo's own package.json, so a renamed or scoped
// package needs no mapping here; apps, private packages and repos without a
// package.json resolve to null and show nothing.
export const getNpmRelease = async (
  slug: string,
): Promise<NpmRelease | null> => {
  try {
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
    if (!version) return null

    return {
      name: pkg.name,
      version,
      url: `https://www.npmjs.com/package/${pkg.name}`,
    }
  } catch {
    return null
  }
}
