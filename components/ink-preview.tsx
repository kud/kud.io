"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { readStoredTheme, useScopedTheme } from "@/components/scoped-theme"
import styles from "./ink-preview.module.css"

// Preview-only: the three takes on the Ink theme, side by side on the real
// pages. Opened by ?ink=<take> in the URL, remembered across pages until
// closed. Picking a take turns the Ink theme on. Remove this file, its CSS,
// its mount in app/layout.tsx and the non-chosen takes in app/ink.css once a
// take is picked.

const KEY = "kud.ink-preview"

const ROWS = [
  {
    param: "ink",
    label: "Take",
    values: ["fountain", "sumi", "negative"],
    recommended: "fountain",
  },
  {
    param: "hand",
    label: "Hand",
    values: ["wobbly", "straight"],
    recommended: "wobbly",
  },
] as const

type Param = (typeof ROWS)[number]["param"]
type Choice = Record<Param, string>

const DEFAULTS: Choice = { ink: "fountain", hand: "wobbly" }

// Runs before first paint, ahead of every scope's own script: a take in the
// URL is stored and stamps <html>, and turns the Ink theme on so the scopes
// paint it straight away rather than after hydration.
const PREVIEW_SCRIPT = `try{var q=new URLSearchParams(location.search),s=JSON.parse(localStorage.getItem(${JSON.stringify(
  KEY,
)})||"null");if(q.has("ink")){s={ink:q.get("ink"),hand:q.get("hand")||(s&&s.hand)||"wobbly"};localStorage.setItem(${JSON.stringify(
  KEY,
)},JSON.stringify(s));localStorage.setItem("kud.theme","ink")}if(s){document.documentElement.dataset.inkTake=s.ink;document.documentElement.dataset.inkHand=s.hand}}catch(e){}`

const readChoice = (): Choice | null => {
  try {
    const stored = window.localStorage.getItem(KEY)
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
    html.dataset.inkTake = choice.ink
    html.dataset.inkHand = choice.hand
  } else {
    delete html.dataset.inkTake
    delete html.dataset.inkHand
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
      window.localStorage.setItem(KEY, JSON.stringify(choice))
    } catch {}
    window.history.replaceState(null, "", pageUrl(choice))
  }, [raw])

  if (!choice) return null

  const pick = (param: Param, value: string, origin: Element) => {
    setChoice({ ...choice, [param]: value })
    if (readStoredTheme() !== "ink") setTheme("ink", origin)
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
      window.localStorage.removeItem(KEY)
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
