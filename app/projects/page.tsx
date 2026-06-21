import type { Metadata } from "next"
import { AvatarImage } from "@/components/avatar-image"
import { BackLink } from "@/components/back-link"
import { getProjects, type Project } from "@/lib/projects"
import { getIcons } from "@/lib/icons"
import { getApp, appDisplayName } from "@/lib/app"
import { isAppCategory } from "@/lib/categories"
import { Blueprint } from "@/components/blueprint"
import {
  GitHubIcon,
  LinkedInIcon,
  BlueskyIcon,
} from "@/components/social-icons"
import { ProjectList } from "@/components/project-list"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Projects — Erwann Mest",
  description:
    "Open-source command-line tools, MCP servers, and terminal design systems designed and maintained by Erwann Mest (kud).",
}

// Label and an orienting one-liner for each `kud-site-<key>` topic. Section
// order follows the declaration order below — to reorder or insert a group,
// just move or add it here; there's nothing to renumber. Membership is driven
// entirely by the repo topics on GitHub.
const CATEGORY_META: Record<string, { name: string; blurb: string }> = {
  app: {
    name: "Apps",
    blurb:
      "Web apps I design and ship end to end — open them straight from here, or read the story behind each one.",
  },
  desktop: {
    name: "Desktop Apps",
    blurb:
      "Native desktop remotes and tools — the same cores as the CLIs, wrapped in a clickable app, no terminal required.",
  },
  cli: {
    name: "CLIs & Tools",
    blurb:
      "Command-line tools I reach for daily, for files, git, cloud APIs, and the macOS desktop.",
  },
  mcp: {
    name: "MCP Servers",
    blurb:
      "Model Context Protocol servers that connect Claude and other AI assistants to the tools you already use.",
  },
  claude: {
    name: "Claude Code",
    blurb:
      "Companions for Claude Code: session managers, live dashboards, and curated plugin collections.",
  },
  lib: {
    name: "Libraries",
    blurb:
      "Reusable packages that other projects build on — protocol implementations, API clients, and framework-agnostic cores, published to npm.",
  },
  ui: {
    name: "UI & Design Systems",
    blurb:
      "Design systems and component libraries for building polished, consistent terminal interfaces.",
  },
  vscode: {
    name: "VS Code Extensions",
    blurb:
      "Extensions that bring code review and AI workflows directly into VS Code.",
  },
  theme: {
    name: "VS Code Themes",
    blurb: "Colour schemes for VS Code, tuned for long sessions in the dark.",
  },
  raycast: {
    name: "Raycast Extensions",
    blurb:
      "Extensions for Raycast that bring file sharing, domains, fonts, and more into the launcher — published to the Raycast Store.",
  },
  other: {
    name: "Lists & Resources",
    blurb:
      "Curated lists and references for people who love a beautiful terminal.",
  },
}

// Section order is simply the declaration order above; unknown keys sort last.
const CATEGORY_ORDER = Object.keys(CATEGORY_META)
const orderOf = (key: string) => {
  const index = CATEGORY_ORDER.indexOf(key)
  return index === -1 ? CATEGORY_ORDER.length : index
}

const labelFor = (key: string) =>
  CATEGORY_META[key]?.name ?? key.charAt(0).toUpperCase() + key.slice(1)

const groupByCategory = (projects: Project[]) => {
  const keys = [...new Set(projects.map((project) => project.category))]
  return keys
    .map((key) => ({
      key,
      name: labelFor(key),
      blurb: CATEGORY_META[key]?.blurb ?? null,
      items: projects.filter((project) => project.category === key),
    }))
    .sort((a, b) => orderOf(a.key) - orderOf(b.key))
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
        <ProjectList groups={groups} />
      )}
    </main>
  )
}

export default ProjectsIndex
