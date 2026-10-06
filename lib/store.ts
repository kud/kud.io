import type { Project } from "@/lib/projects"
import { CATEGORY_META, isAppCategory, labelFor } from "@/lib/categories"

// A project enriched with its storefront elements, assembled server-side in
// app/projects/page.tsx: the app tagline + launch URL + screenshots (app.json)
// and whether a docs route exists (projectHasDocs).
export type StoreProject = Project & {
  tagline: string | null
  launchUrl: string | null
  screenshots: string[]
  docs: boolean
}

export type StoreAction = {
  label: string
  href: string
  external: boolean
}

export type Shelf = {
  key: string
  title: string
  blurb: string
  label: string
  cap: number
  items: StoreProject[]
}

// Shelves in display order. UI and design-system libraries sit under Libraries.
const SHELF_DEFS: Array<{
  key: string
  title: string
  blurb: string
  label: string
  cap: number
  categories: string[]
}> = [
  {
    key: "webext",
    title: "Firefox add-ons",
    blurb: "Small add-ons that smooth the sites I use every day.",
    label: "Firefox",
    cap: 4,
    categories: ["webext"],
  },
  {
    key: "raycast",
    title: "Raycast extensions",
    blurb: "Published to the Raycast Store — install from the launcher.",
    label: "Raycast",
    cap: 6,
    categories: ["raycast"],
  },
  {
    key: "cli",
    title: "Command-line tools",
    blurb: "Tools I reach for daily, one install away.",
    label: "CLI",
    cap: 6,
    categories: ["cli"],
  },
  {
    key: "mcp",
    title: "MCP servers",
    blurb: "Connect Claude and other assistants to the tools you already use.",
    label: "MCP",
    cap: 6,
    categories: ["mcp"],
  },
  {
    key: "claude",
    title: "For Claude Code",
    blurb: "Session managers, dashboards and plugin collections.",
    label: "Claude Code",
    cap: 4,
    categories: ["claude"],
  },
  {
    key: "lib",
    title: "Libraries",
    blurb: "The cores the CLIs, servers and extensions are built on.",
    label: "npm",
    cap: 6,
    categories: ["lib", "ui"],
  },
]

// Platform label for categories outside the six shelves (rendered as extra
// shelves so no project is dropped from the page).
const EXTRA_LABELS: Record<string, string> = {
  vscode: "VS Code",
  theme: "VS Code",
  other: "List",
}

// Featured ordering preference — nothing more than a preference: only projects
// that actually ship screenshots can be featured, and anything unlisted here
// still qualifies on recency.
export const FEATURED_ORDER = ["planning-poker", "globetrotter", "brit-ready"]

// Featured candidates: app-launcher projects with at least one screenshot,
// preference order first, then most recently pushed.
export const selectFeatured = (projects: StoreProject[]): StoreProject[] => {
  const order = new Map(FEATURED_ORDER.map((slug, index) => [slug, index]))
  return projects
    .filter(
      (project) => isAppCategory(project.category) && project.screenshots.length > 0,
    )
    .sort((a, b) => {
      const rankA = order.has(a.slug) ? order.get(a.slug)! : FEATURED_ORDER.length
      const rankB = order.has(b.slug) ? order.get(b.slug)! : FEATURED_ORDER.length
      return rankA - rankB || b.pushedAt.localeCompare(a.pushedAt)
    })
}

export const selectApps = (projects: StoreProject[]): StoreProject[] =>
  projects
    .filter((project) => isAppCategory(project.category))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))

// Group non-app projects into shelves in brief order; any category not covered
// by the six shelves gets its own shelf from CATEGORY_META so it still renders.
export const buildShelves = (projects: StoreProject[]): Shelf[] => {
  const rest = projects.filter((project) => !isAppCategory(project.category))
  const byCategory = new Map<string, StoreProject[]>()
  for (const project of rest) {
    const list = byCategory.get(project.category) ?? []
    list.push(project)
    byCategory.set(project.category, list)
  }
  const claimed = new Set(SHELF_DEFS.flatMap((shelf) => shelf.categories))
  const shelves: Shelf[] = SHELF_DEFS.map((def) => ({
    ...def,
    items: def.categories
      .flatMap((category) => byCategory.get(category) ?? [])
      .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt)),
  }))
  for (const [category, items] of byCategory) {
    if (claimed.has(category)) continue
    shelves.push({
      key: category,
      title: labelFor(category),
      blurb: CATEGORY_META[category]?.blurb ?? "",
      label: EXTRA_LABELS[category] ?? labelFor(category),
      cap: 6,
      items: [...items].sort((a, b) => b.pushedAt.localeCompare(a.pushedAt)),
    })
  }
  return shelves
}

// The tile itself links to the landing (/projects/<slug>); this is the one
// action button beside it: Open for web apps, Install for Raycast, Add for
// Firefox, Docs where the project has authored docs. Anything else has none.
export const actionFor = (project: StoreProject): StoreAction | null => {
  if (isAppCategory(project.category))
    return project.launchUrl
      ? { label: "Open", href: project.launchUrl, external: true }
      : null
  if (project.category === "webext")
    return project.storeUrl
      ? { label: "Add", href: project.storeUrl, external: true }
      : null
  if (project.category === "raycast") {
    const href = project.installUrl ?? project.storeUrl
    return href ? { label: "Install", href, external: true } : null
  }
  if (project.docs)
    return {
      label: "Docs",
      href: `/projects/${project.slug}/docs`,
      external: false,
    }
  return null
}
