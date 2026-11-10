"use client"

import { useState, useSyncExternalStore } from "react"
import { POLISH_CANDIDATE_KEY } from "@/components/polish-candidate"
import { InkLink } from "@/components/ink-link"
import styles from "./polish-banner.module.css"

// Preview only: a floating switcher for the numbered candidates stamped by
// components/polish-candidate.tsx, so they compare in one tab. It renders
// nothing unless the page was opened with a candidate, so production never
// shows it.
type Name = "tiles" | "avatar" | "filters" | "layout"
type Row = {
  name: Name
  title: string
  options: { value: string; label: string }[]
}

const ROWS: Row[] = [
  {
    name: "tiles",
    title: "Tiles",
    options: [
      { value: "1", label: "now, glass" },
      { value: "2", label: "flat" },
      { value: "3", label: "flat, grounded" },
    ],
  },
  {
    name: "avatar",
    title: "Avatar",
    options: [
      { value: "1", label: "now, still" },
      { value: "2", label: "turns to marble" },
      { value: "3", label: "nods" },
    ],
  },
  {
    name: "filters",
    title: "Filters",
    options: [
      { value: "1", label: "now" },
      { value: "2", label: "quiet chips" },
      { value: "3", label: "index list" },
    ],
  },
  {
    name: "layout",
    title: "Layout",
    options: [
      { value: "1", label: "now, centred" },
      { value: "2", label: "wider" },
      { value: "3", label: "wider, 3 across" },
    ],
  },
]

const JUMPS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "/projects" },
]

const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// A string snapshot, so React compares by value: "" means no candidate is on.
const snapshot = (): string => {
  const data = document.documentElement.dataset
  if (!ROWS.some((row) => data[`${row.name}Candidate`])) return ""
  return ROWS.map((row) => data[`${row.name}Candidate`] ?? "1").join(",")
}
const serverSnapshot = () => ""

const choose = (name: Name, value: string) => {
  try {
    sessionStorage.setItem(`${POLISH_CANDIDATE_KEY}.${name}`, value)
  } catch {
    // Blocked storage: the switch still applies to this page view.
  }
  document.documentElement.setAttribute(`data-${name}-candidate`, value)
  listeners.forEach((listener) => listener())
}

export const PolishBanner = () => {
  const snap = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const [copied, setCopied] = useState(false)
  if (!snap) return null
  const values = snap.split(",")
  const state = Object.fromEntries(
    ROWS.map((row, index) => [row.name, values[index]]),
  ) as Record<Name, string>

  // One pasteable line: every row, its number and name, and the page it was
  // judged on (without the share token), so the pick comes back as text.
  const copyPicks = async () => {
    const url = new URL(location.href)
    url.searchParams.delete("_vercel_share")
    const picks = ROWS.map((row) => {
      const option = row.options.find((o) => o.value === state[row.name])
      return `${row.title} ${state[row.name]} (${option?.label ?? "?"})`
    }).join(" · ")
    try {
      await navigator.clipboard.writeText(`${picks} — ${url}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard refused (insecure context or denied): nothing to show.
    }
  }

  return (
    <aside className={styles.banner} aria-label="Preview candidates">
      {ROWS.map((row) => {
        const active = row.options.find((o) => o.value === state[row.name])
        return (
          <div key={row.name} className={styles.row}>
            <span className={styles.title} id={`polish-${row.name}`}>
              {row.title}
            </span>
            <div
              className={styles.options}
              role="group"
              aria-labelledby={`polish-${row.name}`}
            >
              {row.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={option.value === state[row.name]}
                  title={option.label}
                  onClick={() => choose(row.name, option.value)}
                >
                  {option.value}
                </button>
              ))}
            </div>
            <span className={styles.label}>
              {active ? `${active.value} · ${active.label}` : ""}
            </span>
          </div>
        )
      })}
      <nav className={styles.jumps} aria-label="Jump to">
        {JUMPS.map((jump) => (
          <InkLink key={jump.href} href={jump.href} className={styles.play}>
            {jump.label}
          </InkLink>
        ))}
        <button
          type="button"
          className={styles.copy}
          onClick={copyPicks}
          aria-live="polite"
        >
          {copied ? "Copied ✓" : "Copy picks"}
        </button>
      </nav>
    </aside>
  )
}
