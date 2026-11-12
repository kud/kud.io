import { getProjects } from "@/lib/projects"
import { getIcons } from "@/lib/icons"
import { getApp, appDisplayName, isProduct } from "@/lib/app"
import { isAppCategory, typeFor } from "@/lib/categories"
import { ART } from "@/lib/art"
import { getAllPosts, coverImages, postPath, readingMinutes } from "@/lib/blog"
import { getPackageFacts } from "@/lib/package-facts"
import { projectHasDocs } from "@/lib/source"
import { PINNED } from "@/lib/pinned"
import { getListedApps } from "@/lib/listed-apps"
import { ecosystemName } from "@/lib/ecosystems"
import { getRelease } from "@/lib/release"

// Everything the command launcher matches on without a round trip: the
// projects exactly as /projects lists them, every post, and the few facts a
// project's actions need. Docs stay on /api/search, which already indexes them.
export type LauncherProject = {
  slug: string
  name: string
  type: string
  category: string
  // The product family it belongs to (kud-site-eco-*), for the #key filter.
  ecosystem: { key: string; name: string } | null
  description: string | null
  icon: string | null
  // The project's 16:9 drawing, when one has been delivered (lib/art.ts).
  art: string | null
  pinned: boolean
  hasDocs: boolean
  repoUrl: string | null
  homepage: string | null
  storeUrl: string | null
  npm: { name: string; install: string } | null
  // A live app with no public source and no kud.io page (lib/listed-apps.ts):
  // its card opens the app itself, as on /projects.
  href?: string
}

export type LauncherPost = {
  title: string
  description: string
  date: string
  href: string
  thumb: string | null
  // The full-size cover, fetched only when the launcher shows the post's detail.
  cover: string | null
  minutes: number
  tags: string[]
}

// A project's latest version, for the empty launcher's Latest releases.
export type LauncherRelease = {
  slug: string
  version: string
  publishedAt: string
}

export type LauncherIndex = {
  projects: LauncherProject[]
  posts: LauncherPost[]
  // Newest first, only those with a known date.
  releases: LauncherRelease[]
}

// How many releases the index carries; the launcher shows fewer.
const RELEASES = 8

// Only these ship to npm; a lookup for a theme or an app is a wasted request.
const NPM_CATEGORIES = new Set(["cli", "mcp", "lib", "ui", "claude"])

export const getLauncherIndex = async (): Promise<LauncherIndex> => {
  const [projects, icons, posts] = await Promise.all([
    getProjects(),
    getIcons(),
    getAllPosts(),
  ])

  const launcherProjects = await Promise.all(
    projects.map(async (project): Promise<LauncherProject> => {
      const app = isAppCategory(project.category) ? getApp(project.slug) : null
      const category = app && isProduct(app) ? "product" : project.category
      const facts =
        !project.isPrivate && NPM_CATEGORIES.has(project.category)
          ? await getPackageFacts(project.slug)
          : null
      return {
        slug: project.slug,
        name: app ? appDisplayName(project.slug, app) : project.name,
        type: typeFor(category),
        category,
        ecosystem: project.ecosystem
          ? { key: project.ecosystem, name: ecosystemName(project.ecosystem) }
          : null,
        description: project.description,
        icon: (app?.icon ?? icons[project.slug] ?? project.icon) || null,
        art: ART[project.slug] ?? null,
        pinned: PINNED.includes(project.slug),
        hasDocs: !project.readmeLanding && projectHasDocs(project.slug),
        repoUrl: project.isPrivate ? null : project.repoUrl,
        homepage: project.homepage,
        storeUrl: project.storeUrl ?? null,
        npm: facts
          ? {
              name: facts.name,
              install:
                facts.commands.length > 0
                  ? `npm install -g ${facts.name}`
                  : `npm install ${facts.name}`,
            }
          : null,
      }
    }),
  )

  const listed = getListedApps()
    .filter((app) => !projects.some((project) => project.slug === app.slug))
    .map((app): LauncherProject => ({
      slug: app.slug,
      name: app.name,
      type: typeFor(app.category),
      category: app.category,
      ecosystem: null,
      description: app.description,
      icon: app.icon ?? null,
      art: ART[app.slug] ?? null,
      pinned: false,
      hasDocs: false,
      repoUrl: null,
      homepage: app.homepage,
      storeUrl: null,
      npm: null,
      href: app.href,
    }))

  // The same cached fetches /projects makes for its release pills.
  const releases = (
    await Promise.all(
      projects
        .filter((project) => !project.isPrivate)
        .map(async (project): Promise<LauncherRelease | null> => {
          const release = await getRelease(project.slug)
          return release?.publishedAt
            ? {
                slug: project.slug,
                version: release.version,
                publishedAt: release.publishedAt,
              }
            : null
        }),
    )
  )
    .filter((release) => release !== null)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, RELEASES)

  return {
    releases,
    projects: [...launcherProjects, ...listed].sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) || a.name.localeCompare(b.name),
    ),
    posts: posts.map((post) => ({
      title: post.title,
      description: post.description,
      date: post.date,
      href: postPath(post),
      thumb: coverImages(post.cover)?.thumb ?? null,
      cover: coverImages(post.cover)?.hero ?? null,
      minutes: readingMinutes(post.body),
      tags: post.tags,
    })),
  }
}
