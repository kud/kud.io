"use client"

import { useCallback, useEffect, useState } from "react"
import type { ReactNode } from "react"

// The blog owns its own theme, independent of the rest of the site.
//
// app/layout.tsx runs fumadocs' RootProvider with forcedTheme: "dark", which
// puts class="dark" on <html> unconditionally. That is /projects' axis and this
// is the blog's: two different selectors on two different elements, which never
// meet — PROVIDED no blog CSS ever keys on `.dark` or reads a --color-fd-*
// variable. Break that and the toggle silently stops working with nothing to
// point at. next-themes is not reused here because it targets
// document.documentElement exclusively; a second instance would contend with
// the first over <html> and over style.colorScheme.
export const BLOG_THEME_KEY = "kud.blog.theme"
export const BLOG_ROOT_ID = "blog-root"

export const BLOG_INK = "#0e1418"

/* The ground /blog will paint on arrival, but only when it's dark — the one
   case the ink reveal has something to cover. Returns null for a light
   destination and for anything we can't determine, both of which mean
   "navigate plainly" rather than "guess a colour".

   The three branches mirror the CSS above exactly: an explicit stamp wins in
   either direction, and everything else (including "system") falls to the same
   prefers-color-scheme query that #blog-root:not([data-theme="light"]) resolves
   with. Re-derive this from that block if the tokens ever move, and never from
   memory of what the blog looks like. */
export const blogInkCover = (): string | null => {
  try {
    const stored = localStorage.getItem(BLOG_THEME_KEY)
    if (stored === "light") return null
    if (stored === "dark") return BLOG_INK
    return matchMedia("(prefers-color-scheme: dark)").matches ? BLOG_INK : null
  } catch {
    return null
  }
}

export type BlogTheme = "light" | "dark" | "system"

const isTheme = (value: unknown): value is BlogTheme =>
  value === "light" || value === "dark" || value === "system"

// "system" is a real CSS state, not a JavaScript resolution: the blog's CSS
// resolves [data-theme="system"] with a prefers-color-scheme media query. So a
// first-time visitor needs no JavaScript at all — the server-rendered default is
// already correct — and the OS flipping mid-session needs no matchMedia
// listener. This script only has to replay an explicit stored choice, which is
// why it fits in two lines and can run before first paint.
export const BLOG_THEME_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(
  BLOG_THEME_KEY,
)});if(t==="light"||t==="dark")document.getElementById(${JSON.stringify(
  BLOG_ROOT_ID,
)}).dataset.theme=t}catch(e){}`

export const useBlogTheme = () => {
  const [theme, setThemeState] = useState<BlogTheme>("system")

  // The pre-paint script has already applied the stored value to the DOM; this
  // only syncs React's copy after mount, which is why the wrapper carries
  // suppressHydrationWarning.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BLOG_THEME_KEY)
      if (isTheme(stored)) setThemeState(stored)
    } catch {
      // Private browsing or blocked storage — "system" is a fine answer.
    }
  }, [])

  const setTheme = useCallback((next: BlogTheme) => {
    setThemeState(next)
    const root = document.getElementById(BLOG_ROOT_ID)
    if (root) root.dataset.theme = next
    try {
      localStorage.setItem(BLOG_THEME_KEY, next)
    } catch {
      // Preference simply won't persist; the session still themes correctly.
    }
  }, [])

  return { theme, setTheme }
}

// Three words, each with its own mark. Two icons cannot say three things, and
// no stock set has a third: the usual stand-in for "auto" is a desktop
// computer, which is an appliance rather than a member of this set, so Auto is
// authored here.
//
// "Auto" rather than "System": it is shorter, it is what the state actually
// does, and the stored value stays "system" so nothing downstream shifts.
//
// Sun and Moon are Heroicons 16/solid (tailwindlabs/heroicons, MIT), inlined
// verbatim rather than packaged: several hundred icons for two, in a repo that
// pins exact versions and has no icon library, and the third mark is not in it
// anyway. The 16px set specifically — 24/outline at 1.5 stroke renders an
// effective 0.81px stroke at 13px and greys out off-retina, and 24/solid
// carries detail drawn for 24px. The 16px set has already had its detail count
// reduced, which is the problem that would otherwise need solving by hand.
//
// Moon and Auto are the same circle, differently filled — a crescent of it and
// a half of it — which is what makes them read as a family. The radius is
// matched exactly (r=6.501, measured off the fetched moon's outer arc) and the
// centre deliberately is NOT: the moon's own outer circle sits at (8.5, 7.5),
// half a unit off-centre, which is 0.4px at 13px and below the threshold where
// it reads. Anyone re-deriving Auto will compute that offset and be tempted to
// apply it; don't. Match the radius, hold the centre.
//
// Every mark renders at 13px in currentColor, so it inherits the button's
// colour through hover and active with no CSS of its own — and it does NOT
// change on active. That button already carries a ground, an inset ring and a
// 600-weight word; a fourth signal would make the quietest control on the page
// start asserting. 13px rather than 12px is optical overshoot: the marks fill
// about 12 of 16 units, so 13px renders ~9.75px against a ~8.5px cap height,
// and a round form matched to the type size reads smaller than the flat-topped
// letters beside it. The three bounding boxes are deliberately unequal — the
// sun sits wider because its rays are part of its silhouette. Optically
// balanced, not mathematically.
const themeGlyph: Record<BlogTheme, ReactNode> = {
  light: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1ZM10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM12.95 4.11a.75.75 0 1 0-1.06-1.06l-1.062 1.06a.75.75 0 0 0 1.061 1.062l1.06-1.061ZM15 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 15 8ZM11.89 12.95a.75.75 0 0 0 1.06-1.06l-1.06-1.062a.75.75 0 0 0-1.062 1.061l1.061 1.06ZM8 12a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 12ZM5.172 11.89a.75.75 0 0 0-1.061-1.062L3.05 11.89a.75.75 0 1 0 1.06 1.06l1.06-1.06ZM4 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 4 8ZM4.11 5.172A.75.75 0 0 0 5.173 4.11L4.11 3.05a.75.75 0 1 0-1.06 1.06l1.06 1.06Z" />
    </svg>
  ),
  dark: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14.438 10.148c.19-.425-.321-.787-.748-.601A5.5 5.5 0 0 1 6.453 2.31c.186-.427-.176-.938-.6-.748a6.501 6.501 0 1 0 8.585 8.586Z" />
    </svg>
  ),
  system: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 1.499a6.501 6.501 0 0 0 0 13.002Z" />
    </svg>
  ),
}

const themeLabel: Record<BlogTheme, string> = {
  light: "Light",
  dark: "Dark",
  system: "Auto",
}

// Deliberately unstyled beyond the marks themselves: Iris owns how this looks
// and where it sits.
export const BlogThemeControl = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useBlogTheme()

  return (
    <div className={className} role="group" aria-label="Colour theme">
      {(["light", "dark", "system"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setTheme(option)}
          aria-pressed={theme === option}
          data-active={theme === option || undefined}
        >
          {themeGlyph[option]}
          {themeLabel[option]}
        </button>
      ))}
    </div>
  )
}
