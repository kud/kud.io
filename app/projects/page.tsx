import type { Metadata } from "next"
import { AvatarImage } from "@/components/avatar-image"
import { BackLink } from "@/components/back-link"
import { getProjects } from "@/lib/projects"
import { getEcosystems } from "@/lib/ecosystems"
import { getIcons } from "@/lib/icons"
import { getApp, appDisplayName } from "@/lib/app"
import { isAppCategory, groupByCategory } from "@/lib/categories"
import { Blueprint } from "@/components/blueprint"
import {
  GitHubIcon,
  LinkedInIcon,
  BlueskyIcon,
} from "@/components/social-icons"
import { ProjectList } from "@/components/project-list"
import { Contributions } from "@/components/contributions"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Projects — Erwann Mest",
  description:
    "Open-source command-line tools, MCP servers, and terminal design systems designed and maintained by Erwann Mest (kud).",
}

const AVATAR =
  "https://www.gravatar.com/avatar/e6eaeaa6da69e804c27c2d4cd55107e0?s=512"

const ProjectsIndex = async () => {
  const [projects, icons] = await Promise.all([getProjects(), getIcons()])
  // Apps overlay a curated icon + accent from app.json (their PWA icons live
  // outside the sync detector's reach); every other project keeps the synced icon.
  const withIcons = projects.map((project) => {
    if (isAppCategory(project.category)) {
      const app = getApp(project.slug)
      return {
        ...project,
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

  return (
    <main className={styles.page}>
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
            Open-source tools I design and build: command-line apps, MCP
            servers, and terminal design systems. Each one is shaped by the same
            care: <strong>developer experience</strong> first, a real passion
            for polish, and neat, considered interfaces, down to the last
            detail.
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
              {projects.length} open-source projects · always shipping
            </p>
          ) : null}
        </div>
      </header>

      {groups.length === 0 ? (
        <p className={styles.empty}>
          No projects tagged <code>kud-site</code> yet.
        </p>
      ) : (
        <ProjectList groups={groups} ecosystems={ecosystems}>
          <Contributions />
        </ProjectList>
      )}
    </main>
  )
}

export default ProjectsIndex
