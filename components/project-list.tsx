"use client"

import { useMemo, useState, type ReactNode } from "react"
import { MorphLink } from "@/components/morph-link"
import {
  actionFor,
  buildShelves,
  selectApps,
  selectFeatured,
  type StoreProject,
} from "@/lib/store"
import styles from "./project-list.module.css"

const formatCount = (value: number): string =>
  value >= 10000 ? `${Math.round(value / 1000)}k` : value.toLocaleString("en-GB")

const matches = (project: StoreProject, needle: string): boolean =>
  !needle ||
  `${project.name} ${project.description ?? ""} ${project.tagline ?? ""}`
    .toLowerCase()
    .includes(needle)

const ProjectIcon = ({
  project,
  size,
}: {
  project: StoreProject
  size: "large" | "medium" | "small"
}) => {
  const className =
    size === "large"
      ? styles.launcherIcon
      : size === "medium"
        ? styles.featuredIcon
        : styles.rowIcon
  if (!project.icon)
    return (
      <span className={`${className} ${styles.monogram}`} aria-hidden>
        {project.name.charAt(0).toUpperCase()}
      </span>
    )
  const glyph = !project.icon.endsWith(".svg")
  return (
    <span className={className} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.icon}
        alt=""
        loading="lazy"
        data-bleed={glyph ? undefined : "false"}
      />
    </span>
  )
}

const ActionPill = ({
  project,
  ghost,
}: {
  project: StoreProject
  ghost?: boolean
}) => {
  const action = actionFor(project)
  if (!action) return null
  const className = `${styles.pill}${ghost ? ` ${styles.pillGhost}` : ""}`
  const label = `${action.label}: ${project.name}`
  return action.external ? (
    <a
      href={action.href}
      target="_blank"
      rel="noreferrer"
      className={className}
      aria-label={label}
    >
      {action.label}
    </a>
  ) : (
    <MorphLink href={action.href} className={className} aria-label={label}>
      {action.label}
    </MorphLink>
  )
}

