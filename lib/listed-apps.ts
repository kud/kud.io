import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { Project } from "@/lib/projects"
import { getApp, isProduct } from "@/lib/app"

// A tile with no public repository behind it: the Project shape minus the
// source. `href` is the live address the tile opens, set only when the app has
// no kud.io page of its own.
export type ListedProject = Omit<Project, "repoUrl"> & { href?: string }

// Live apps whose source is not public. They cannot be tagged on GitHub, so
// they are listed by hand in content/apps.json (outside content/projects/, which
// the sync prunes). Nothing here names or links a repository. A listed product
// with an engineering record (content/projects/<slug>/app.json, kept by the
// sync for every slug listed here) gets a kud.io page like any product, and its
// tile opens that page; any other listed app's tile opens the live app.
type ListedApp = {
  slug: string
  name: string
  description: string
  url: string
  icon: string | null
  accent?: string | null
  // "product" for a beansontoast app, "app" for any other.
  section: "product" | "app"
}

const readListed = (): ListedApp[] => {
  try {
    return JSON.parse(
      readFileSync(join(process.cwd(), "content", "apps.json"), "utf8"),
    ) as ListedApp[]
  } catch {
    return []
  }
}

const hasRecord = (slug: string): boolean => isProduct(getApp(slug))

export const getListedApps = (): ListedProject[] =>
  readListed().map((record) => ({
    slug: record.slug,
    name: record.name,
    description: record.description,
    category: record.section,
    ecosystem: null,
    readmeLanding: false,
    tags: [],
    icon: record.icon,
    accent: record.accent ?? null,
    topics: [],
    homepage: record.url,
    href: hasRecord(record.slug) ? undefined : record.url,
    stars: 0,
    language: null,
    license: null,
    pushedAt: "",
    createdAt: null,
    isPrivate: true,
  }))

// The listed apps that have a kud.io page, as the page reads a project. The
// repo URL is left empty and `isPrivate` set, so the page renders no source
// link, release, licence or dates (it has no GitHub record to take them from).
export const getListedRecords = (): Project[] =>
  getListedApps()
    .filter((app) => app.href === undefined)
    .map((app) => ({ ...app, repoUrl: "" }))
