"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import styles from "./blog-morph-preview.module.css"

// Preview-only switchboard for the index → post glide candidates. Nothing
// renders unless ?glide= is in the URL or a choice from an earlier visit is
// stored; a reader on the real site gets the default. The choice lives in
// localStorage because the glide happens on a click, after the URL has
// changed: PostMorphLink reads it at that moment (readGlide below).

const KEY = "kud.blog-morph-preview"
const SLOW_KEY = "kud.blog-morph-preview-slow"

// now: today's plain cross-fade (anim-0). 1: cover and title glide, the
// default. 2: the cover alone. 3: cover and title, the title as the post's
// own heading only.
const VALUES = ["now", "1", "2", "3"] as const
type Glide = (typeof VALUES)[number]

const isGlide = (value: string | null): value is Glide =>
  (VALUES as readonly string[]).includes(value ?? "")

const readStored = (): Glide | null => {
  const query = new URLSearchParams(window.location.search).get("glide")
  if (isGlide(query)) return query
  try {
    const stored = window.localStorage.getItem(KEY)
    return isGlide(stored) ? stored : null
  } catch {
    return null
  }
}

// What the click does, in the html[data-blog-morph] vocabulary global.css
// keys on: "none" (no glide), undefined (anim-1), "cover", "solo".
export const readGlide = (): "none" | "cover" | "solo" | undefined => {
  const glide = typeof window === "undefined" ? null : readStored()
  if (glide === "now") return "none"
  if (glide === "2") return "cover"
  if (glide === "3") return "solo"
  return undefined
}

let snapshot: string | undefined
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => {
  if (snapshot === undefined) snapshot = readStored() ?? ""
  return snapshot
}

const setGlide = (next: Glide | "") => {
  snapshot = next
  for (const listener of listeners) listener()
}

export const BlogMorphPreview = () => {
  const [copied, setCopied] = useState(false)
  const glide = useSyncExternalStore(subscribe, getSnapshot, () => "")
  // Slow motion: every view-transition duration times five (global.css,
  // html[data-blog-slow]), so a 0.34s glide can be watched. Read once on the
  // client; the banner renders nothing on the server, so nothing mismatches.
  const [slow, setSlow] = useState(() => {
    if (typeof window === "undefined") return false
    if (new URLSearchParams(window.location.search).get("slow") === "5")
      return true
    try {
      return window.localStorage.getItem(SLOW_KEY) === "5"
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (glide && slow) root.dataset.blogSlow = "5"
    else delete root.dataset.blogSlow
    try {
      if (glide && slow) window.localStorage.setItem(SLOW_KEY, "5")
      else window.localStorage.removeItem(SLOW_KEY)
    } catch {}
    if (!glide) return
    const url = new URL(window.location.href)
    if (slow) url.searchParams.set("slow", "5")
    else url.searchParams.delete("slow")
    window.history.replaceState(window.history.state, "", url)
  }, [glide, slow])

  useEffect(() => {
    if (!glide) return
    try {
      window.localStorage.setItem(KEY, glide)
    } catch {}
    const url = new URL(window.location.href)
    url.searchParams.set("glide", glide)
    window.history.replaceState(window.history.state, "", url)
  }, [glide])

  if (!glide) return null

  const copy = async () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("_vercel_share")
    try {
      await navigator.clipboard.writeText(
        `Glide ${glide}${slow ? " · Slow ×5" : ""} — ${url}`,
      )
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  const leave = () => {
    try {
      window.localStorage.removeItem(KEY)
    } catch {}
    const url = new URL(window.location.href)
    url.searchParams.delete("glide")
    url.searchParams.delete("slow")
    setSlow(false)
    window.history.replaceState(window.history.state, "", url)
    setGlide("")
  }

  return (
    <div className={styles.banner} role="region" aria-label="Preview options">
      <span className={styles.badge}>Preview</span>
      <div className={styles.row} role="radiogroup" aria-label="Glide">
        <span className={styles.rowLabel}>Glide</span>
        {VALUES.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={glide === value}
            onClick={() => setGlide(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={slow}
        onClick={() => setSlow(!slow)}
        title="Play every transition five times slower"
      >
        slow ×5
      </button>
      <button
        type="button"
        className={styles.copy}
        onClick={copy}
        aria-live="polite"
        title="Copy this pick as one line"
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
  )
}
