"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { MorphLink } from "@/components/morph-link"
import type { Project } from "@/lib/projects"
import type { Ecosystem } from "@/lib/ecosystems"
import { isAppCategory } from "@/lib/categories"
import styles from "./project-list.module.css"

type Group = {
  key: string
  name: string
  blurb: string | null
  items: Project[]
}

type SortKey = "updated" | "stars" | "name"

const SORTS: Record<
  SortKey,
  { label: string; fn: (a: Project, b: Project) => number }
> = {
  updated: {
    label: "Recently updated",
    fn: (a, b) => b.pushedAt.localeCompare(a.pushedAt),
  },
  stars: {
    label: "Most stars",
    fn: (a, b) => b.stars - a.stars || a.slug.localeCompare(b.slug),
  },
  name: {
    label: "Name (A–Z)",
    fn: (a, b) => a.slug.localeCompare(b.slug),
  },
}

type Option = { value: string | null; label: string }

// A self-contained select dropdown (used for both Type and Sort).
const Dropdown = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | null
  options: Option[]
  onChange: (value: string | null) => void
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const current = options.find((option) => option.value === value) ?? options[0]

  return (
    <div className={styles.sortGroup}>
      <span className={styles.filterLabel}>{label}</span>
      <div className={styles.dropdown} ref={ref}>
        <button
          type="button"
          className={styles.trigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((state) => !state)}
        >
          {current.label}
          <span className={styles.chevron} aria-hidden />
        </button>
        {open ? (
          <ul className={styles.menu} role="listbox">
            {options.map((option) => (
              <li key={option.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  data-active={option.value === value}
                  className={styles.option}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <span className={styles.check} aria-hidden>
                    {option.value === value ? "✓" : ""}
                  </span>
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

export const ProjectList = ({
  groups,
  ecosystems,
  children,
}: {
  groups: Group[]
  ecosystems: Ecosystem[]
  // Footer content (the Contributions graph) rendered on the server and hidden
  // once the grid is narrowed to a filtered subset.
  children?: ReactNode
}) => {
  const [sort, setSort] = useState<SortKey>("updated")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [lang, setLang] = useState<string | null>(null)
  const [activeTags, setActiveTags] = useState<string[]>([])
  // Ecosystem is single-select (unlike tags): you're looking at one family at a
  // time. Clicking the active tile again clears it.
  const [activeEcosystem, setActiveEcosystem] = useState<string | null>(null)
  const compare = SORTS[sort].fn

  const toggleTag = (tag: string) =>
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    )

  // Languages ordered by how many projects use them, so the common ones lead.
  const languages = useMemo(() => {
    const counts = new Map<string, number>()
    for (const group of groups)
      for (const project of group.items)
        if (project.language)
          counts.set(project.language, (counts.get(project.language) ?? 0) + 1)
    return [...counts.keys()].sort(
      (a, b) =>
        (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b),
    )
  }, [groups])

  // Content tags (kud-site-tag-*), ordered by frequency.
  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const group of groups)
      for (const project of group.items)
        for (const tag of project.tags)
          counts.set(tag, (counts.get(tag) ?? 0) + 1)
    return [...counts.keys()].sort(
      (a, b) =>
        (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b),
    )
  }, [groups])

  const needle = query.trim().toLowerCase()
  const matches = (project: Project) =>
    (!lang || project.language === lang) &&
    (!activeEcosystem || project.ecosystem === activeEcosystem) &&
    (activeTags.length === 0 ||
      project.tags.some((tag) => activeTags.includes(tag))) &&
    (!needle ||
      `${project.name} ${project.description ?? ""}`
        .toLowerCase()
        .includes(needle))

  const visibleGroups = groups
    .filter((group) => !category || group.key === category)
    .map((group) => ({
      ...group,
      items: [...group.items].filter(matches).sort(compare),
    }))
    .filter((group) => group.items.length > 0)

  const categoryOptions: Option[] = [
    { value: null, label: "All types" },
    ...groups.map((group) => ({ value: group.key, label: group.name })),
  ]
  const sortOptions: Option[] = (Object.keys(SORTS) as SortKey[]).map(
    (key) => ({
      value: key,
      label: SORTS[key].label,
    }),
  )

  const isFiltered = Boolean(
    needle || category || lang || activeTags.length > 0 || activeEcosystem,
  )

  return (
    <>
      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.search}
          placeholder="Search projects…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search projects"
        />
        <Dropdown
          label="Type"
          value={category}
          options={categoryOptions}
          onChange={setCategory}
        />
        <Dropdown
          label="Sort"
          value={sort}
          options={sortOptions}
          onChange={(value) => setSort((value ?? "updated") as SortKey)}
        />
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Languages</span>
          <div className={styles.chips}>
            <button
              type="button"
              className={styles.chip}
              data-active={lang === null}
              onClick={() => setLang(null)}
            >
              All
            </button>
            {languages.map((language) => (
              <button
                key={language}
                type="button"
                className={styles.chip}
                data-active={lang === language}
                onClick={() => setLang(lang === language ? null : language)}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        {tags.length > 0 ? (
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Tags</span>
            <div className={styles.chips}>
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={styles.tagChip}
                  data-active={activeTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </button>
              ))}
              {activeTags.length > 0 ? (
                <button
                  type="button"
                  className={styles.tagClear}
                  onClick={() => setActiveTags([])}
                >
                  clear
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {ecosystems.length > 0 ? (
        <section className={styles.ecoSection}>
          <div className={styles.ecoHead}>
            <h2 className={styles.ecoTitle}>Ecosystems</h2>
            <p className={styles.ecoBlurb}>
              Some tools aren&apos;t a single app but a whole ecosystem —
              several surfaces over one shared core, so you reach the same thing
              from wherever you are. Pick one to see it across the grid.
            </p>
          </div>
          <div className={styles.ecoGrid}>
            {ecosystems.map((eco) => (
              <button
                key={eco.key}
                type="button"
                className={styles.ecoTile}
                data-active={activeEcosystem === eco.key}
                aria-pressed={activeEcosystem === eco.key}
                onClick={() =>
                  setActiveEcosystem((current) =>
                    current === eco.key ? null : eco.key,
                  )
                }
              >
                <span className={styles.ecoIconWrap}>
                  {eco.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.ecoIcon}
                      src={eco.icon}
                      alt=""
                      loading="lazy"
                      data-bleed={Boolean(
                        eco.icon && !eco.icon.endsWith(".svg"),
                      )}
                    />
                  ) : (
                    <span className={styles.ecoMonogram} aria-hidden>
                      {eco.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className={styles.ecoName}>{eco.name}</span>
                <span className={styles.ecoCount}>
                  {eco.count} surface{eco.count === 1 ? "" : "s"}
                </span>
              </button>
            ))}
          </div>
          {activeEcosystem ? (
            <button
              type="button"
              className={styles.ecoClear}
              onClick={() => setActiveEcosystem(null)}
            >
              Showing{" "}
              <strong>
                {ecosystems.find((eco) => eco.key === activeEcosystem)?.name}
              </strong>{" "}
              only — show everything ✕
            </button>
          ) : null}
        </section>
      ) : null}

      {visibleGroups.length === 0 ? (
        <p className={styles.noResults}>
          No projects match “{query.trim()}”{lang ? ` in ${lang}` : ""}.
        </p>
      ) : (
        visibleGroups.map((group) => (
          <section
            key={group.key}
            id={
              group.key === "app"
                ? "apps"
                : group.key === "desktop"
                  ? "desktop"
                  : undefined
            }
            className={styles.section}
            data-cat={group.key}
          >
            <h2 className={styles.sectionTitle}>
              <span className={styles.dot} />
              {group.name}
              <span className={styles.count}>{group.items.length}</span>
            </h2>
            {group.blurb ? <p className={styles.blurb}>{group.blurb}</p> : null}
            {isAppCategory(group.key) ? (
              <div className={styles.appGrid}>
                {group.items.map((project) => (
                  <MorphLink
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    className={styles.appTile}
                    style={
                      project.accent
                        ? ({ "--app-accent": project.accent } as CSSProperties)
                        : undefined
                    }
                  >
                    <span
                      className={styles.appIconWrap}
                      style={{
                        viewTransitionName: `app-icon-${project.slug}`,
                      }}
                    >
                      {project.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className={styles.appIconImg}
                          src={project.icon}
                          alt=""
                          loading="lazy"
                          data-bleed={Boolean(
                            project.icon && !project.icon.endsWith(".svg"),
                          )}
                        />
                      ) : (
                        <span className={styles.appMonogram} aria-hidden>
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className={styles.appName}>{project.name}</span>
                  </MorphLink>
                ))}
              </div>
            ) : (
              <div className={styles.list}>
                {group.items.map((project) => (
                  <MorphLink
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    className={styles.row}
                  >
                    {project.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className={styles.icon}
                        src={project.icon}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <span className={styles.monogram} aria-hidden>
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className={styles.rowBody}>
                      <span className={styles.rowHead}>
                        <span
                          className={styles.rowName}
                          style={{
                            viewTransitionName: `project-${project.slug}`,
                          }}
                        >
                          {project.name}
                        </span>
                        <span className={styles.rowMeta}>
                          {project.stars > 0 ? (
                            <span className={styles.stars}>
                              ★ {project.stars}
                            </span>
                          ) : null}
                          {project.downloads ? (
                            <span className={styles.downloads}>
                              {project.downloads.toLocaleString()} installs
                            </span>
                          ) : null}
                          {project.users ? (
                            <span className={styles.downloads}>
                              {project.users.toLocaleString()} user
                              {project.users === 1 ? "" : "s"}
                            </span>
                          ) : null}
                          {project.language ? (
                            <span className={styles.lang}>
                              {project.language}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      {project.description ? (
                        <p className={styles.rowDesc}>{project.description}</p>
                      ) : null}
                    </span>
                  </MorphLink>
                ))}
                {group.items.length % 2 === 1 ? (
                  <div className={styles.filler} aria-hidden />
                ) : null}
              </div>
            )}
          </section>
        ))
      )}

      {isFiltered ? null : children}
    </>
  )
}
