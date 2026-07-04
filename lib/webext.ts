import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { Project } from "@/lib/projects"

// `kud-site-webext` projects are Firefox add-ons. Unlike Raycast extensions they
// own a GitHub repo, so they arrive via the normal topic search — this module
// only adds the store "elements": the AMO listing URL and the live user count.
export const WEBEXT_CATEGORY = "webext"

// The only authored bit of store metadata is the AMO slug (the repo name rarely
// matches it). Lives in content/projects/<slug>/webext.json so it survives
// sync-content runs, and is read server-side only.
type WebextMeta = { amo: string | null }

const getWebextMeta = (slug: string): WebextMeta => {
  try {
    const raw = readFileSync(
      join(process.cwd(), "content", "projects", slug, "webext.json"),
      "utf8",
    )
    const data = JSON.parse(raw) as Partial<WebextMeta>
    return { amo: data.amo ?? null }
  } catch {
    return { amo: null }
  }
}

// AMO API v5 — public and unauthenticated. `average_daily_users` is the metric
// addons.mozilla.org itself surfaces (there is no meaningful "downloads" figure).
type AmoAddon = { average_daily_users?: number; slug?: string }

const fetchAmo = async (
  amoSlug: string,
): Promise<{ users: number | null; storeUrl: string } | null> => {
  try {
    const res = await fetch(
      `https://addons.mozilla.org/api/v5/addons/addon/${amoSlug}/`,
      { headers: { Accept: "application/json" }, next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const data = (await res.json()) as AmoAddon
    return {
      users: data.average_daily_users ?? null,
      // The locale-less listing URL redirects to the visitor's language, so it's
      // friendlier than AMO's own `url` (which is pinned to /en-US/).
      storeUrl: `https://addons.mozilla.org/firefox/addon/${data.slug ?? amoSlug}/`,
    }
  } catch {
    return null
  }
}

// Overlay the AMO listing URL + live user count onto each Firefox add-on. A
// project with no webext.json (or whose AMO lookup fails) is returned untouched,
// so its landing falls back to the plain "View source" elements.
export const enrichWebextProjects = async (
  projects: Project[],
): Promise<Project[]> =>
  Promise.all(
    projects.map(async (project) => {
      if (project.category !== WEBEXT_CATEGORY) return project
      const { amo } = getWebextMeta(project.slug)
      if (!amo) return project
      const stats = await fetchAmo(amo)
      if (!stats) return project
      return {
        ...project,
        storeUrl: stats.storeUrl,
        homepage: project.homepage ?? stats.storeUrl,
        users: stats.users,
      }
    }),
  )
