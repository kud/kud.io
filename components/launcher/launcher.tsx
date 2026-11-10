"use client"

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { KeyboardEvent, ReactNode } from "react"
import { createPortal } from "react-dom"
import { Command } from "cmdk"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  FileText,
  Hash,
  House,
  LayoutGrid,
  Monitor,
  Moon,
  Package,
  PenLine,
  Rss,
  Search,
  Store,
  Sun,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { GitHubIcon } from "@/components/social-icons"
import { readStoredTheme, useScopedTheme } from "@/components/scoped-theme"
import type { ScopedTheme } from "@/components/scoped-theme"
import type { LauncherIndex, LauncherProject } from "@/lib/launcher-index"
import { fuzzyScore } from "./fuzzy"
import styles from "./launcher.module.css"

type SectionKey = "pages" | "projects" | "writing" | "docs" | "actions"

const SECTION_LABEL: Record<SectionKey, string> = {
  pages: "Pages",
  projects: "Projects",
  writing: "Writing",
  docs: "Docs",
  actions: "Actions",
}

type Visual =
  | { kind: "glyph"; Icon: LucideIcon | typeof GitHubIcon }
  | { kind: "icon"; src: string | null; letter: string }
  | { kind: "cover"; src: string | null }

type Item = {
  id: string
  section: SectionKey
  title: ReactNode
  text: string
  meta?: string
  extras?: string[]
  visual: Visual
  href?: string
  // Opens in a new tab: another site, or a file such as the CV.
  external?: boolean
  // A same-site URL that is not a page (the feed), so no client navigation.
  hard?: boolean
  run?: () => void
  score?: number
}

type DocHit = {
  id: string
  type: "page" | "heading" | "text"
  content: string
  url: string
}

// The index is fetched once per page load and shared by every opening.
let cachedIndex: LauncherIndex | null = null
let pendingIndex: Promise<LauncherIndex> | null = null

export const preloadLauncherIndex = (): Promise<LauncherIndex> => {
  if (cachedIndex) return Promise.resolve(cachedIndex)
  pendingIndex ??= fetch("/api/launcher")
    .then((res) => {
      if (!res.ok) throw new Error(`launcher index: ${res.status}`)
      return res.json() as Promise<LauncherIndex>
    })
    .then((index) => (cachedIndex = index))
    .catch((error: unknown) => {
      pendingIndex = null
      throw error
    })
  return pendingIndex
}

