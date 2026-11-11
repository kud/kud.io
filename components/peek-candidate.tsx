"use client"

import { useState, useSyncExternalStore } from "react"
import styles from "./peek-candidate.module.css"

// Preview only: what a click on a /projects card does.
//   ?peek=  1 today, straight to the page; 2 a side sheet over the grid (the
//           default); 3 a centred dialog, like the Bluesky posts window
// The pick is kept per tab in sessionStorage and stamped on <html> as
// data-peek-candidate before paint, so it survives navigation. The layout
// mounts this only when VERCEL_ENV isn't "production". On a phone every
// candidate goes straight to the page, and the banner says so.
const KEY = "kud.peekCandidate"
const FALLBACK = "2"
const OPTIONS = [
  { value: "1", label: "today" },
  { value: "2", label: "side sheet" },
  { value: "3", label: "centred dialog" },
]

// The peek is desktop only: below this width a card opens the page.
export const PEEK_MEDIA = "(min-width: 900px)"

const SCRIPT = `try{var q=new URLSearchParams(location.search),v=q.get("peek"),k=${JSON.stringify(
  KEY,
)};if(v!==null){if(/^[123]$/.test(v))sessionStorage.setItem(k,v);else sessionStorage.removeItem(k)}v=sessionStorage.getItem(k);if(v&&/^[123]$/.test(v))document.documentElement.dataset.peekCandidate=v}catch(e){}`

export const PeekCandidateScript = () => (
  <script
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: SCRIPT }}
  />
)

const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  const media = window.matchMedia(PEEK_MEDIA)
  media.addEventListener("change", listener)
  return () => {
    listeners.delete(listener)
    media.removeEventListener("change", listener)
  }
}

export type PeekCandidate = "1" | "2" | "3"
const read = () =>
  (document.documentElement.dataset.peekCandidate ?? FALLBACK) as PeekCandidate

const choose = (value: string) => {
  try {
    sessionStorage.setItem(KEY, value)
  } catch {
    // Blocked storage: the switch still applies to this page view.
  }
  document.documentElement.dataset.peekCandidate = value
  listeners.forEach((listener) => listener())
}

// Read at click time by the peek itself, so it never needs a re-render.
export const currentPeek = (): "2" | "3" | null => {
  const pick = read()
  return window.matchMedia(PEEK_MEDIA).matches && pick !== "1" ? pick : null
}

const snapshot = () =>
  `${read()}|${window.matchMedia(PEEK_MEDIA).matches ? "wide" : "narrow"}`

export const PeekBanner = () => {
  const joined = useSyncExternalStore(subscribe, snapshot, () => "")
  const [copied, setCopied] = useState(false)
  if (!joined) return null
  const [pick, width] = joined.split("|")
  const narrow = width === "narrow"
  const label = OPTIONS.find((option) => option.value === pick)?.label

  const copyPick = async () => {
    const url = new URL(location.href)
    url.searchParams.delete("_vercel_share")
    url.searchParams.set("peek", pick)
    try {
      await navigator.clipboard.writeText(`kud.io peek: ${pick} · ${url}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard refused (insecure context or denied): nothing to show.
    }
  }

  return (
    <aside className={styles.banner} aria-label="Preview candidates">
      <div className={styles.row}>
        <span className={styles.title} id="candidate-peek">
          Peek
        </span>
        <div
          className={styles.options}
          role="group"
          aria-labelledby="candidate-peek"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === pick}
              title={option.label}
              onClick={() => choose(option.value)}
            >
              {option.value}
            </button>
          ))}
        </div>
        <span className={styles.label}>{label}</span>
      </div>
      {narrow && pick !== "1" ? (
        <p className={styles.note}>Phone: cards open the page</p>
      ) : null}
      <button
        type="button"
        className={styles.copy}
        onClick={copyPick}
        aria-live="polite"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </aside>
  )
}
