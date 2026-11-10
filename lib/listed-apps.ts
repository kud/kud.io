import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { Project } from "@/lib/projects"

// A tile with no repository behind it: the Project shape minus the source, plus
// the live address the tile opens instead of a kud.io page.
export type ListedProject = Omit<Project, "repoUrl"> & { href: string }

// Live apps whose source is not public. They cannot be tagged on GitHub, so
// they are listed by hand in content/apps.json (outside content/projects/, which
// the sync prunes). Nothing here names or links a repository: the tile opens the
// live app, and there is no kud.io page, release, README or star count behind it.
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

export const getListedApps = (): ListedProject[] => {
  let records: ListedApp[]
  try {
    records = JSON.parse(
      readFileSync(join(process.cwd(), "content", "apps.json"), "utf8"),
    ) as ListedApp[]
  } catch {
    return []
  }
  return records.map((record) => ({
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
    href: record.url,
    stars: 0,
    language: null,
    license: null,
    pushedAt: "",
    createdAt: null,
  }))
}
