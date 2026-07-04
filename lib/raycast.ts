import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { Project } from "@/lib/projects"

// Mirrors the records the sync writes to content/raycast.json (Raycast store
// metadata + the monorepo README rendered as the landing).
type RaycastRecord = {
  slug: string
  name: string
  description: string | null
  icon: string | null
  tags: string[]
  repoUrl: string
  storeUrl: string
  installUrl: string
  downloads: number
  updatedAt: string
}

// Raycast extensions live as subdirectories of the raycast/extensions monorepo —
// there's no kud-owned repo to tag `kud-site`, so they can't come from the topic
// search. The sync curates them into content/raycast.json instead; here we read
// that file and shape each record into a Project so they merge into the grid.
export const RAYCAST_CATEGORY = "raycast"

let cache: Project[] | null = null

export const getRaycastProjects = (): Project[] => {
  if (cache) return cache
  let records: RaycastRecord[]
  try {
    records = JSON.parse(
      readFileSync(join(process.cwd(), "content", "raycast.json"), "utf8"),
    ) as RaycastRecord[]
  } catch {
    cache = []
    return cache
  }
  cache = records.map((record) => ({
    slug: record.slug,
    name: record.name,
    description: record.description,
    category: RAYCAST_CATEGORY,
    ecosystem: null,
    readmeLanding: false,
    tags: record.tags ?? [],
    icon: record.icon,
    accent: null,
    topics: [],
    repoUrl: record.repoUrl,
    // The store page is the natural "homepage" for an extension.
    homepage: record.storeUrl,
    storeUrl: record.storeUrl,
    installUrl: record.installUrl,
    downloads: record.downloads,
    // Raycast has no stars/language; the card shows the download count instead.
    stars: 0,
    language: null,
    // Every extension in raycast/extensions ships under the monorepo's MIT licence.
    license: "MIT",
    pushedAt: record.updatedAt,
  }))
  return cache
}
