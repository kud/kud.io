"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react"
import { MorphLink } from "@/components/morph-link"
import type { Project as RepoProject } from "@/lib/projects"

// A tile in the list: a tagged repo, or a listed app with no public source
// (lib/listed-apps.ts), which opens its live address instead of a kud.io page.
type Project = Omit<RepoProject, "repoUrl"> & { href?: string }

// Where a tile goes: its kud.io page, or, for a listed app, the app itself.
const TileLink = ({
  project,
  className,
  style,
  children,
}: {
  project: Project
  className: string
  style?: CSSProperties
  children: ReactNode
}) =>
  project.href ? (
    <a
      href={project.href}
      className={className}
      style={style}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ) : (
    <MorphLink
      href={`/projects/${project.slug}`}
      className={className}
      style={style}
    >
      {children}
    </MorphLink>
  )

const subscribeToNothing = () => () => {}
import type { Ecosystem } from "@/lib/ecosystems"
import { isAppCategory } from "@/lib/categories"
import styles from "./project-list.module.css"

type Group = {
  key: string
  name: string
  blurb: string | null
  items: Project[]
}

// The latest release of a project, decided on the server (lib/release.ts).
export type ReleaseSummary = {
  version: string
  publishedAt: string | null
  // Under two weeks old: the only releases allowed to move on this page.
  fresh: boolean
  age: string | null
}

const FreshPill = ({ version }: { version: string }) => (
  <span className={styles.freshPill}>
    <span className={styles.freshDot} aria-hidden />
    New
    <span className={styles.freshVersion}>v{version}</span>
  </span>
)

