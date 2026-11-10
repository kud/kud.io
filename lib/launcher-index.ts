import { getProjects } from "@/lib/projects"
import { getIcons } from "@/lib/icons"
import { getApp, appDisplayName, isProduct } from "@/lib/app"
import { isAppCategory, typeFor } from "@/lib/categories"
import { getAllPosts, coverImages, postPath } from "@/lib/blog"
import { getPackageFacts } from "@/lib/package-facts"
import { projectHasDocs } from "@/lib/source"
import { PINNED } from "@/lib/pinned"
import { getListedApps } from "@/lib/listed-apps"

// Everything the command launcher matches on without a round trip: the
// projects exactly as /projects lists them, every post, and the few facts a
// project's actions need. Docs stay on /api/search, which already indexes them.
export type LauncherProject = {
  slug: string
  name: string
  type: string
  category: string
  description: string | null
  icon: string | null
  pinned: boolean
  hasDocs: boolean
  repoUrl: string | null
  homepage: string | null
  storeUrl: string | null
  npm: { name: string; install: string } | null
  // A live app with no public source (lib/listed-apps.ts): its card opens the
  // app itself, as on /projects, since there is no kud.io page behind it.
  href?: string
}

export type LauncherPost = {
  title: string
  description: string
  date: string
  href: string
  thumb: string | null
  tags: string[]
}

export type LauncherIndex = {
  projects: LauncherProject[]
  posts: LauncherPost[]
}

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
        description: project.description,
        icon: (app?.icon ?? icons[project.slug] ?? project.icon) || null,
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
      description: app.description,
      icon: app.icon ?? null,
      pinned: false,
      hasDocs: false,
      repoUrl: null,
      homepage: app.href,
      storeUrl: null,
      npm: null,
      href: app.href,
    }))

  return {
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
      tags: post.tags,
    })),
  }
}
