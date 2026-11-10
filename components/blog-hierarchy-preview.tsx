"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { BLOG_ROOT_ID } from "@/components/scoped-theme"
import styles from "./blog-hierarchy-preview.module.css"

// Preview-only switchboard for the post hierarchy candidates. Nothing renders
// and nothing is stamped unless ?h=, ?s= or ?toc= is in the URL, or a choice
// from an earlier visit is stored; a reader on the real site sees today's post.
// The choice is stamped on #blog-root as data-h / data-s / data-toc, which the
// post's own CSS keys its variants on.

const KEY = "kud.blog-hierarchy-preview"

const ROWS = [
  { param: "h", label: "Headings", values: ["0", "1", "2", "3"] },
  { param: "s", label: "Spacing", values: ["0", "1", "2"] },
  { param: "toc", label: "Contents", values: ["off", "right", "left"] },
  { param: "more", label: "More", values: ["0", "thumbs", "cards"] },
  { param: "picks", label: "Picks", values: ["0", "mixed"] },
  {
    param: "n",
    label: "Numeral",
    values: ["above", "gutter", "inline", "rule", "gutter-rule"],
  },
] as const

type Param = (typeof ROWS)[number]["param"]
type Choice = Record<Param, string>

const DEFAULTS: Choice = {
  h: "0",
  s: "0",
  toc: "off",
  more: "0",
  picks: "0",
  n: "above",
}

// Erwann's picks from the first round (2026-11-10). Locked rows are forced over
// the URL and any stored choice, and drop off the banner, so only the open
// question is left to switch.
const LOCKED: Partial<Choice> = {
  h: "3",
  s: "1",
  toc: "right",
  more: "cards",
  picks: "mixed",
}

const readChoice = (): Choice | null => {
  const query = new URLSearchParams(window.location.search)
  if (ROWS.some(({ param }) => query.has(param))) {
    const choice = { ...DEFAULTS }
    for (const { param, values } of ROWS) {
      const value = query.get(param)
      if (value && (values as readonly string[]).includes(value))
        choice[param] = value
    }
    return { ...choice, ...LOCKED }
  }
  try {
    const stored = window.localStorage.getItem(KEY)
    return stored ? { ...DEFAULTS, ...JSON.parse(stored), ...LOCKED } : null
  } catch {
    return null
  }
}

type Heading = { id: string; text: string }

const Contents = ({ side }: { side: "left" | "right" }) => {
  // Client-only: the rail renders after the preview store resolves, never on
  // the server, so the rendered headings can be read straight from the page.
  const [headings] = useState<Heading[]>(() =>
    Array.from(
      document.querySelectorAll<HTMLHeadingElement>("article h2[id]"),
    ).map((node) => ({ id: node.id, text: node.textContent ?? "" })),
  )
  const [active, setActive] = useState<string | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("article h2[id]"),
    )

    // The current section is the last heading above the top third of the
    // viewport: reading position, not whichever heading happens to be visible.
    const update = () => {
      const line = window.innerHeight * 0.33
      let current: string | null = null
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= line) current = node.id
      }
      setActive(current)

      // Appears once the title has scrolled away, so it never sits beside the
      // cover, and steps aside while a full-width figure passes under it.
      const title = document.querySelector("article h1")
      const pastTitle = title ? title.getBoundingClientRect().bottom < 0 : true
      // Any figure wider than the 790px shell is a breakout (an image stage,
      // a diagram, a long code card); a narrow card stays in the column.
      const wide = Array.from(
        document.querySelectorAll(
          'article [class*="imageStage"], article [class*="diagram"], article [class*="codeStage"] > *',
        ),
      ).some((el) => {
        const box = el.getBoundingClientRect()
        return box.width > 800 && box.top < 420 && box.bottom > 80
      })
      setShown(pastTitle && !wide)
    }

    const frame = requestAnimationFrame(update)
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  if (headings.length < 3) return null

  return (
    <nav
      className={styles.contents}
      data-side={side}
      data-shown={shown || undefined}
      aria-label="On this page"
    >
      <p className={styles.contentsLabel}>On this page</p>
      <ol>
        {headings.map(({ id, text }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

// A tiny external store, as scoped-theme does it: the server snapshot is
// "nothing chosen", the client's is read once from the URL or storage, and the
// snapshot is a string so it stays referentially stable between reads.
let snapshot: string | undefined
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => {
  if (snapshot === undefined) {
    const initial = readChoice()
    snapshot = initial ? JSON.stringify(initial) : ""
  }
  return snapshot
}

const setChoice = (next: Choice | null) => {
  snapshot = next ? JSON.stringify(next) : ""
  for (const listener of listeners) listener()
}

// The order the copied line reads in: the heading pair first, then the page
// from top to bottom. Locked rows are included, so the line is the whole
// decision, not just the open question.
const COPY_ORDER: Param[] = ["h", "n", "s", "toc", "more", "picks"]

export const BlogHierarchyPreview = () => {
  const [copied, setCopied] = useState(false)
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "")
  const choice: Choice | null = raw ? JSON.parse(raw) : null

  useEffect(() => {
    if (!raw) return
    const choice: Choice = JSON.parse(raw)
    const root = document.getElementById(BLOG_ROOT_ID)
    if (!root) return
    for (const { param } of ROWS) root.dataset[param] = choice[param]
    try {
      window.localStorage.setItem(KEY, JSON.stringify(choice))
    } catch {}
    const url = new URL(window.location.href)
    for (const { param } of ROWS) url.searchParams.set(param, choice[param])
    window.history.replaceState(null, "", url)
  }, [raw])

  if (!choice) return null

  // One pasteable line: every row and its choice, then the page URL without
  // the share token, so the pick comes back as text rather than a screenshot.
  const copy = async () => {
    if (!choice) return
    const url = new URL(window.location.href)
    url.searchParams.delete("_vercel_share")
    const line = `${COPY_ORDER.map((param) => {
      const row = ROWS.find((entry) => entry.param === param)
      return `${row?.label} ${choice[param] === "0" ? "now" : choice[param]}`
    }).join(" · ")} — ${url}`
    try {
      await navigator.clipboard.writeText(line)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  const leave = () => {
    const root = document.getElementById(BLOG_ROOT_ID)
    if (root) for (const { param } of ROWS) delete root.dataset[param]
    try {
      window.localStorage.removeItem(KEY)
    } catch {}
    const url = new URL(window.location.href)
    for (const { param } of ROWS) url.searchParams.delete(param)
    window.history.replaceState(null, "", url)
    setChoice(null)
  }

  return (
    <>
      {choice.toc !== "off" && (
        <Contents side={choice.toc as "left" | "right"} />
      )}
      <div className={styles.banner} role="region" aria-label="Preview options">
        <span className={styles.badge}>Preview</span>
        {ROWS.filter(({ param }) => !(param in LOCKED)).map(
          ({ param, label, values }) => (
            <div
              key={param}
              className={styles.row}
              role="radiogroup"
              aria-label={label}
            >
              <span className={styles.rowLabel}>{label}</span>
              {values.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={choice[param] === value}
                  onClick={() => setChoice({ ...choice, [param]: value })}
                >
                  {value === "0" ? "now" : value}
                </button>
              ))}
            </div>
          ),
        )}
        <button
          type="button"
          className={styles.copy}
          onClick={copy}
          aria-live="polite"
          title="Copy these picks as one line"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          className={styles.close}
          onClick={leave}
          aria-label="Leave preview"
          title="Leave preview"
        >
          ×
        </button>
      </div>
    </>
  )
}