// A row's release line, under the description: the meta line beside the name
// has no width to spare in the two-column grid. Only a release under two weeks
// old earns one.
const RowRelease = ({ release }: { release: ReleaseSummary | undefined }) =>
  release?.fresh ? (
    <span className={styles.rowRelease}>
      <FreshPill version={release.version} />
      {release.age ? <span>{release.age}</span> : null}
    </span>
  ) : null

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
  releases,
  children,
}: {
  groups: Group[]
  ecosystems: Ecosystem[]
  releases: Record<string, ReleaseSummary>
  // Footer content (the Contributions graph) rendered on the server and hidden
  // once the grid is narrowed to a filtered subset.
  children?: ReactNode
}) => {
  const [sort, setSort] = useState<SortKey>("updated")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [lang, setLang] = useState<string | null>(null)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [hasFilterInteraction, setHasFilterInteraction] = useState(false)
  // The filter rail stays out of the way while the hero is in view, then fades
  // in once the browse area scrolls up. `scrollReveal` is only switched on after
  // mount, so with JS disabled the rail renders visible (progressive
  // enhancement) rather than being stranded hidden.
  const scrollReveal = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  )
  const [filtersRevealed, setFiltersRevealed] = useState(false)
  const revealSentinelRef = useRef<HTMLDivElement>(null)
  // Ecosystem is single-select (unlike tags): you're looking at one family at a
  // time. Clicking the active tile again clears it.
  const [activeEcosystem, setActiveEcosystem] = useState<string | null>(null)
  const compare = SORTS[sort].fn

  const markFilterInteraction = () => setHasFilterInteraction(true)

  // Keep the rail hidden over the hero, then reveal it once the top of the
  // browse area has climbed near the top of the viewport — i.e. the hero has
  // scrolled away and you're into the Apps grid. The sentinel sits at the top of
  // `.main`, so its `top` starts at the hero's height and shrinks as you scroll;
  // once it drops below ~15% of the viewport the hero is essentially gone. It
  // recedes again on the way back up. Read on every scroll frame (rAF-throttled)
  // rather than on observer crossings, so it can't get stuck between boundaries.
  useEffect(() => {
    const sentinel = revealSentinelRef.current
    if (!sentinel) return
    let frame = 0
    const update = () => {
      frame = 0
      setFiltersRevealed(
        sentinel.getBoundingClientRect().top <= window.innerHeight * 0.15,
      )
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const toggleTag = (tag: string) => {
    markFilterInteraction()
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    )
  }

  // Languages ordered by how many projects use them, so the common ones lead.
  const languageCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const group of groups)
      for (const project of group.items)
        if (project.language)
          counts.set(project.language, (counts.get(project.language) ?? 0) + 1)
    return counts
  }, [groups])
  const languages = useMemo(
    () =>
      [...languageCounts.keys()].sort(
        (a, b) =>
          (languageCounts.get(b) ?? 0) - (languageCounts.get(a) ?? 0) ||
          a.localeCompare(b),
      ),
    [languageCounts],
  )

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
  const filterKey = [
    needle,
    category ?? "all-types",
    lang ?? "all-languages",
    activeEcosystem ?? "all-ecosystems",
    activeTags.join(","),
    sort,
  ].join("|")

  return (
    <>
      <div
        className={`${styles.layout} ${scrollReveal ? styles.scrollReveal : ""}`}
      >
        <div className={styles.main}>
          <div
            ref={revealSentinelRef}
            className={styles.revealSentinel}
            aria-hidden
          />
          <div
            key={filterKey}
            className={`${styles.results} ${hasFilterInteraction ? styles.resultsAnimated : ""}`}
          >
            {visibleGroups.length === 0 ? (
              <p className={styles.noResults}>
                No projects match “{query.trim()}”{lang ? ` in ${lang}` : ""}.
              </p>
            ) : (
              visibleGroups.map((group) => (
                <section
                  key={group.key}
                  id={
                    group.key === "product"
                      ? "products"
                      : group.key === "app"
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
                  {group.blurb ? (
                    <p className={styles.blurb}>{group.blurb}</p>
                  ) : null}
                  {isAppCategory(group.key) ? (
                    <div className={styles.appGrid}>
                      {group.items.map((project) => (
                        <TileLink
                          key={project.slug}
                          project={project}
                          className={styles.appTile}
                          style={
                            project.accent
                              ? ({
                                  "--app-accent": project.accent,
                                } as CSSProperties)
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
                                  project.icon &&
                                  !project.icon.endsWith(".svg"),
                                )}
                              />
                            ) : (
                              <span className={styles.appMonogram} aria-hidden>
                                {project.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </span>
                          <span className={styles.appName}>
                            {releases[project.slug]?.fresh ? (
                              <span
                                className={styles.freshDot}
                                role="img"
                                aria-label={`New release, v${releases[project.slug].version}`}
                              />
                            ) : null}
                            {project.name}
                          </span>
                        </TileLink>
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
                                  <span
                                    className={styles.stars}
                                    aria-label={`${project.stars} GitHub star${project.stars === 1 ? "" : "s"}`}
                                  >
                                    <span aria-hidden>★</span> {project.stars}
                                  </span>
                                ) : null}
                                {project.downloads ? (
                                  <span className={styles.downloads}>
                                    {project.downloads.toLocaleString()}{" "}
                                    installs
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
                              <p className={styles.rowDesc}>
                                {project.description}
                              </p>
                            ) : null}
                            <RowRelease release={releases[project.slug]} />
                          </span>
                        </MorphLink>
                      ))}
                      {/* Odd trailing slots read as intentional, not broken:
                          one per empty cell, for two columns and for three
                          (the wide layout). */}
                      {group.items.length % 2 === 1 ? (
                        <div className={styles.filler} aria-hidden />
                      ) : null}
                      {Array.from(
                        { length: (3 - (group.items.length % 3)) % 3 },
                        (_, index) => (
                          <div
                            key={index}
                            className={styles.filler3}
                            aria-hidden
                          />
                        ),
                      )}
                    </div>
                  )}
                </section>
              ))
            )}
          </div>

          {isFiltered ? null : children}
        </div>

        <aside className={styles.sidebar} data-revealed={filtersRevealed}>
          <input
            type="search"
            className={styles.search}
            placeholder="Search projects…"
            value={query}
            onChange={(event) => {
              markFilterInteraction()
              setQuery(event.target.value)
            }}
            aria-label="Search projects"
          />
          <Dropdown
            label="Type"
            value={category}
            options={categoryOptions}
            onChange={(value) => {
              markFilterInteraction()
              setCategory(value)
            }}
          />
          <Dropdown
            label="Sort"
            value={sort}
            options={sortOptions}
            onChange={(value) => {
              markFilterInteraction()
              setSort((value ?? "updated") as SortKey)
            }}
          />

          {ecosystems.length > 0 ? (
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Ecosystems</span>
              <div className={styles.chips}>
                <button
                  type="button"
                  className={styles.chip}
                  data-active={activeEcosystem === null}
                  onClick={() => {
                    markFilterInteraction()
                    setActiveEcosystem(null)
                  }}
                >
                  All
                </button>
                {ecosystems.map((ecosystem) => (
                  <button
                    key={ecosystem.key}
                    type="button"
                    className={styles.ecosystemChip}
                    data-active={activeEcosystem === ecosystem.key}
                    onClick={() => {
                      markFilterInteraction()
                      setActiveEcosystem(
                        activeEcosystem === ecosystem.key
                          ? null
                          : ecosystem.key,
                      )
                    }}
                  >
                    {ecosystem.name}
                    <span className={styles.chipCount}>{ecosystem.count}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Languages</span>
            <div className={styles.chips}>
              <button
                type="button"
                className={styles.chip}
                data-active={lang === null}
                onClick={() => {
                  markFilterInteraction()
                  setLang(null)
                }}
              >
                All
              </button>
              {languages.map((language) => (
                <button
                  key={language}
                  type="button"
                  className={styles.languageChip}
                  data-active={lang === language}
                  onClick={() => {
                    markFilterInteraction()
                    setLang(lang === language ? null : language)
                  }}
                >
                  {language}
                  <span className={styles.languageCount}>
                    {languageCounts.get(language)}
                  </span>
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
                    onClick={() => {
                      markFilterInteraction()
                      setActiveTags([])
                    }}
                  >
                    clear
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  )
}
