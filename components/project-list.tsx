"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import type { Project } from "@/lib/projects"
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

export const ProjectList = ({ groups }: { groups: Group[] }) => {
  const [sort, setSort] = useState<SortKey>("updated")
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [lang, setLang] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const compare = SORTS[sort].fn

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setOpen(false)
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

  const needle = query.trim().toLowerCase()
  const matches = (project: Project) =>
    (!lang || project.language === lang) &&
    (!needle ||
      `${project.name} ${project.description ?? ""}`
        .toLowerCase()
        .includes(needle))

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: [...group.items].filter(matches).sort(compare),
    }))
    .filter((group) => group.items.length > 0)

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
        <div className={styles.langs}>
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
        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Sort by</span>
          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              type="button"
              className={styles.trigger}
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {SORTS[sort].label}
              <span className={styles.chevron} aria-hidden />
            </button>
            {open ? (
              <ul className={styles.menu} role="listbox">
                {(Object.keys(SORTS) as SortKey[]).map((key) => (
                  <li key={key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={key === sort}
                      data-active={key === sort}
                      className={styles.option}
                      onClick={() => {
                        setSort(key)
                        setOpen(false)
                      }}
                    >
                      <span className={styles.check} aria-hidden>
                        {key === sort ? "✓" : ""}
                      </span>
                      {SORTS[key].label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <p className={styles.noResults}>
          No projects match “{query.trim()}”{lang ? ` in ${lang}` : ""}.
        </p>
      ) : (
        visibleGroups.map((group) => (
          <section
            key={group.key}
            className={styles.section}
            data-cat={group.key}
          >
            <h2 className={styles.sectionTitle}>
              <span className={styles.dot} />
              {group.name}
              <span className={styles.count}>{group.items.length}</span>
            </h2>
            {group.blurb ? <p className={styles.blurb}>{group.blurb}</p> : null}
            <div className={styles.list}>
              {group.items.map((project) => (
                <Link
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
                      <span className={styles.rowName}>{project.name}</span>
                      <span className={styles.rowMeta}>
                        {project.stars > 0 ? (
                          <span className={styles.stars}>
                            ★ {project.stars}
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
                </Link>
              ))}
              {group.items.length % 2 === 1 ? (
                <div className={styles.filler} aria-hidden />
              ) : null}
            </div>
          </section>
        ))
      )}
    </>
  )
}
