"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { readStoredTheme, useScopedTheme } from "@/components/scoped-theme"
import styles from "./ink-preview.module.css"

// Preview-only: the open questions on the Ink (e-ink) theme, tried on the real
// pages, plus how any theme switch merges. Opened by any of ?paper= ?image=
// ?motion= ?merge= in the URL, remembered for the tab (sessionStorage) until
// closed. Picking an Ink row turns the Ink theme on. Remove this file, its
// CSS, its mount in app/layout.tsx, the non-chosen options in app/ink.css and
// the non-chosen merges in app/global.css once the picks are settled.

const KEY = "kud.ink-preview"

const ROWS = [
  {
    param: "paper",
    label: "Paper",
    values: ["white", "pearl"],
    recommended: "white",
  },
  {
    param: "image",
    label: "Images",
    values: ["grey", "crush", "dither"],
    recommended: "crush",
  },
  {
    param: "motion",
    label: "Motion",
    values: ["flash", "cut"],
    recommended: "flash",
  },
  {
    // How every theme switch blends, not only Ink's (components/theme-merge.ts).
    param: "merge",
    label: "Theme switch",
    values: ["fade", "radial", "blur"],
    recommended: "fade",
  },
] as const

type Param = (typeof ROWS)[number]["param"]
type Choice = Record<Param, string>

const DEFAULTS: Choice = {
  paper: "white",
  image: "crush",
  motion: "flash",
  merge: "fade",
}

// Runs before first paint, ahead of every scope's own script: picks in the
// URL are stored and stamp <html>, and turns the Ink theme on so the scopes
// paint it straight away rather than after hydration.
// Each param falls back to the stored pick, then the default, so a link with
// one param keeps the rest of the session's picks.
const PREVIEW_SCRIPT = `try{var q=new URLSearchParams(location.search),k=${JSON.stringify(
  KEY,
)},d=${JSON.stringify(DEFAULTS)},s=JSON.parse(sessionStorage.getItem(k)||"null");if(q.has("paper")||q.has("image")||q.has("motion")||q.has("merge")){var b=s||d;s={paper:q.get("paper")||b.paper,image:q.get("image")||b.image,motion:q.get("motion")||b.motion,merge:q.get("merge")||b.merge||d.merge};sessionStorage.setItem(k,JSON.stringify(s));localStorage.setItem("kud.theme","ink")}if(s){var h=document.documentElement.dataset;h.inkPaper=s.paper;h.inkImage=s.image;h.inkMotion=s.motion;h.themeMerge=s.merge||d.merge}}catch(e){}`

const readChoice = (): Choice | null => {
  try {
    const stored = window.sessionStorage.getItem(KEY)
    if (!stored) return null
    const parsed = { ...DEFAULTS, ...JSON.parse(stored) } as Choice
    for (const { param, values } of ROWS)
      if (!(values as readonly string[]).includes(parsed[param]))
        parsed[param] = DEFAULTS[param]
    return parsed
  } catch {
    return null
  }
}

const stamp = (choice: Choice | null) => {
  const html = document.documentElement
  if (choice) {
    html.dataset.inkPaper = choice.paper
    html.dataset.inkImage = choice.image
    html.dataset.inkMotion = choice.motion
    html.dataset.themeMerge = choice.merge
  } else {
    delete html.dataset.inkPaper
    delete html.dataset.inkImage
    delete html.dataset.inkMotion
    delete html.dataset.themeMerge
  }
}

const pageUrl = (choice: Choice | null) => {
  const url = new URL(window.location.href)
  url.searchParams.delete("_vercel_share")
  for (const { param } of ROWS)
    if (choice) url.searchParams.set(param, choice[param])
    else url.searchParams.delete(param)
  return url
}

export const InkPreviewScript = () => (
  <script
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: PREVIEW_SCRIPT }}
  />
)

// The choice lives outside React, read once from storage on the client; the
// server snapshot is "no preview", so the banner mounts after hydration.
let snapshot: string | undefined
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
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
  listeners.forEach((listener) => listener())
}

export const InkPreview = () => {
  const { setTheme } = useScopedTheme()
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "")
  const choice: Choice | null = raw ? JSON.parse(raw) : null
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!raw) return
    const choice: Choice = JSON.parse(raw)
    stamp(choice)
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(choice))
    } catch {}
    window.history.replaceState(null, "", pageUrl(choice))
  }, [raw])

  if (!choice) return null

  const pick = (param: Param, value: string, origin: Element) => {
    setChoice({ ...choice, [param]: value })
    // The switch row is tried with the theme picker, so it leaves the theme be.
    if (param !== "merge" && readStoredTheme() !== "ink")
      setTheme("ink", origin)
  }

  const copy = async () => {
    const line = `${ROWS.map(
      ({ param, label }) => `${label} ${choice[param]}`,
    ).join(" · ")} — ${pageUrl(choice)}`
    try {
      await navigator.clipboard.writeText(line)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  const leave = () => {
    try {
      window.sessionStorage.removeItem(KEY)
    } catch {}
    stamp(null)
    window.history.replaceState(null, "", pageUrl(null))
    setTheme("system")
    setChoice(null)
  }

  return (
    <div className={styles.banner} role="region" aria-label="Ink preview">
      <span className={styles.badge}>Ink</span>
      {ROWS.map(({ param, label, values, recommended }) => (
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
              onClick={(event) => pick(param, value, event.currentTarget)}
            >
              {value}
              {value === recommended && (
                <span className={styles.recommended} aria-label="recommended">
                  ★
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
      <button type="button" className={styles.copy} onClick={copy}>
        {copied ? "Copied" : "Copy picks"}
      </button>
      <button
        type="button"
        className={styles.close}
        onClick={leave}
        aria-label="Leave the preview"
      >
        ×
      </button>
    </div>
  )
}
