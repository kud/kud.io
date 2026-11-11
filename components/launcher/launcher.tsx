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
  Columns2,
  Copy,
  FileText,
  Gift,
  Hash,
  House,
  Keyboard,
  LayoutGrid,
  Link2,
  ListFilter,
  Mail,
  Monitor,
  Droplet,
  Moon,
  Package,
  PenLine,
  Rss,
  Search,
  Store,
  Sun,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  BlueskyIcon,
  GitHubIcon,
  LinkedInIcon,
} from "@/components/social-icons"
import { CATEGORY_META } from "@/lib/categories"
import { ELSEWHERE, hostOf } from "@/lib/links"
import type { ElsewhereKey } from "@/lib/links"
import { reducedMotion } from "@/components/ink"
import {
  SCOPED_THEMES,
  SECTION_LABEL as THEME_SECTION_LABEL,
  useScopedTheme,
} from "@/components/scoped-theme"
import type { ScopedTheme } from "@/components/scoped-theme"
import type { LauncherIndex, LauncherProject } from "@/lib/launcher-index"
import { fuzzyScore } from "./fuzzy"
import { DetailView, formatDate } from "./detail-view"
import type { Detail } from "./detail-view"
import { CONTACT_ADDRESS, MessageForm } from "./message-form"
import type { MessageDraft } from "./message-form"
import { ShortcutsSheet } from "./shortcuts-sheet"
import styles from "./launcher.module.css"

type SectionKey =
  | "filters"
  | "outline"
  | "pages"
  | "projects"
  | "releases"
  | "writing"
  | "docs"
  | "actions"
  | "elsewhere"
  | "settings"

const SECTION_LABEL: Record<SectionKey, string> = {
  filters: "Filters",
  outline: "On this page",
  pages: "Pages",
  projects: "Projects",
  releases: "Latest releases",
  writing: "Writing",
  docs: "Docs",
  actions: "Actions",
  elsewhere: "Elsewhere",
  settings: "Settings",
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
  // A project or a post: Enter shows what it is first, a second Enter goes.
  detail?: Detail
  // What ⌘C copies while the row is selected: its link, or its anchor.
  copyText?: string
  // A release out since the last visit: a still dot after the title.
  fresh?: boolean
  // Keys drawn in place of the meta, for a row that has a shortcut.
  keys?: string[]
  // The option's spoken name, when its visible content says it less well.
  label?: string
  score?: number
}

// A filter narrows the list to one kind of project (cli:) or one family
// (#jenkins), shown as a removable chip in the bar.
type Filter = {
  kind: "category" | "ecosystem"
  key: string
  // The token as typed, for the chip: "cli:", "#jenkins".
  token: string
  // The words, for the heading and the screen reader: "CLIs & Tools".
  name: string
}

// A few kinds answer to the word people use rather than the topic's key.
const CATEGORY_ALIAS: Record<string, string> = {
  firefox: "webext",
  addon: "webext",
  extension: "webext",
  apps: "app",
  libs: "lib",
  themes: "theme",
}

const ELSEWHERE_MARK: Record<ElsewhereKey, Visual> = {
  referrals: { kind: "glyph", Icon: Gift },
  beansontoast: {
    kind: "icon",
    src: "/beansontoast-mark.svg",
    letter: "B",
  },
  github: { kind: "glyph", Icon: GitHubIcon },
  bluesky: { kind: "glyph", Icon: BlueskyIcon },
  linkedin: { kind: "glyph", Icon: LinkedInIcon },
}

// Releases since the visitor was last here earn a dot. The baseline is the
// previous visit's time, read once per tab session so a second opening still
// shows what the first did; a first visit has no baseline and no dots.
const LAST_VISIT_KEY = "kud.launcher.lastVisit"
const VISIT_BASELINE_KEY = "kud.launcher.visitBaseline"

const readVisitBaseline = (): number | null => {
  try {
    const kept = sessionStorage.getItem(VISIT_BASELINE_KEY)
    if (kept !== null) return kept ? Number(kept) : null
    const previous = localStorage.getItem(LAST_VISIT_KEY)
    sessionStorage.setItem(VISIT_BASELINE_KEY, previous ?? "")
    localStorage.setItem(LAST_VISIT_KEY, String(Date.now()))
    return previous ? Number(previous) : null
  } catch {
    return null
  }
}

