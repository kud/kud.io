"use client"

import { useState, useSyncExternalStore } from "react"
import { INK_CANDIDATE_KEY } from "@/components/ink-candidate"
import { InkLink } from "@/components/ink-link"
import styles from "./candidate-banner.module.css"

// Preview only: a floating switcher for the numbered candidates in
// app/docs-motion.css, so they compare in one tab. It renders nothing
// unless the page was opened with a candidate (components/ink-candidate.tsx
// has stamped one on <html>), so production never shows it. Every switch is
// live; the jump links carry the choice to the other pages it touches.
type Row = {
  name: "docs"
  title: string
  options: { value: string; label: string }[]
}

const ROWS: Row[] = [
  {
    name: "docs",
    title: "Docs move",
    options: [
      { value: "1", label: "cut (today)" },
      { value: "2", label: "rise" },
      { value: "3", label: "slide" },
    ],
  },
]

const JUMPS = [
  { href: "/projects/sonarqube-cli/docs", label: "Intro" },
  { href: "/projects/sonarqube-cli/docs/quality-gate", label: "Gate" },
  { href: "/projects/sonarqube-cli/docs/commands", label: "Commands" },
  { href: "/projects/sonarqube-cli", label: "Project" },
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
  if (!Object.keys(data).some((key) => key.endsWith("Candidate"))) return ""
  return ROWS.map((row) => data[`${row.name}Candidate`] ?? "1").join(",")
}
const serverSnapshot = () => ""

const choose = (name: Row["name"], value: string) => {
  try {
    sessionStorage.setItem(`${INK_CANDIDATE_KEY}.${name}`, value)
  } catch {
    // Blocked storage: the switch still applies to this page view.
  }
  document.documentElement.setAttribute(`data-${name}-candidate`, value)
  listeners.forEach((listener) => listener())
}

export const CandidateBanner = () => {
  const snap = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const [copied, setCopied] = useState(false)
  if (!snap) return null
  const values = snap.split(",")
  const state = Object.fromEntries(
    ROWS.map((row, index) => [row.name, values[index]]),
  ) as Record<Row["name"], string>

  // One pasteable line: every row, its number and name, and the page it was
  // judged on (without the share token), so the pick comes back as text.
  const copyPicks = async () => {
    const url = new URL(location.href)
    url.searchParams.delete("_vercel_share")
    // The address bar keeps whatever the tab was opened with; the picks made
    // since live only in the banner, so the copied URL is rebuilt from them.
    ROWS.forEach((row) => url.searchParams.set(row.name, state[row.name]))
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
            <span className={styles.title} id={`cand-${row.name}`}>
              {row.title}
            </span>
            <div
              className={styles.options}
              role="group"
              aria-labelledby={`cand-${row.name}`}
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
