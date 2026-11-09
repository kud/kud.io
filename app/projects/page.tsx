import type { Metadata } from "next"
import { AvatarImage } from "@/components/avatar-image"
import { BackLink } from "@/components/back-link"
import { ThemePicker } from "@/components/theme-picker"
import { ThemeScopeScript } from "@/components/scoped-theme"
import { getProjects } from "@/lib/projects"
import { getEcosystems } from "@/lib/ecosystems"
import { getIcons } from "@/lib/icons"
import { getApp, appDisplayName, isProduct } from "@/lib/app"
import { isAppCategory, groupByCategory } from "@/lib/categories"
import { Blueprint } from "@/components/blueprint"
import {
  GitHubIcon,
  LinkedInIcon,
  BlueskyIcon,
} from "@/components/social-icons"
import {
  ProjectList,
  type ReleaseTreatment,
  type ReleaseSummary,
} from "@/components/project-list"
import { getRelease, releaseAge } from "@/lib/release"
import { Contributions } from "@/components/contributions"
import { ProjectsTop, type TopLayout } from "@/components/projects-top"
import { PINNED, RECENT_COUNT } from "@/lib/pinned"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Projects — Erwann Mest",
  description:
    "Everything Erwann Mest (kud) has built: how the beansontoast apps are made, and the open-source CLIs, MCP servers, libraries and extensions he maintains.",
}

// Release dates age by the hour, so rebuild hourly.
export const revalidate = 3600

// PROTOTYPE: `?v=1..4` previews the release treatments side by side. Reading
// searchParams makes the page dynamic, so every request fetches all ~95
// releases. Remove the switch once a treatment is picked; the page then
// renders statically and revalidates hourly.
const TREATMENTS: ReleaseTreatment[] = [1, 2, 3, 4]
const DEFAULT_TREATMENT: ReleaseTreatment = 2

// PROTOTYPE: `?t=1..3` previews the layouts for the top of the page, pinned
// then recently released (components/projects-top.tsx).
const LAYOUTS: TopLayout[] = [1, 2, 3]
const DEFAULT_LAYOUT: TopLayout = 2

const AVATAR =
  "https://www.gravatar.com/avatar/e6eaeaa6da69e804c27c2d4cd55107e0?s=512"

const ProjectsIndex = async ({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; t?: string }>
}) => {
  const { v, t } = await searchParams
  const treatment = TREATMENTS.find((n) => String(n) === v) ?? DEFAULT_TREATMENT
  const layout = LAYOUTS.find((n) => String(n) === t) ?? DEFAULT_LAYOUT
  const [projects, icons] = await Promise.all([getProjects(), getIcons()])
  // Fetched here, never in the client list: one map of slug to release, with
  // freshness decided on the server so the client never disagrees with it.
  const releases: Record<string, ReleaseSummary> = Object.fromEntries(
    (
      await Promise.all(
        projects.map(async (project) => {
          const release = await getRelease(project.slug)
          if (!release) return null
          const age = releaseAge(release.publishedAt)
          return [
            project.slug,
            {
              version: release.version,
              publishedAt: release.publishedAt,
              fresh: age?.fresh ?? false,
              age: age?.label ?? null,
            },
          ] as const
        }),
      )
    ).filter((entry) => entry !== null),
  )
  // Apps overlay a curated icon + accent from app.json (their PWA icons live
  // outside the sync detector's reach); every other project keeps the synced icon.
  const withIcons = projects.map((project) => {
    if (isAppCategory(project.category)) {
      const app = getApp(project.slug)
      // A beansontoast product moves into its own section, whose tiles open
      // its engineering record on kud.io rather than the app itself.
      const product = isProduct(app)
      return {
        ...project,
        category: product ? "product" : project.category,
        description: (product ? app.summary : null) ?? project.description,
        name: appDisplayName(project.slug, app),
        icon: app.icon ?? icons[project.slug] ?? null,
        accent: app.accent ?? null,
      }
    }
    return { ...project, icon: icons[project.slug] ?? project.icon ?? null }
  })
  const groups = groupByCategory(withIcons)
  // Ecosystems are an orthogonal facet: families spanning several categories
  // (qobuz lib + CLI + MCP). Derived from the same projects, surfaced as tiles
  // that filter the grid rather than as their own section.
  const ecosystems = getEcosystems(withIcons, icons)
  // Pins first, in their own order. "Recently released" is the latest
  // release date, never the last push: pushes include dependency bumps and
  // fleet-wide sweeps, so most repos would read as fresh on any given day. A
  // pinned project is not repeated in the recent list.
  const pinned = PINNED.map((slug) =>
    withIcons.find((p) => p.slug === slug),
  ).filter((p) => p !== undefined)
  const recent = withIcons
    .filter((p) => !PINNED.includes(p.slug))
    .flatMap((p) => {
      const release = releases[p.slug]
      return release?.publishedAt
        ? [{ ...p, release: { ...release, publishedAt: release.publishedAt } }]
        : []
    })
    .sort((a, b) => b.release.publishedAt.localeCompare(a.release.publishedAt))
    .slice(0, RECENT_COUNT)

  return (
    <main
      className={styles.page}
      data-ground="dusk"
      data-theme="system"
      data-theme-scope
      suppressHydrationWarning
    >
      <ThemeScopeScript />
      <ThemePicker className="dusk-picker-top" />
      <header className={styles.hero}>
        <Blueprint className={styles.blueprint} />
        <BackLink href="/" className={styles.back}>
          ← kud.io
        </BackLink>
        <div className={styles.heroInner}>
          <AvatarImage
            src={AVATAR}
            alt="Erwann Mest"
            width={148}
            height={148}
            className={styles.avatar}
          />
          <h1 className={styles.title}>
            Projects <span className={styles.titleBy}>by kud</span>
          </h1>
          <p className={styles.intro}>
            Everything I&apos;ve built, in two kinds. <strong>Products</strong>{" "}
            are apps for everyone, published under{" "}
            <a href="https://beansontoast.app/">beansontoast</a>: you use them
            there, and here is how each one is made. <strong>Tools</strong> are
            for people who make software: command-line apps, MCP servers,
            libraries and extensions, all open source, with their documentation
            on this site.
          </p>
          <div className={styles.social}>
            <a href="https://github.kud.io/" target="_blank" rel="noreferrer">
              <GitHubIcon />
              GitHub
            </a>
            <span className={styles.sep}>·</span>
            <a href="https://linkedin.kud.io/" target="_blank" rel="noreferrer">
              <LinkedInIcon />
              LinkedIn
            </a>
            <span className={styles.sep}>·</span>
            <a href="https://bsky.kud.io" target="_blank" rel="noreferrer">
              <BlueskyIcon />
              Bluesky
            </a>
          </div>
          {projects.length > 0 ? (
            <p className={styles.count}>
              {projects.length} projects · always shipping
            </p>
          ) : null}
        </div>
      </header>

      <ProjectsTop layout={layout} pinned={pinned} recent={recent} />

      {groups.length === 0 ? (
        <p className={styles.empty}>
          No projects tagged <code>kud-site</code> yet.
        </p>
      ) : (
        <ProjectList
          groups={groups}
          ecosystems={ecosystems}
          releases={releases}
          treatment={treatment}
        >
          <Contributions />
        </ProjectList>
      )}
    </main>
  )
}

export default ProjectsIndex