const ageLabel = (iso: string, now = Date.now()) => {
  const days = Math.max(0, Math.floor((now - Date.parse(iso)) / 86_400_000))
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" })
  return days < 30
    ? rtf.format(-days, "day")
    : days < 365
      ? rtf.format(-Math.floor(days / 30), "month")
      : rtf.format(-Math.floor(days / 365), "year")
}

// The page as a link: its address without the hash, its title without the
// site's name.
const pageLink = () => {
  const url = `${window.location.origin}${window.location.pathname}`
  const title =
    document.title.replace(/\s+[·|—–-]\s+(kud\.io|Erwann Mest)$/i, "").trim() ||
    url
  return { url, markdown: `[${title.replace(/[[\]]/g, "\\$&")}](${url})` }
}

// The headings of the post or the docs page being read, straight from the
// rendered page, so they never drift from what the reader sees.
const OUTLINE = "article :is(h2, h3)[id]"

const readOutline = (pathname: string) => {
  const onPost = /^\/blog\/\d{4}\/\d{2}\/\d{2}\//.test(pathname)
  const onDocs = /^\/projects\/[^/]+\/docs(\/|$)/.test(pathname)
  if (!onPost && !onDocs) return []
  return Array.from(document.querySelectorAll<HTMLElement>(OUTLINE))
    .map((node) => ({
      id: node.id,
      text: (node.textContent ?? "").replace(/\s+/g, " ").trim(),
      level: node.tagName === "H3" ? 3 : 2,
    }))
    .filter((heading) => heading.text)
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

// The list is SCOPED_THEMES, shared with the pickers; only the word and the
// mark live here, so a new theme fails the build until it has both.
const THEME_OPTION: Record<ScopedTheme, { label: string; Icon: LucideIcon }> = {
  system: { label: "System", Icon: Monitor },
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
  ink: { label: "Ink", Icon: Droplet },
}

const THEMES = SCOPED_THEMES.map((value) => ({ value, ...THEME_OPTION[value] }))

const LIMIT: Record<SectionKey, number> = {
  filters: 4,
  outline: 5,
  pages: 5,
  projects: 6,
  releases: 5,
  writing: 6,
  docs: 8,
  actions: 6,
  elsewhere: 5,
  settings: 2,
}

// The filters a half-typed box could mean: every family after a #, ranked by
// what follows it; a kind whose key (or a word for it) starts the box.
const filterOptions = (
  index: LauncherIndex | null,
  typed: string,
): { next: Filter; count: number }[] => {
  if (!index) return []
  const { projects } = index
  if (typed.startsWith("#")) {
    const families = new Map<string, string>()
    for (const project of projects)
      if (project.ecosystem)
        families.set(project.ecosystem.key, project.ecosystem.name)
    const word = typed.slice(1)
    return [...families]
      .map(([key, name]) => ({
        key,
        name,
        score: word ? fuzzyScore(word, key, [name]) : 1,
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, word ? LIMIT.filters : undefined)
      .map(({ key, name }) => ({
        next: { kind: "ecosystem", key, token: `#${key}`, name },
        count: projects.filter((p) => p.ecosystem?.key === key).length,
      }))
  }
  const word = typed.toLowerCase()
  if (!/^[a-z]{2,}$/.test(word)) return []
  const kinds = new Set(projects.map((project) => project.category))
  return Object.keys(CATEGORY_META)
    .filter(
      (key) =>
        kinds.has(key) &&
        (key.startsWith(word) ||
          Object.entries(CATEGORY_ALIAS).some(
            ([alias, target]) => target === key && alias.startsWith(word),
          )),
    )
    .slice(0, LIMIT.filters)
    .map((key) => ({
      next: {
        kind: "category",
        key,
        token: `${key}:`,
        name: CATEGORY_META[key].name,
      },
      count: projects.filter((p) => p.category === key).length,
    }))
}

// Where the visitor is decides what comes first: on a post, its outline and
// writing; on a project, that project's actions and docs; elsewhere, the
// site's own map. A # is choosing a family, so the filters are all there is;
// a word that starts a kind offers it just under the projects, so Enter still
// opens the best match.
const sectionOrder = (
  projectSlug: string | null,
  onPost: boolean,
  hashing: boolean,
): readonly SectionKey[] =>
  hashing
    ? ["filters"]
    : projectSlug
      ? [
          "actions",
          "outline",
          "docs",
          "projects",
          "filters",
          "releases",
          "writing",
          "pages",
          "elsewhere",
          "settings",
        ]
      : onPost
        ? [
            "outline",
            "writing",
            "pages",
            "projects",
            "filters",
            "releases",
            "docs",
            "actions",
            "elsewhere",
            "settings",
          ]
        : [
            "pages",
            "projects",
            "filters",
            "releases",
            "writing",
            "docs",
            "actions",
            "elsewhere",
            "settings",
          ]

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

// True once `key` has stayed set for `ms`: a load that settles sooner never
// shows its placeholder, so a warm index or a quick docs hit does not flash.
// Keyed, so each new docs query waits its own delay.
const useDelayed = (key: string | null, ms: number) => {
  const [ready, setReady] = useState<string | null>(null)
  useEffect(() => {
    if (key === null) return
    const timer = window.setTimeout(() => setReady(key), ms)
    return () => window.clearTimeout(timer)
  }, [key, ms])
  return key !== null && ready === key
}

const SKELETON_WIDTHS = ["62%", "48%", "71%"]

// Stand-ins in the section's own layout while its results are on their way.
// Hidden from assistive tech: the list says aria-busy instead.
const SkeletonGroup = ({ section }: { section: SectionKey }) => (
  <div className={styles.group} aria-hidden>
    <div cmdk-group-heading="">{SECTION_LABEL[section]}</div>
    {SKELETON_WIDTHS.map((width) => (
      <div key={width} className={styles.skeletonRow}>
        <span
          className={`${styles.skeleton} ${
            section === "writing" ? styles.skeletonCover : styles.skeletonMark
          }`}
        />
        <span className={styles.skeletonText}>
          <span className={styles.skeleton} style={{ width }} />
          {section !== "docs" ? (
            <span className={`${styles.skeleton} ${styles.skeletonMeta}`} />
          ) : null}
        </span>
      </div>
    ))}
  </div>
)

type PanelProps = { onClose: () => void }

// Mounted fresh for every opening, so the query, the selection and the docs
// scope start clean without effects resetting them.
const LauncherPanel = ({ onClose }: PanelProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, split, setSplit, section } = useScopedTheme()
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
  // The message and detail views replace the list in the same panel; the list stays
  // mounted underneath, so the query and the selection survive a round trip,
  // and so does the draft.
  const [view, setView] = useState<"list" | "message" | "detail" | "keys">(
    "list",
  )
  const [detail, setDetail] = useState<Detail | null>(null)
  const [filter, setFilter] = useState<Filter | null>(null)
  const [visitBaseline] = useState(readVisitBaseline)
  const [outline] = useState(() => readOutline(pathname))
  const [draft, setDraft] = useState<MessageDraft>({
    topic: null,
    subject: "",
    body: "",
  })

  const backToList = () => {
    setView("list")
    setAnnounce("Back to search")
    // After the list is shown again, or focus lands on a hidden input.
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const currentProject =
    index?.projects.find((project) => project.slug === projectSlug) ?? null
  const docsTag = currentProject?.hasDocs && !docsWide ? projectSlug : null
  const trimmed = query.trim()
  const docsKey = `${docsTag ?? ""}\u0000${trimmed}`
  // A filter is about projects, and a # is still choosing one: no docs then.
  const docsWanted = trimmed.length >= 2 && !filter && !trimmed.startsWith("#")
  const [mod] = useState(() =>
    /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl",
  )

  const applyFilter = (next: Filter) => {
    setFilter(next)
    setActiveId(null)
    setCopiedId(null)
    setAnnounce(`Filtered to ${next.name}`)
    inputRef.current?.focus()
  }

  const clearFilter = () => {
    setFilter(null)
    setActiveId(null)
    setAnnounce("Filter removed")
    inputRef.current?.focus()
  }

  // "cli:" becomes a chip as soon as the colon lands; "#jenkins" once a space
  // follows, since "#je" is still on its way to a name. Only kinds and
  // families that have projects in them turn into chips.
  const matchFilter = (
    value: string,
  ): { next: Filter; rest: string } | null => {
    if (filter || !index) return null
    const kind = /^([a-z]+):\s*(.*)$/i.exec(value)
    if (kind) {
      const word = kind[1].toLowerCase()
      const key = CATEGORY_ALIAS[word] ?? word
      if (!index.projects.some((project) => project.category === key))
        return null
      return {
        next: {
          kind: "category",
          key,
          token: `${key}:`,
          name: CATEGORY_META[key]?.name ?? key,
        },
        rest: kind[2],
      }
    }
    const family = /^#([\w-]+)\s+(.*)$/.exec(value)
    if (family) {
      const key = family[1].toLowerCase()
      const ecosystem = index.projects.find(
        (project) => project.ecosystem?.key === key,
      )?.ecosystem
      if (!ecosystem) return null
      return {
        next: {
          kind: "ecosystem",
          key,
          token: `#${key}`,
          name: ecosystem.name,
        },
        rest: family[2],
      }
    }
    return null
  }

  // Enter on a heading: close, then scroll to it the way an in-page link does
  // (components/hash-scroll.tsx), the URL moving without a popstate.
  const jumpTo = (id: string) => {
    onClose()
    window.requestAnimationFrame(() => {
      const target = document.getElementById(id)
      if (!target) return
      history.pushState(history.state, "", `#${id}`)
      target.scrollIntoView({
        block: "start",
        behavior: reducedMotion() ? "auto" : "smooth",
      })
    })
  }

  const openKeys = () => {
    setView("keys")
    setAnnounce("Keyboard shortcuts")
  }

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    inputRef.current?.focus()
    return () => dialog.close()
  }, [])

  // cmdk (1.1.1) updates the input's aria-activedescendant only on its own
  // arrow moves; a selection set through `value` (the first result, a Tab
  // jump) is shown but announced late or not at all. Mirror the option it
  // marks selected onto the input, after each of its commits.
  useEffect(() => {
    const dialog = dialogRef.current
    const input = inputRef.current
    if (!dialog || !input) return
    const sync = () => {
      const selected = dialog.querySelector('[cmdk-item][data-selected="true"]')
      if (
        selected?.id &&
        input.getAttribute("aria-activedescendant") !== selected.id
      )
        input.setAttribute("aria-activedescendant", selected.id)
    }
    const observer = new MutationObserver(sync)
    observer.observe(dialog, {
      subtree: true,
      childList: true,
      attributeFilter: ["data-selected"],
    })
    sync()
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (cachedIndex) return
    preloadLauncherIndex().then(setIndex, () => setFailed(true))
  }, [])

  // Docs come from the existing search route; a short pause so typing a word
  // is one request, not five.
  useEffect(() => {
    if (!docsWanted) return
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
  }, [trimmed, docsTag, docsKey, docsWanted])

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
      href: project.href ?? `/projects/${project.slug}`,
      external: Boolean(project.href),
      detail: { kind: "project" as const, project },
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
      detail: { kind: "post" as const, post },
    }))

    // The newest versions, with a dot on what shipped since the last visit.
    // A release row opens its project as a project row does.
    const releases: Item[] = (index?.releases ?? []).flatMap((release) => {
      const row = projects.find((item) => item.id === `project:${release.slug}`)
      if (!row) return []
      const name = row.text
      const fresh =
        visitBaseline !== null &&
        Date.parse(release.publishedAt) > visitBaseline
      const age = ageLabel(release.publishedAt)
      return [
        {
          ...row,
          id: `release:${release.slug}`,
          section: "releases" as const,
          title: (
            <>
              {name} <span className={styles.version}>v{release.version}</span>
            </>
          ),
          meta: age,
          fresh,
          label: `${name} v${release.version}, ${age}${
            fresh ? ", new since your last visit" : ""
          }`,
        },
      ]
    })

    // A filter keeps the projects of one kind or one family.
    const inFilter = (item: Item) => {
      if (!filter) return true
      const project = projectsById.get(item.id.slice("project:".length))
      return filter.kind === "category"
        ? project?.category === filter.key
        : project?.ecosystem?.key === filter.key
    }

    // While no filter is set, a # lists the families and a word that starts a
    // kind ("cl", "rayc") offers that kind, so both can be found by typing.
    const filterItems: Item[] = filter
      ? []
      : filterOptions(index, trimmed).map(({ next, count }) => ({
          id: `filter:${next.token}`,
          section: "filters",
          title: next.token,
          text: next.key,
          meta: `${next.name} · ${count}`,
          extras: [next.name],
          visual: { kind: "glyph", Icon: ListFilter },
          run: () => {
            applyFilter(next)
            setQuery("")
          },
        }))

    // The post's or the docs page's own headings: Enter scrolls there, ⌘C
    // copies the link to it.
    const here = `${window.location.origin}${window.location.pathname}`
    const outlineItems: Item[] = outline.map((heading) => ({
      id: `outline:${heading.id}`,
      section: "outline",
      title: heading.text,
      text: heading.text,
      meta: heading.level === 3 ? "Subsection" : undefined,
      visual: { kind: "glyph", Icon: Hash },
      copyText: `${here}#${heading.id}`,
      label: `${heading.text}. Enter to go there, ${mod} C to copy its link.`,
      run: () => jumpTo(heading.id),
    }))

    // Where Erwann is elsewhere (lib/links.ts, shared with the footer). Each
    // opens in a new tab; ⌘C copies its address.
    const elsewhere: Item[] = ELSEWHERE.map((link) => ({
      id: `elsewhere:${link.key}`,
      section: "elsewhere",
      title: link.label,
      text: link.label,
      meta: hostOf(link.href),
      extras: link.aliases,
      visual: ELSEWHERE_MARK[link.key],
      href: link.href,
      external: true,
      copyText: link.href,
    }))

    // What can be done to this page, then the sheet of every key.
    const pageActions: Item[] = [
      {
        id: "action:copy-link",
        section: "actions",
        title: "Copy page link",
        text: "Copy page link",
        meta: window.location.pathname,
        extras: ["copy", "link", "url", "share", "address"],
        visual: { kind: "glyph", Icon: Link2 },
        run: () => copy(pageLink().url, "action:copy-link"),
      },
      {
        id: "action:copy-markdown",
        section: "actions",
        title: "Copy as Markdown link",
        text: "Copy as Markdown link",
        keys: [mod, "⇧", "C"],
        extras: ["markdown", "md", "copy", "link", "share"],
        visual: { kind: "glyph", Icon: Copy },
        run: () => copy(pageLink().markdown, "action:copy-markdown"),
      },
      {
        id: "action:shortcuts",
        section: "actions",
        title: "Keyboard shortcuts",
        text: "Keyboard shortcuts",
        keys: ["?"],
        extras: ["keys", "keyboard", "hotkeys", "help", "shortcuts"],
        visual: { kind: "glyph", Icon: Keyboard },
        run: openKeys,
      },
    ]

    // Actions are what can be done to this project, then to this page. The
    // theme is a setting, kept in its own section after the content.
    const actions: Item[] = [
      ...(currentProject ? projectActions(currentProject, copy, copiedId) : []),
      ...pageActions,
    ]

    const rss: Item = {
      id: "writing:rss",
      section: "writing",
      title: "RSS feed",
      text: "RSS feed",
      meta: "Subscribe",
      extras: ["rss", "feed", "subscribe", "atom"],
      visual: { kind: "glyph", Icon: Rss },
      href: "/blog/feed.xml",
      hard: true,
    }

    // One row with the three choices in it: Enter steps to the next, a typed
    // choice ("dark") is taken directly, and each choice is clickable. The
    // launcher stays open so the change is seen, page and palette both.
    // Home has no theme of its own, so the row would change nothing there.
    const pickTheme = (value: ScopedTheme) => {
      setTheme(value, document.querySelector("[data-launcher-trigger]"))
      setAnnounce(`Theme: ${THEME_OPTION[value].label}`)
    }
    const nextTheme = (): ScopedTheme => {
      const typed = THEMES.find(({ value, label }) =>
        [label, value].some(
          (name) =>
            trimmed && name.toLowerCase().startsWith(trimmed.toLowerCase()),
        ),
      )
      if (typed && typed.value !== theme) return typed.value
      const at = THEMES.findIndex(({ value }) => value === theme)
      return THEMES[(at + 1) % THEMES.length].value
    }
    const CurrentIcon =
      THEMES.find(({ value }) => value === theme)?.Icon ?? Monitor
    // Once themes are set per section, the row names the one it changes.
    const themeName =
      split && section ? `${THEME_SECTION_LABEL[section]} theme` : "Theme"
    // The opt-in for a theme per section: a second row, the same quiet
    // segments, Same by default. Enter flips it.
    const pickSplit = (value: boolean) => {
      setSplit(value)
      setAnnounce(
        value
          ? "Writing and projects: separate themes"
          : "Writing and projects: same theme",
      )
    }
    const splitRow: Item = {
      id: "setting:theme-split",
      label: `Writing and projects: ${split ? "Separate" : "Same"}. Enter to change.`,
      section: "settings",
      text: "Theme per section",
      title: (
        <span className={styles.setting}>
          Writing &amp; projects
          <span className={styles.segments}>
            {[
              { value: false, label: "Same" },
              { value: true, label: "Separate" },
            ].map(({ value, label }) => (
              <span
                key={label}
                className={styles.segment}
                data-active={value === split || undefined}
                onClick={(event) => {
                  event.stopPropagation()
                  pickSplit(value)
                }}
              >
                {label}
              </span>
            ))}
          </span>
        </span>
      ),
      extras: [
        "writing",
        "projects",
        "blog",
        "section",
        "separate",
        "same",
        "split",
        "appearance",
        "colour",
        "color",
      ],
      visual: { kind: "glyph", Icon: Columns2 },
      run: () => pickSplit(!split),
    }
    const settings: Item[] = themed
      ? [
          {
            id: "setting:theme",
            label: `${themeName}: ${THEME_OPTION[theme].label}. Enter to change.`,
            section: "settings",
            text: themeName,
            title: (
              <span className={styles.setting}>
                {themeName}
                <span className={styles.segments}>
                  {THEMES.map(({ value, label, Icon }) => (
                    <span
                      key={value}
                      className={styles.segment}
                      data-active={value === theme || undefined}
                      onClick={(event) => {
                        event.stopPropagation()
                        pickTheme(value)
                      }}
                    >
                      <Icon aria-hidden className={styles.segmentIcon} />
                      {label}
                    </span>
                  ))}
                </span>
              </span>
            ),
            extras: [
              "light",
              "dark",
              "system",
              "auto",
              "appearance",
              "mode",
              "colour",
              "color",
            ],
            visual: { kind: "glyph", Icon: CurrentIcon },
            run: () => pickTheme(nextTheme()),
          },
          splitRow,
        ]
      : []

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

    const message: Item = {
      id: "page:message",
      section: "pages",
      title: "Send me a message",
      text: "Send me a message",
      meta: "Email",
      extras: ["email", "mail", "contact", "message", "write", "hello"],
      visual: { kind: "glyph", Icon: Mail },
      run: () => {
        // On a project page, a fresh message starts as a question about it.
        if (currentProject)
          setDraft((draft) =>
            draft.subject || draft.body || draft.topic
              ? draft
              : { ...draft, topic: "project" },
          )
        setView("message")
        setAnnounce("Send me a message")
      },
    }

    const pools: Record<SectionKey, Item[]> = {
      filters: filterItems,
      outline: outlineItems,
      pages: [...PAGES, message],
      projects,
      releases,
      writing: [...writing, rss],
      docs: docItems,
      actions,
      elsewhere,
      settings,
    }

    const pick = (key: SectionKey): Item[] => {
      // A filter shows its projects and nothing else: all of them on an empty
      // box, the best matches once something is typed.
      if (filter) {
        if (key !== "projects") return []
        const kept = projects.filter(inFilter)
        return trimmed ? rank(trimmed, kept, kept.length) : kept
      }
      if (key === "filters") return filterItems
      // A # is still choosing a family; nothing else answers to it.
      if (trimmed.startsWith("#")) return []
      if (key === "docs") return docItems
      // Releases are a view of the empty box; typed, the project rows answer.
      if (key === "releases")
        return trimmed ? [] : releases.slice(0, LIMIT.releases)
      if (trimmed) return rank(trimmed, pools[key], LIMIT[key])
      // An empty box still has somewhere to go: the map, the pins, the
      // latest releases and posts, and whatever this page can do.
      if (key === "projects")
        return projects.filter(
          (item) => projectsById.get(item.id.slice(8))?.pinned,
        )
      if (key === "writing") return [...writing.slice(0, onPost ? 5 : 3), rss]
      if (key === "outline") return outlineItems.slice(0, 8)
      return pools[key]
    }

    return sectionOrder(projectSlug, onPost, trimmed.startsWith("#"))
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
    theme,
    split,
    section,
    projectSlug,
    onPost,
    filter,
    visitBaseline,
    outline,
    mod,
  ])

  const flat = sections.flatMap((section) => section.items)
  const active = flat.find((item) => item.id === activeId) ?? flat[0]

  const indexPending = !index && !failed
  const docsPending = docsWanted && docs?.key !== docsKey
  const showIndexSkeleton = useDelayed(indexPending ? "index" : null, 150)
  const showDocsSkeleton = useDelayed(docsPending ? docsKey : null, 150)
  const skeletonFor = (key: SectionKey) =>
    key === "docs"
      ? showDocsSkeleton
      : (key === "projects" || key === "writing") && showIndexSkeleton

  // cmdk scrolls on its own arrow moves; a Tab jump is ours, so is its scroll.
  useEffect(() => {
    listRef.current
      ?.querySelector('[cmdk-item][data-selected="true"]')
      ?.scrollIntoView({ block: "nearest" })
  }, [active])

  // cmdk's onSelect carries no event, so ⌘/Ctrl is read off the key or
  // pointer that led to it: held, a link opens in a new tab.
  const newTab = useRef(false)

  const go = (
    target: { href: string; external?: boolean; hard?: boolean },
    inNewTab: boolean,
  ) => {
    if (target.external || inNewTab)
      window.open(target.href, "_blank", "noopener,noreferrer")
    else if (target.hard) window.location.assign(target.href)
    else router.push(target.href)
    onClose()
  }

  // ⌘↵ on a project or a post skips its detail and opens it in a new tab.
  const activate = (item: Item) => {
    if (item.run) return item.run()
    if (item.detail && !newTab.current) {
      setDetail(item.detail)
      setView("detail")
      setAnnounce(
        item.detail.kind === "project"
          ? item.detail.project.name
          : item.detail.post.title,
      )
      return
    }
    if (item.href) go({ ...item, href: item.href }, newTab.current)
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
    } else if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "c"
    ) {
      // ⌘⇧C: this page as a Markdown link, wherever the selection is.
      if (event.shiftKey) {
        event.preventDefault()
        copy(pageLink().markdown, "action:copy-markdown")
        return
      }
      // ⌘C: the selected row's link, unless text in the box is selected.
      const input = inputRef.current
      const selecting = input && input.selectionStart !== input.selectionEnd
      if (!selecting && active?.copyText) {
        event.preventDefault()
        copy(active.copyText, active.id)
      }
    } else if (event.key === "Backspace" && !query && filter) {
      event.preventDefault()
      clearFilter()
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

  const placeholder = filter
    ? `Search ${filter.name}…`
    : currentProject
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
      aria-label={
        view === "message"
          ? "Send me a message"
          : view === "detail"
            ? "Details"
            : view === "keys"
              ? "Keyboard shortcuts"
              : "Search kud.io"
      }
      onCancel={(event) => {
        event.preventDefault()
        if (view !== "list") backToList()
        else onClose()
      }}
      onClick={(event) => {
        // A stray click outside must not throw away a half-written message.
        const writing = view === "message" && (draft.subject || draft.body)
        if (event.target === event.currentTarget && !writing) onClose()
      }}
    >
      {/* cmdk drives the list: arrows, Enter, pointer selection and the
          combobox/listbox wiring. Ranking stays ours (shouldFilter off),
          because the order follows the page, not only the match. */}
      <Command
        className={styles.panel}
        hidden={view !== "list"}
        label="Search kud.io"
        shouldFilter={false}
        loop
        value={active?.id ?? ""}
        onValueChange={setActiveId}
        onKeyDown={onKeyDown}
      >
        <div className={styles.bar}>
          <Search className={styles.barIcon} aria-hidden />
          {filter ? (
            <button
              type="button"
              className={`${styles.chip} ${styles.filterChip}`}
              aria-label={`Remove filter: ${filter.name}`}
              title={`${filter.name}. Remove the filter`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={clearFilter}
            >
              {filter.token}
              <span aria-hidden className={styles.chipSwap}>
                ×
              </span>
            </button>
          ) : null}
          <Command.Input
            ref={inputRef}
            className={styles.input}
            placeholder={placeholder}
            value={query}
            onValueChange={(value) => {
              setActiveId(null)
              setCopiedId(null)
              // ? on an empty box is a question about the keys, not a search.
              if (value === "?" && !query) return openKeys()
              const matched = matchFilter(value)
              if (matched) {
                applyFilter(matched.next)
                setQuery(matched.rest)
                return
              }
              setQuery(value)
            }}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          {currentProject?.hasDocs && !filter ? (
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
          aria-busy={indexPending || docsPending}
          onPointerDown={(event) => {
            newTab.current = event.metaKey || event.ctrlKey
          }}
        >
          {sectionOrder(projectSlug, onPost, trimmed.startsWith("#")).map(
            (key) => {
              const section = sections.find((each) => each.key === key)
              if (!section)
                return skeletonFor(key) ? (
                  <SkeletonGroup key={key} section={key} />
                ) : null
              return (
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
                      {section.key === "projects" && filter ? (
                        <span className={styles.headingNote}>
                          {" "}
                          · {filter.name}
                        </span>
                      ) : null}
                    </>
                  }
                >
                  {section.items.map((item) => {
                    const copied = copiedId === item.id
                    return (
                      <Command.Item
                        key={item.id}
                        value={item.id}
                        aria-label={item.label}
                        className={styles.option}
                        onSelect={() => activate(item)}
                      >
                        <VisualMark visual={item.visual} />
                        <span className={styles.text}>
                          <span className={styles.title}>{item.title}</span>
                          {item.fresh ? (
                            <span className={styles.newDot} aria-hidden />
                          ) : null}
                          {copied && item.copyText ? (
                            <span className={styles.meta}>Copied</span>
                          ) : item.keys && !copied ? (
                            <span className={styles.metaKeys}>
                              {item.keys.map((key) => (
                                <kbd key={key}>{key}</kbd>
                              ))}
                            </span>
                          ) : item.meta || copied ? (
                            <span className={styles.meta}>
                              {copied ? "Copied" : item.meta}
                            </span>
                          ) : null}
                        </span>
                        {item.external ? (
                          <ArrowUpRight className={styles.trail} aria-hidden />
                        ) : null}
                      </Command.Item>
                    )
                  })}
                </Command.Group>
              )
            },
          )}
          {trimmed && flat.length === 0 && index && !docsPending ? (
            <Command.Empty className={styles.empty}>
              {filter
                ? `Nothing in ${filter.name} matches “${trimmed}”. Backspace on an empty box removes the filter.`
                : `Nothing matches “${trimmed}”. Try a project, a post title, or a word from the docs.`}
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
            <kbd>↵</kbd> {active?.detail ? "details" : "open"}
          </span>
          {active?.copyText ? (
            <span>
              <kbd>{mod}</kbd>
              <kbd>C</kbd> copy
            </span>
          ) : null}
          <span>
            <kbd>?</kbd> keys
          </span>
          <span className={styles.footStatus}>{status}</span>
        </div>
      </Command>
      {view === "keys" ? <ShortcutsSheet onBack={backToList} /> : null}
      {view === "detail" && detail ? (
        <DetailView
          key={
            detail.kind === "project" ? detail.project.slug : detail.post.href
          }
          detail={detail}
          onBack={backToList}
          onOpen={go}
          copy={copy}
          copied={copiedId}
        />
      ) : null}
      {view === "message" ? (
        <MessageForm
          draft={draft}
          onDraft={setDraft}
          onBack={backToList}
          onCopy={() => copy(CONTACT_ADDRESS, "message:address")}
          copied={copiedId === "message:address"}
          announce={setAnnounce}
        />
      ) : null}
      <div role="status" aria-live="polite" className={styles.visuallyHidden}>
        {announce || status}
      </div>
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
