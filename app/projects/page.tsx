import type { Metadata } from "next"
import { BackLink } from "@/components/back-link"
import { getProjects } from "@/lib/projects"
import { getIcons } from "@/lib/icons"
import { getApp, appDisplayName } from "@/lib/app"
import { projectHasDocs } from "@/lib/source"
import { isAppCategory } from "@/lib/categories"
import { Blueprint } from "@/components/blueprint"
import { ProjectList } from "@/components/project-list"
import { Contributions } from "@/components/contributions"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Projects — Erwann Mest",
  description:
    "Open-source apps, extensions, command-line tools and MCP servers designed and maintained by Erwann Mest (kud).",
}

const ProjectsIndex = async () => {
  const [projects, icons] = await Promise.all([getProjects(), getIcons()])
  // Apps overlay curated metadata from app.json (tagline, launch URL,
  // screenshots, icon, accent — their PWA icons live outside the sync
  // detector's reach); every other project keeps the synced data, plus a docs
  // flag so the store can point its action pill at the install guide.
  const storeProjects = projects.map((project) => {
    if (isAppCategory(project.category)) {
      const app = getApp(project.slug)
      return {
        ...project,
        name: appDisplayName(project.slug, app),
        icon: app.icon ?? icons[project.slug] ?? null,
        accent: app.accent ?? null,
        tagline: app.tagline,
        launchUrl: app.launchUrl ?? project.homepage,
        screenshots: app.screenshots,
        docs: false,
      }
    }
    return {
      ...project,
      icon: icons[project.slug] ?? project.icon ?? null,
      tagline: null,
      launchUrl: null,
      screenshots: [],
      docs: projectHasDocs(project.slug),
    }
  })

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <Blueprint className={styles.blueprint} />
        <BackLink href="/" className={styles.back}>
          ← kud.io
        </BackLink>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>
            Projects <span className={styles.titleBy}>by kud</span>
          </h1>
          <p className={styles.intro}>
            Everything I design and build: open the apps, add the extensions,
            install the tools.
          </p>
        </div>
      </header>

      {storeProjects.length === 0 ? (
        <p className={styles.empty}>
          No projects tagged <code>kud-site</code> yet.
        </p>
      ) : (
        <ProjectList projects={storeProjects}>
          <Contributions />
        </ProjectList>
      )}
    </main>
  )
}

export default ProjectsIndex
