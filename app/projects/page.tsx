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

// Display names + order for each `kud-site-<key>` topic. Membership is driven
// entirely by the repo topics on GitHub — this map only labels and orders them.
const CATEGORY_META: Record<string, { name: string; order: number }> = {
  cli: { name: "CLIs & Tools", order: 0 },
  mcp: { name: "MCP Servers", order: 1 },
  claude: { name: "Claude Code", order: 2 },
  ui: { name: "UI & Design Systems", order: 3 },
  vscode: { name: "VS Code", order: 4 },
  other: { name: "Lists & Resources", order: 5 },
}

const labelFor = (key: string) =>
  CATEGORY_META[key]?.name ?? key.charAt(0).toUpperCase() + key.slice(1)

const groupByCategory = (projects: Project[]) => {
  const keys = [...new Set(projects.map((project) => project.category))]
  return keys
    .map((key) => ({
      key,
      name: labelFor(key),
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
