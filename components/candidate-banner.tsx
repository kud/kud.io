"use client"

import { useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import { INK_CANDIDATE_KEY } from "@/components/ink-candidate"
import { InkLink } from "@/components/ink-link"
import styles from "./candidate-banner.module.css"

// Preview only: a floating switcher for the numbered candidates in
// app/ink-candidates.css, so they compare in one tab. It renders nothing
// unless the page was opened with a candidate (components/ink-candidate.tsx
// has stamped one on <html>), so production never shows it. Every switch is
// live. The ink row is the page-transition ink: "Play" moves between two pages
// so the transition shows without hunting for a link.
type Row = {
  name: "ink" | "code" | "box" | "btn"
  title: string
  options: { value: string; label: string }[]
}

const ROWS: Row[] = [
  {
    name: "ink",
    title: "Ink",
    options: [
      { value: "1", label: "today" },
      { value: "2", label: "dark everywhere" },
      { value: "3", label: "white by day" },
      { value: "4", label: "contrast" },
    ],
  },
  {
    name: "code",
    title: "Code",
    options: [
      { value: "1", label: "today" },
      { value: "2", label: "November" },
      { value: "3", label: "November on plum" },
    ],
  },
  {
    name: "box",
    title: "Box",
    options: [
      { value: "0", label: "today" },
      { value: "1", label: "flat head" },
      { value: "2", label: "flat and quiet" },
    ],
  },
  {
    name: "btn",
    title: "Buttons",
    options: [
      { value: "0", label: "text only" },
      { value: "1", label: "icon first" },
    ],
  },
]

const DEFAULTS: Record<Row["name"], string> = {
  ink: "1",
  code: "1",
  box: "0",
  btn: "0",
}

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
  return [
    data.inkCandidate ?? DEFAULTS.ink,
    data.codeCandidate ?? DEFAULTS.code,
    data.boxCandidate ?? DEFAULTS.box,
    data.btnCandidate ?? DEFAULTS.btn,
  ].join(",")
}
const serverSnapshot = () => ""

const choose = (name: Row["name"], value: string) => {
  const root = document.documentElement
  try {
    const key = `${INK_CANDIDATE_KEY}.${name}`
    if (value === "0") sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, value)
  } catch {
    // Blocked storage: the switch still applies to this page view.
  }
  if (value === "0") root.removeAttribute(`data-${name}-candidate`)
  else root.setAttribute(`data-${name}-candidate`, value)
  listeners.forEach((listener) => listener())
}

// Two pages to bounce between, so Play always has somewhere to go.
const PLAY_A = "/projects/sonarqube-cli"
const PLAY_B = "/projects"

export const CandidateBanner = () => {
  const pathname = usePathname()
  const snap = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  if (!snap) return null
  const [ink, code, box, btn] = snap.split(",")
  const state: Record<Row["name"], string> = { ink, code, box, btn }

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
                  {row.name === "btn"
                    ? option.value === "1"
                      ? "on"
                      : "off"
                    : option.value}
                </button>
              ))}
            </div>
            <span className={styles.label}>
              {active ? `${active.value} · ${active.label}` : ""}
            </span>
            {row.name === "ink" ? (
              <InkLink
                href={pathname === PLAY_A ? PLAY_B : PLAY_A}
                className={styles.play}
              >
                Play ▸
              </InkLink>
            ) : null}
          </div>
        )
      })}
    </aside>
  )
}
