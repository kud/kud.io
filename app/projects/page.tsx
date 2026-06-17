import type { Metadata } from "next"
import Link from "next/link"
import { getProjects, type Project } from "@/lib/projects"
import { ParallaxOrbs } from "@/components/parallax-orbs"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Projects — Erwann Mest",
  description:
    "Open-source command-line tools, MCP servers, and terminal design systems designed and maintained by Erwann Mest (kud).",
}

type Category = {
  name: string
  key: string
  match: (project: Project) => boolean
}

// Match order (catch-all last); display order is controlled separately.
const CATEGORIES: Category[] = [
  { name: "MCP Servers", key: "mcp", match: (p) => p.slug.startsWith("mcp-") },
  {
    name: "Claude Code",
    key: "claude",
    match: (p) => p.slug.startsWith("claude-"),
  },
  {
    name: "UI & Design Systems",
    key: "ui",
    match: (p) => p.slug === "shui" || p.slug === "ink-ui",
  },
  {
    name: "VS Code",
    key: "vscode",
    match: (p) => p.slug.includes("vscode"),
  },
  {
    name: "Lists & Resources",
    key: "other",
    match: (p) =>
      p.slug === "awesome-terminal-aesthetics" || p.slug === "githuman",
  },
  { name: "CLIs & Tools", key: "cli", match: () => true },
]

const DISPLAY_ORDER = ["cli", "mcp", "claude", "ui", "vscode", "other"]

const groupByCategory = (projects: Project[]) => {
  const used = new Set<string>()
  return CATEGORIES.map((category) => {
    const items = projects.filter(
      (project) => !used.has(project.slug) && category.match(project),
    )
    items.forEach((project) => used.add(project.slug))
    return { ...category, items }
  })
    .filter((category) => category.items.length > 0)
    .sort((a, b) => DISPLAY_ORDER.indexOf(a.key) - DISPLAY_ORDER.indexOf(b.key))
}

const AVATAR =
  "https://www.gravatar.com/avatar/e6eaeaa6da69e804c27c2d4cd55107e0?s=512"

const ProjectsIndex = async () => {
  const projects = await getProjects()
  const groups = groupByCategory(projects)

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <ParallaxOrbs />
        <div className={styles.heroInner}>
          <Link href="/" className={styles.back}>
            ← kud.io
          </Link>
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
              GitHub
            </a>
            <span className={styles.sep}>·</span>
            <a href="http://linkedin.kud.io/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <span className={styles.sep}>·</span>
            <a href="https://bsky.kud.io" target="_blank" rel="noreferrer">
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
        groups.map((group) => (
          <section
            key={group.key}
            className={styles.section}
            data-cat={group.key}
          >
            <h2 className={styles.sectionTitle}>
              <span className={styles.dot} />
              {group.name}
              <span className={styles.count2}>{group.items.length}</span>
            </h2>
            <ul className={styles.grid}>
              {group.items.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className={styles.card}
                  >
                    <h3 className={styles.cardTitle}>{project.name}</h3>
                    {project.description ? (
                      <p className={styles.cardDesc}>{project.description}</p>
                    ) : null}
                    <div className={styles.meta}>
                      {project.language ? (
                        <span className={styles.lang}>{project.language}</span>
                      ) : null}
                      {project.stars > 0 ? (
                        <span className={styles.stars}>★ {project.stars}</span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  )
}

export default ProjectsIndex
