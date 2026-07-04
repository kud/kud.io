import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type { Project } from "@/lib/projects"

// A monorepo ships several surfaces (a CLI, a webextension, a Raycast extension…)
// from one repo, so the repo→card model gives it a single lonely card. A
// `content/projects/<slug>/surfaces.json` declares those surfaces so the family
// renders like a normal multi-repo ecosystem: each surface a card, all sharing
// one ecosystem. This mirrors how Raycast extensions are synthesised.
type SurfaceDecl = {
  slug: string
  category: string
  // Present only for a surface that has no card of its own (e.g. the CLI folder)
  // — names the parent repo whose card to clone metadata from.
  from?: string
  name?: string
  description?: string
}
type MonorepoDecl = { ecosystem: string; surfaces: SurfaceDecl[] }

const CONTENT_DIR = join(process.cwd(), "content", "projects")

const getMonorepoDecls = (): MonorepoDecl[] => {
  let slugs: string[]
  try {
    slugs = readdirSync(CONTENT_DIR)
  } catch {
    return []
  }
  const decls: MonorepoDecl[] = []
  for (const slug of slugs) {
    try {
      const raw = readFileSync(join(CONTENT_DIR, slug, "surfaces.json"), "utf8")
      const data = JSON.parse(raw) as MonorepoDecl
      if (data.ecosystem && Array.isArray(data.surfaces)) decls.push(data)
    } catch {
      // No surfaces.json in this project dir — not a monorepo, skip.
    }
  }
  return decls
}

// Apply every monorepo declaration to the assembled project list: stamp the
// ecosystem onto surfaces that already have a card (the repo card, a synthesised
// Raycast card), and synthesise the ones that don't (a CLI folder) by cloning
// their parent repo's metadata. Synthesised surfaces share the parent's README.
export const applyMonorepos = (projects: Project[]): Project[] => {
  const decls = getMonorepoDecls()
  if (decls.length === 0) return projects

  const present = new Set(projects.map((project) => project.slug))
  const stamp = new Map<string, string>()
  const toSynth: Array<{ ecosystem: string; surface: SurfaceDecl }> = []
  for (const decl of decls)
    for (const surface of decl.surfaces)
      if (present.has(surface.slug)) stamp.set(surface.slug, decl.ecosystem)
      else toSynth.push({ ecosystem: decl.ecosystem, surface })

  const bySlug = new Map(projects.map((project) => [project.slug, project]))
  const stamped = projects.map((project) =>
    stamp.has(project.slug)
      ? { ...project, ecosystem: stamp.get(project.slug) ?? null }
      : project,
  )
  const synthesised = toSynth.flatMap(({ ecosystem, surface }) => {
    const parent = surface.from ? bySlug.get(surface.from) : undefined
    if (!parent) return []
    return [
      {
        ...parent,
        slug: surface.slug,
        name: surface.name ?? surface.slug,
        description: surface.description ?? parent.description,
        category: surface.category,
        ecosystem,
        // Landing borrows the monorepo's README; store metrics are surface-
        // specific, so they don't carry over from the parent.
        readmeSlug: parent.slug,
        users: null,
        downloads: null,
        storeUrl: null,
        installUrl: null,
      },
    ]
  })
  return [...stamped, ...synthesised]
}