export const ProjectList = ({
  projects,
  children,
}: {
  projects: StoreProject[]
  // Footer content (the Contributions graph) rendered on the server and hidden
  // once the store is narrowed to a search subset.
  children?: ReactNode
}) => {
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const needle = query.trim().toLowerCase()

  const featured = useMemo(() => selectFeatured(projects), [projects])
  const apps = useMemo(() => selectApps(projects), [projects])
  const searching = needle.length > 0

  const shelves = useMemo(() => {
    const all = buildShelves(projects)
    if (!searching) return all
    return all
      .map((shelf) => ({
        ...shelf,
        items: shelf.items.filter((project) => matches(project, needle)),
      }))
      .filter((shelf) => shelf.items.length > 0)
  }, [projects, searching, needle])

  const matchingApps = searching
    ? apps.filter((project) => matches(project, needle))
    : []
  const matchCount =
    matchingApps.length +
    shelves.reduce((total, shelf) => total + shelf.items.length, 0)

  const toggleShelf = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const [lead, ...side] = searching ? [] : featured

  return (
    <div className={styles.store}>
      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.search}
          placeholder={`Search ${projects.length} projects…`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search projects"
        />
      </div>

      {searching ? (
        <p className={styles.resultCount} role="status">
          {matchCount === 0
            ? `No projects match “${query.trim()}”.`
            : `${matchCount} match${matchCount === 1 ? "" : "es"} for “${query.trim()}”.`}
          {matchCount === 0 ? (
            <button
              type="button"
              className={styles.clear}
              onClick={() => setQuery("")}
            >
              Clear search
            </button>
          ) : null}
        </p>
      ) : null}

      {!searching && lead ? (
        <section className={styles.featured} aria-label="Featured">
          <article className={styles.featuredLead}>
            <MorphLink
              href={`/projects/${lead.slug}`}
              className={styles.shotLink}
              aria-label={`${lead.name}: read more`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.shot}
                src={lead.screenshots[0]}
                alt={`Screenshot of ${lead.name}`}
                loading="eager"
              />
            </MorphLink>
            <div className={styles.featuredBody}>
              <ProjectIcon project={lead} size="medium" />
              <div className={styles.featuredText}>
                <p className={styles.eyebrow}>Featured</p>
                <MorphLink
                  href={`/projects/${lead.slug}`}
                  className={styles.featuredName}
                >
                  {lead.name}
                </MorphLink>
                {lead.tagline ?? lead.description ? (
                  <p className={styles.featuredTag}>
                    {lead.tagline ?? lead.description}
                  </p>
                ) : null}
              </div>
              <ActionPill project={lead} />
            </div>
          </article>
          {side.slice(0, 2).map((project) => (
            <article key={project.slug} className={styles.featuredSide}>
              <MorphLink
                href={`/projects/${project.slug}`}
                className={styles.shotLink}
                aria-label={`${project.name}: read more`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.shot}
                  src={project.screenshots[0]}
                  alt={`Screenshot of ${project.name}`}
                  loading="lazy"
                />
              </MorphLink>
              <div className={styles.featuredBody}>
                <ProjectIcon project={project} size="small" />
                <div className={styles.featuredText}>
                  <MorphLink
                    href={`/projects/${project.slug}`}
                    className={styles.featuredNameSmall}
                  >
                    {project.name}
                  </MorphLink>
                  <p className={styles.platformNote}>Web app</p>
                </div>
                <ActionPill project={project} ghost />
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!searching && apps.length > 0 ? (
        <section aria-labelledby="store-apps">
          <div className={styles.shelfHead}>
            <h2 id="store-apps" className={styles.shelfTitle}>
              Apps
            </h2>
          </div>
          <p className={styles.shelfBlurb}>
            Open them straight from here — nothing to install.
          </p>
          <ul className={styles.launchers}>
            {apps.map((project) => (
              <li key={project.slug} className={styles.launcher}>
                <MorphLink
                  href={`/projects/${project.slug}`}
                  className={styles.launcherLink}
                >
                  <ProjectIcon project={project} size="large" />
                  <span className={styles.launcherName}>{project.name}</span>
                </MorphLink>
                <ActionPill project={project} ghost />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {searching && matchingApps.length > 0 ? (
        <section aria-labelledby="store-search-apps">
          <div className={styles.shelfHead}>
            <h2 id="store-search-apps" className={styles.shelfTitle}>
              Apps
            </h2>
          </div>
          <div className={styles.shelf}>
            <div className={styles.column}>
              {matchingApps.map((project) => (
                <ShelfRow key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {shelves.map((shelf) => {
        const open = searching || expanded.has(shelf.key)
        const shown = open ? shelf.items : shelf.items.slice(0, shelf.cap)
        const columns: StoreProject[][] = []
        for (let i = 0; i < shown.length; i += 2)
          columns.push(shown.slice(i, i + 2))
        return (
          <section key={shelf.key} aria-labelledby={`store-${shelf.key}`}>
            <div className={styles.shelfHead}>
              <h2 id={`store-${shelf.key}`} className={styles.shelfTitle}>
                {shelf.title}
              </h2>
              {!searching && shelf.items.length > shelf.cap ? (
                <button
                  type="button"
                  className={styles.seeAll}
                  onClick={() => toggleShelf(shelf.key)}
                  aria-expanded={open}
                >
                  {open ? "Show less ↑" : `See all ${shelf.items.length} →`}
                </button>
              ) : null}
            </div>
            {shelf.blurb ? (
              <p className={styles.shelfBlurb}>{shelf.blurb}</p>
            ) : null}
            <div className={styles.shelf}>
              {columns.map((column, index) => (
                <div key={index} className={styles.column}>
                  {column.map((project) => (
                    <ShelfRow
                      key={project.slug}
                      project={project}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {searching ? null : children}
    </div>
  )
}

const ShelfRow = ({ project }: { project: StoreProject }) => (
  <article className={styles.row} aria-label={project.name}>
    <ProjectIcon project={project} size="small" />
    <div className={styles.rowMain}>
      <MorphLink
        href={`/projects/${project.slug}`}
        className={styles.rowName}
      >
        {project.name}
      </MorphLink>
      {project.description ? (
        <p className={styles.rowDesc}>{project.description}</p>
      ) : null}
      <p className={styles.rowMeta}>
        <PlatformLabel project={project} />
        {project.downloads ? (
          <span className={styles.fact}>
            {formatCount(project.downloads)} installs
          </span>
        ) : null}
        {project.users ? (
          <span className={styles.fact}>
            {formatCount(project.users)} user{project.users === 1 ? "" : "s"}
          </span>
        ) : null}
      </p>
    </div>
    <ActionPill project={project} ghost />
  </article>
)

const PLATFORM_LABELS: Record<string, string> = {
  app: "Web",
  desktop: "Desktop",
  webext: "Firefox",
  raycast: "Raycast",
  cli: "CLI",
  mcp: "MCP",
  claude: "Claude Code",
  lib: "npm",
  ui: "npm",
  vscode: "VS Code",
  theme: "VS Code",
  other: "List",
}

const PlatformLabel = ({ project }: { project: StoreProject }) => (
  <span className={styles.platform}>
    {PLATFORM_LABELS[project.category] ?? project.category}
  </span>
)