// Docs hits arrive as "📦 <mark>Install</mark>ation" with markdown left in.
// Split on the marks rather than injecting HTML: the text is the docs'.
const cleanDoc = (content: string) =>
  content
    .replace(/\*\*|__|`/g, "")
    .replace(/^\p{Extended_Pictographic}️?\s*/u, "")
    .trim()

const highlighted = (content: string): ReactNode =>
  cleanDoc(content)
    .split(/(<mark>.*?<\/mark>)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith("<mark>") ? (
        <mark key={index}>{part.slice(6, -7)}</mark>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    )

const plain = (content: string) => cleanDoc(content).replace(/<\/?mark>/g, "")

const formatDate = (date: string) =>
  date
    ? new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : ""

const PAGES: Item[] = [
  {
    id: "page:home",
    section: "pages",
    title: "Home",
    text: "Home",
    meta: "kud.io",
    extras: ["kud.io", "about", "erwann"],
    visual: { kind: "glyph", Icon: House },
    href: "/",
  },
  {
    id: "page:projects",
    section: "pages",
    title: "Projects",
    text: "Projects",
    meta: "Everything I've built",
    extras: ["tools", "products", "apps"],
    visual: { kind: "glyph", Icon: LayoutGrid },
    href: "/projects",
  },
  {
    id: "page:writing",
    section: "pages",
    title: "Writing",
    text: "Writing",
    meta: "Posts and notes",
    extras: ["blog", "posts"],
    visual: { kind: "glyph", Icon: PenLine },
    href: "/blog",
  },
  {
    id: "page:cv",
    section: "pages",
    title: "CV",
    text: "CV",
    meta: "PDF",
    extras: ["resume", "résumé", "curriculum"],
    visual: { kind: "glyph", Icon: FileText },
    href: "/cv.pdf",
    external: true,
  },
]

const THEMES: { value: ScopedTheme; label: string; Icon: LucideIcon }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
]

const LIMIT: Record<SectionKey, number> = {
  pages: 4,
  projects: 6,
  writing: 6,
  docs: 8,
  actions: 6,
}

// Where the visitor is decides what comes first: on a post, writing; on a
// project, that project's actions and docs; elsewhere, the site's own map.
const sectionOrder = (projectSlug: string | null, onPost: boolean) =>
  projectSlug
    ? (["actions", "docs", "projects", "writing", "pages"] as const)
    : onPost
      ? (["writing", "pages", "projects", "docs", "actions"] as const)
      : (["pages", "projects", "writing", "docs", "actions"] as const)

const rank = (query: string, items: Item[], limit: number) =>
  items
    .map((item) => ({
      ...item,
      score: fuzzyScore(query, item.text, item.extras),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

const projectActions = (
  project: LauncherProject,
  copy: (text: string, id: string) => void,
  copiedId: string | null,
): Item[] => {
  const actions: Item[] = []
  if (project.npm) {
    const id = "action:install"
    actions.push({
      id,
      section: "actions",
      title: "Copy install command",
      text: "Copy install command",
      meta: copiedId === id ? "Copied" : project.npm.install,
      extras: ["npm", "install", project.npm.name],
      visual: { kind: "glyph", Icon: copiedId === id ? Check : Copy },
      run: () => copy(project.npm!.install, id),
    })
  }
  if (project.hasDocs)
    actions.push({
      id: "action:docs",
      section: "actions",
      title: `Open ${project.name} docs`,
      text: `Open ${project.name} docs`,
      meta: "Documentation",
      extras: ["docs", "documentation", "guide"],
      visual: { kind: "glyph", Icon: BookOpen },
      href: `/projects/${project.slug}/docs`,
    })
  if (project.repoUrl)
    actions.push({
      id: "action:github",
      section: "actions",
      title: `${project.name} on GitHub`,
      text: `${project.name} on GitHub`,
      meta: "Source",
      extras: ["github", "source", "repo", "code"],
      visual: { kind: "glyph", Icon: GitHubIcon },
      href: project.repoUrl,
      external: true,
    })
  if (project.npm)
    actions.push({
      id: "action:npm",
      section: "actions",
      title: `${project.name} on npm`,
      text: `${project.name} on npm`,
      meta: project.npm.name,
      extras: ["npm", "package", "registry"],
      visual: { kind: "glyph", Icon: Package },
      href: `https://www.npmjs.com/package/${project.npm.name}`,
      external: true,
    })
  if (project.storeUrl)
    actions.push({
      id: "action:store",
      section: "actions",
      title: `${project.name} in the store`,
      text: `${project.name} in the store`,
      meta: project.type,
      extras: ["store", "install", "raycast", "firefox"],
      visual: { kind: "glyph", Icon: Store },
      href: project.storeUrl,
      external: true,
    })
  return actions
}

const VisualMark = ({ visual }: { visual: Visual }) => {
  if (visual.kind === "glyph") {
    const { Icon } = visual
    return (
      <span className={styles.mark} aria-hidden>
        <Icon className={styles.glyph} />
      </span>
    )
  }
  if (visual.kind === "icon")
    return (
      <span className={styles.mark} aria-hidden>
        {visual.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote repo icons, 28px, no optimiser needed
          <img src={visual.src} alt="" width={28} height={28} loading="lazy" />
        ) : (
          <span className={styles.letter}>{visual.letter}</span>
        )}
      </span>
    )
  return (
    <span className={styles.cover} aria-hidden>
      {visual.src ? (
        // eslint-disable-next-line @next/next/no-img-element -- the 320×180 thumb, drawn at 48×27
        <img src={visual.src} alt="" width={48} height={27} loading="lazy" />
      ) : (
        <PenLine className={styles.glyph} />
      )}
    </span>
  )
}

