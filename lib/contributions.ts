import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ghHeaders } from "@/lib/projects"

// Where I've contributed beyond my own projects, shown at the end of /projects:
//  - Raycast extensions where I'm a contributor (not the author) in the
//    raycast/extensions monorepo — rendered store-style (icon, downloads,
//    commands, Install), enriched live from the Raycast store API.
//  - External GitHub repos I've upstreamed work to — with a live merged-PR count.
// Curated in content/contributions.json; counts/metadata fetched at build.

export type RaycastContribution = {
  kind: "raycast"
  title: string
  description: string | null
  icon: string | null
  downloads: number
  commands: number
  storeUrl: string
  installUrl: string
}

export type RepoContribution = {
  kind: "repo"
  repo: string
  label: string
  note: string
  description: string | null
  ownerAvatar: string | null
  mergedPrs: number
  stars: number
  url: string
}

export type Contribution = RaycastContribution | RepoContribution

type RaycastEntry = { owner: string; slug: string }
type RepoEntry = { repo: string; label?: string; note?: string }
type ContributionsFile = {
  user: string
  raycast: RaycastEntry[]
  repos: RepoEntry[]
}

const readConfig = async (): Promise<ContributionsFile> => {
  try {
    const raw = await readFile(
      join(process.cwd(), "content", "contributions.json"),
      "utf8",
    )
    return JSON.parse(raw) as ContributionsFile
  } catch {
    return { user: "kud", raycast: [], repos: [] }
  }
}

const raycastContribution = async (
  entry: RaycastEntry,
): Promise<RaycastContribution | null> => {
  const res = await fetch(
    `https://backend.raycast.com/api/v1/extensions/${entry.owner}/${entry.slug}`,
    { next: { revalidate: 3600 } },
  )
  if (!res.ok) return null
  const meta = (await res.json()) as {
    errors?: unknown
    title?: string
    description?: string | null
    download_count?: number
    commands?: unknown[]
    store_url?: string
    icons?: { dark?: string; light?: string }
  }
  if (meta.errors || !meta.title) return null
  const storeUrl =
    meta.store_url ?? `https://www.raycast.com/${entry.owner}/${entry.slug}`
  return {
    kind: "raycast",
    title: meta.title,
    description: meta.description ?? null,
    icon: meta.icons?.dark ?? meta.icons?.light ?? null,
    downloads: meta.download_count ?? 0,
    commands: Array.isArray(meta.commands) ? meta.commands.length : 0,
    storeUrl,
    // The Raycast deep link the store "Install" button uses.
    installUrl: `${storeUrl.replace("https://www.raycast.com/", "raycast://extensions/")}?source=webstore`,
  }
}

const mergedPrCount = async (user: string, repo: string): Promise<number> => {
  const query = `author:${user} type:pr is:merged repo:${repo}`
  const res = await fetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
    { headers: ghHeaders(), next: { revalidate: 3600 } },
  )
  if (!res.ok) return 0
  const data = (await res.json()) as { total_count?: number }
  return data.total_count ?? 0
}

const repoContribution = async (
  user: string,
  entry: RepoEntry,
): Promise<RepoContribution> => {
  const [mergedPrs, metaRes] = await Promise.all([
    mergedPrCount(user, entry.repo),
    fetch(`https://api.github.com/repos/${entry.repo}`, {
      headers: ghHeaders(),
      next: { revalidate: 3600 },
    }),
  ])
  const meta = metaRes.ok
    ? ((await metaRes.json()) as {
        description: string | null
        html_url: string
        stargazers_count: number
        owner: { avatar_url: string }
      })
    : null
  const [, name] = entry.repo.split("/")
  return {
    kind: "repo",
    repo: entry.repo,
    label: entry.label ?? name,
    note: entry.note ?? "",
    description: meta?.description ?? null,
    ownerAvatar: meta?.owner.avatar_url ?? null,
    mergedPrs,
    stars: meta?.stargazers_count ?? 0,
    url: meta?.html_url ?? `https://github.com/${entry.repo}`,
  }
}

// Curated order is preserved (Raycast extensions first, then repos) so the list
// reads editorially rather than by a single metric.
export const getContributions = async (): Promise<Contribution[]> => {
  const { user, raycast, repos } = await readConfig()
  const [raycastItems, repoItems] = await Promise.all([
    Promise.all(raycast.map(raycastContribution)),
    Promise.all(repos.map((entry) => repoContribution(user, entry))),
  ])
  return [...raycastItems.filter((item) => item !== null), ...repoItems]
}
