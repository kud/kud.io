import type { Project } from "@/lib/projects"
import { capitalCase } from "change-case"

// Curated display names for `kud-site-eco-<key>` product families — the repo
// stem rarely capitalises the way the product is written (bsky → Bluesky). Any
// key without an entry falls back to capitalCase. Membership itself is driven
// entirely by the repo topics, never listed here.
const ECOSYSTEM_META: Record<string, { name: string }> = {
  qobuz: { name: "Qobuz" },
  bsky: { name: "Bluesky" },
  gtv: { name: "Google TV" },
  jenkins: { name: "Jenkins" },
  revu: { name: "Revu" },
  pcloud: { name: "pCloud" },
  "macos-media-keys": { name: "macOS Media Keys" },
}

export const ecosystemName = (key: string): string =>
  ECOSYSTEM_META[key]?.name ?? capitalCase(key)

export type Ecosystem = {
  key: string
  name: string
  count: number
  // The distinct categories the family spans (lib, cli, mcp…), for the tile's
  // "surfaces" hint.
  categories: string[]
  icon: string | null
}

// Derive the ecosystems present in a project set: how many surfaces each has,
// which categories they span, and a representative icon. An ecosystem is only
// meaningful with 2+ surfaces, so lone members (a stray eco topic) are dropped.
export const getEcosystems = (
  projects: Project[],
  icons: Record<string, string>,
): Ecosystem[] => {
  const families = new Map<string, Project[]>()
  for (const project of projects) {
    if (!project.ecosystem) continue
    families.set(project.ecosystem, [
      ...(families.get(project.ecosystem) ?? []),
      project,
    ])
  }

  return [...families.entries()]
    .filter(([, members]) => members.length >= 2)
    .map(([key, members]) => {
      // The shared library/core is the natural face of the family; otherwise
      // fall back to whichever member has a synced icon, then the first member.
      const core = members.find((member) => member.category === "lib")
      const face =
        core ?? members.find((member) => icons[member.slug]) ?? members[0]
      return {
        key,
        name: ecosystemName(key),
        count: members.length,
        categories: [...new Set(members.map((member) => member.category))],
        icon: icons[face.slug] ?? face.icon ?? null,
      }
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