type PanelProps = { onClose: () => void }

// Mounted fresh for every opening, so the query, the selection and the docs
// scope start clean without effects resetting them.
const LauncherPanel = ({ onClose }: PanelProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme } = useScopedTheme()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Rendered inside the page's themed wrapper, so the palette is the page's
  // own and follows a theme switch live. Home has none and takes the Dusk day palette.
  const [container] = useState<Element>(
    () => document.querySelector("[data-theme-scope]") ?? document.body,
  )
  const themed = container !== document.body

  const projectSlug = pathname.match(/^\/projects\/([^/]+)/)?.[1] ?? null
  const onPost = /^\/blog\/\d{4}\/\d{2}\/\d{2}\//.test(pathname)

  const [index, setIndex] = useState<LauncherIndex | null>(cachedIndex)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [docsWide, setDocsWide] = useState(false)
  const [docs, setDocs] = useState<{ key: string; hits: DocHit[] } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [announce, setAnnounce] = useState("")

  const currentProject =
    index?.projects.find((project) => project.slug === projectSlug) ?? null
  const docsTag = currentProject?.hasDocs && !docsWide ? projectSlug : null
  const trimmed = query.trim()
  const docsKey = `${docsTag ?? ""}\u0000${trimmed}`

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    inputRef.current?.focus()
    return () => dialog.close()
  }, [])

  useEffect(() => {
    if (cachedIndex) return
    preloadLauncherIndex().then(setIndex, () => setFailed(true))
  }, [])

  // Docs come from the existing search route; a short pause so typing a word
  // is one request, not five.
  useEffect(() => {
    if (trimmed.length < 2) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ query: trimmed })
      if (docsTag) params.set("tag", docsTag)
      fetch(`/api/search?${params}`, { signal: controller.signal })
        .then((res) => (res.ok ? (res.json() as Promise<DocHit[]>) : []))
        .then((hits) => setDocs({ key: docsKey, hits }))
        .catch(() => {})
    }, 120)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, docsTag, docsKey])

  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopiedId(id)
        setAnnounce(`Copied ${text}`)
      },
      () => setAnnounce("Could not copy"),
    )
  }

  const sections = useMemo(() => {
    const projectsById = new Map(
      (index?.projects ?? []).map((project) => [project.slug, project]),
    )

    const projects: Item[] = (index?.projects ?? []).map((project) => ({
      id: `project:${project.slug}`,
      section: "projects",
      title: project.name,
      text: project.name,
      meta: project.type,
      extras: [project.slug, project.type, project.description ?? ""],
      visual: {
        kind: "icon",
        src: project.icon,
        letter: project.name.charAt(0).toUpperCase(),
      },
      href: `/projects/${project.slug}`,
    }))

    const writing: Item[] = (index?.posts ?? []).map((post) => ({
      id: `post:${post.href}`,
      section: "writing",
      title: post.title,
      text: post.title,
      meta: formatDate(post.date),
      extras: [...post.tags, post.description],
      visual: { kind: "cover", src: post.thumb },
      href: post.href,
    }))

    const current = themed ? readStoredTheme() : null
    const actions: Item[] = [
      ...(currentProject ? projectActions(currentProject, copy, copiedId) : []),
      // Home has no theme of its own, so a switch there would change
      // nothing the visitor can see.
      ...(themed
        ? THEMES.map(({ value, label, Icon }) => ({
            id: `theme:${value}`,
            section: "actions" as const,
            title: `${label} theme`,
            text: `${label} theme`,
            meta: current === value ? "Current" : "Appearance",
            extras: ["theme", "appearance", "mode", "colour", "color"],
            visual: { kind: "glyph" as const, Icon },
            run: () => {
              onClose()
              setTheme(value, document.querySelector("[data-launcher-trigger]"))
            },
          }))
        : []),
      {
        id: "action:rss",
        section: "actions",
        title: "RSS feed",
        text: "RSS feed",
        meta: "Writing",
        extras: ["rss", "feed", "subscribe", "atom"],
        visual: { kind: "glyph", Icon: Rss },
        href: "/blog/feed.xml",
        hard: true,
      },
    ]

    // Docs hits come grouped page first; each heading or passage borrows its
    // page's title as its caption, and its project's name when widened.
    let pageTitle = ""
    const docItems: Item[] =
      trimmed.length >= 2 && docs?.key === docsKey
        ? docs.hits.slice(0, LIMIT.docs).map((hit) => {
            if (hit.type === "page") pageTitle = plain(hit.content)
            const slug = hit.url.match(/^\/projects\/([^/#]+)/)?.[1] ?? ""
            const projectName = projectsById.get(slug)?.name ?? slug
            const caption =
              hit.type === "page"
                ? projectName
                : [pageTitle, docsTag ? null : projectName]
                    .filter(Boolean)
                    .join(" · ")
            return {
              id: `doc:${hit.id}`,
              section: "docs" as const,
              title: highlighted(hit.content),
              text: plain(hit.content),
              meta: caption,
              visual: {
                kind: "glyph" as const,
                Icon: hit.type === "page" ? BookOpen : Hash,
              },
              href: hit.url,
            }
          })
        : []

    const pools: Record<SectionKey, Item[]> = {
      pages: PAGES,
      projects,
      writing,
      docs: docItems,
      actions,
    }

    const pick = (key: SectionKey): Item[] => {
      if (key === "docs") return docItems
      if (trimmed) return rank(trimmed, pools[key], LIMIT[key])
      // An empty box still has somewhere to go: the map, the pins, the
      // latest posts, and whatever this page can do.
      if (key === "projects")
        return projects.filter(
          (item) => projectsById.get(item.id.slice(8))?.pinned,
        )
      if (key === "writing") return writing.slice(0, onPost ? 5 : 3)
      return pools[key]
    }

    return sectionOrder(projectSlug, onPost)
      .map((key) => ({ key, items: pick(key) }))
      .filter((section) => section.items.length > 0)
    // copy and setTheme are stable enough; their identity must not reset the list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    index,
    trimmed,
    docs,
    docsKey,
    docsTag,
    currentProject,
    copiedId,
    themed,
    projectSlug,
    onPost,
  ])

  const flat = sections.flatMap((section) => section.items)
  const active = flat.find((item) => item.id === activeId) ?? flat[0]

  // cmdk scrolls on its own arrow moves; a Tab jump is ours, so is its scroll.
  useEffect(() => {
    listRef.current
      ?.querySelector('[cmdk-item][data-selected="true"]')
      ?.scrollIntoView({ block: "nearest" })
  }, [active])

  // cmdk's onSelect carries no event, so ⌘/Ctrl is read off the key or
  // pointer that led to it: held, a link opens in a new tab.
  const newTab = useRef(false)

  const activate = (item: Item) => {
    if (item.run) return item.run()
    if (!item.href) return
    if (item.external || newTab.current)
      window.open(item.href, "_blank", "noopener,noreferrer")
    else if (item.hard) window.location.assign(item.href)
    else router.push(item.href)
    onClose()
  }

  // Tab jumps to the first result of the next section, Shift+Tab back.
  const jumpSection = (delta: number) => {
    if (sections.length < 2 || !active) return
    const at = sections.findIndex((section) => section.key === active.section)
    const next = (at + delta + sections.length) % sections.length
    setActiveId(sections[next].items[0].id)
  }

  // Runs before cmdk's own handler, which leaves alone what this prevents.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    newTab.current = event.metaKey || event.ctrlKey
    if (event.key === "Tab") {
      event.preventDefault()
      jumpSection(event.shiftKey ? -1 : 1)
    } else if (event.key === "Backspace" && !query && docsTag) {
      setDocsWide(true)
      setAnnounce("Searching all docs")
    }
  }

  const status = failed
    ? "Projects and posts could not load. Docs search still works."
    : !index
      ? "Loading…"
      : trimmed && flat.length === 0
        ? ""
        : `${flat.length} result${flat.length === 1 ? "" : "s"}`

  const placeholder = currentProject
    ? currentProject.hasDocs
      ? "Search docs, projects, writing…"
      : "Search projects, writing, actions…"
    : onPost
      ? "Search writing, projects, docs…"
      : "Search pages, projects, writing, docs…"

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Search kud.io"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {/* cmdk drives the list: arrows, Enter, pointer selection and the
          combobox/listbox wiring. Ranking stays ours (shouldFilter off),
          because the order follows the page, not only the match. */}
      <Command
        className={styles.panel}
        label="Search kud.io"
        shouldFilter={false}
        loop
        value={active?.id ?? ""}
        onValueChange={setActiveId}
        onKeyDown={onKeyDown}
      >
        <div className={styles.bar}>
          <Search className={styles.barIcon} aria-hidden />
          <Command.Input
            ref={inputRef}
            className={styles.input}
            placeholder={placeholder}
            value={query}
            onValueChange={(value) => {
              setQuery(value)
              setActiveId(null)
              setCopiedId(null)
            }}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          {currentProject?.hasDocs ? (
            <button
              type="button"
              className={styles.chip}
              aria-pressed={!docsWide}
              title={
                docsWide
                  ? `Search ${currentProject.name} docs only`
                  : "Search every project's docs"
              }
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setDocsWide((wide) => !wide)
                setAnnounce(
                  docsWide
                    ? `Searching ${currentProject.name} docs`
                    : "Searching all docs",
                )
              }}
            >
              <span className={styles.visuallyHidden}>Docs scope: </span>
              {docsWide ? "All docs" : `${currentProject.name} docs`}
              <span aria-hidden className={styles.chipSwap}>
                {docsWide ? "↺" : "×"}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            className={styles.esc}
            onClick={onClose}
            aria-label="Close search"
          >
            <span className={styles.escKey}>esc</span>
            <span className={styles.escWord}>Close</span>
          </button>
        </div>

        <Command.List
          ref={listRef}
          className={styles.list}
          label="Results"
          onPointerDown={(event) => {
            newTab.current = event.metaKey || event.ctrlKey
          }}
        >
          {sections.map((section) => (
            <Command.Group
              key={section.key}
              className={styles.group}
              heading={
                <>
                  {SECTION_LABEL[section.key]}
                  {section.key === "docs" && currentProject && docsTag ? (
                    <span className={styles.headingNote}>
                      {" "}
                      · {currentProject.name}
                    </span>
                  ) : null}
                </>
              }
            >
              {section.items.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.id}
                  className={styles.option}
                  onSelect={() => activate(item)}
                >
                  <VisualMark visual={item.visual} />
                  <span className={styles.text}>
                    <span className={styles.title}>{item.title}</span>
                    {item.meta ? (
                      <span className={styles.meta}>{item.meta}</span>
                    ) : null}
                  </span>
                  {item.external ? (
                    <ArrowUpRight className={styles.trail} aria-hidden />
                  ) : null}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
          {trimmed && flat.length === 0 && index ? (
            <Command.Empty className={styles.empty}>
              Nothing matches “{trimmed}”. Try a project, a post title, or a
              word from the docs.
            </Command.Empty>
          ) : null}
        </Command.List>

        <div className={styles.foot} aria-hidden>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>tab</kbd> next section
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span className={styles.footStatus}>{status}</span>
        </div>
        <div role="status" aria-live="polite" className={styles.visuallyHidden}>
          {announce || status}
        </div>
      </Command>
    </dialog>,
    container,
  )
}

// fumadocs' SearchProvider owns the open state and the ⌘K / Ctrl+K hotkey;
// this replaces its dialog everywhere, the docs included.
export const Launcher = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => (open ? <LauncherPanel onClose={() => onOpenChange(false)} /> : null)
