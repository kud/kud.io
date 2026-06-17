import type { Metadata } from "next"
import Link from "next/link"
import { getProjects, type Project } from "@/lib/projects"
import { getIcons } from "@/lib/icons"
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

// Label, ordering, and an orienting one-liner for each `kud-site-<key>` topic.
// Membership is driven entirely by the repo topics on GitHub — this map only
// labels, orders, and describes the groups.
const CATEGORY_META: Record<
  string,
  { name: string; order: number; blurb: string }
> = {
  cli: {
    name: "CLIs & Tools",
    order: 0,
    blurb:
      "Command-line tools I reach for daily — for files, git, cloud APIs, and the macOS desktop.",
  },
  mcp: {
    name: "MCP Servers",
    order: 1,
    blurb:
      "Model Context Protocol servers that connect Claude and other AI assistants to the tools you already use.",
  },
  claude: {
    name: "Claude Code",
    order: 2,
    blurb:
      "Companions for Claude Code — session managers, live dashboards, and curated plugin collections.",
  },
  ui: {
    name: "UI & Design Systems",
    order: 3,
    blurb:
      "Design systems and component libraries for building polished, consistent terminal interfaces.",
  },
  vscode: {
    name: "VS Code Extensions",
    order: 4,
    blurb:
      "Extensions that bring code review and AI workflows directly into VS Code.",
  },
  theme: {
    name: "VS Code Themes",
    order: 5,
    blurb: "Colour schemes for VS Code, tuned for long sessions in the dark.",
  },
  other: {
    name: "Lists & Resources",
    order: 6,
    blurb:
      "Curated lists and references for people who love a beautiful terminal.",
  },
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
    .sort(
      (a, b) =>
        (CATEGORY_META[a.key]?.order ?? 99) -
        (CATEGORY_META[b.key]?.order ?? 99),
    )
}

const AVATAR =
  "https://www.gravatar.com/avatar/e6eaeaa6da69e804c27c2d4cd55107e0?s=512"

const ProjectsIndex = async () => {
  const [projects, icons] = await Promise.all([getProjects(), getIcons()])
  const withIcons = projects.map((project) => ({
    ...project,
    icon: icons[project.slug] ?? null,
  }))
  const groups = groupByCategory(withIcons)

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <Blueprint className={styles.blueprint} />
        <Link href="/" className={styles.back}>
          ← kud.io
        </Link>
        <div className={styles.heroInner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AVATAR}
            alt="Erwann Mest"
            width={148}
            height={148}
            className={styles.avatar}
          />
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.intro}>
            Open-source tools I design and maintain — command-line apps, MCP
            servers, and terminal design systems. I&apos;m{" "}
            <strong>Erwann Mest</strong> (kud), a Lead Engineer in London who
            cares about developer experience and the craft of polished tools.
          </p>
          <div className={styles.social}>
            <a href="http://github.kud.io/" target="_blank" rel="noreferrer">
              <GitHubIcon />
              GitHub
            </a>
            <span className={styles.sep}>·</span>
            <a href="http://linkedin.kud.io/" target="_blank" rel="noreferrer">
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
