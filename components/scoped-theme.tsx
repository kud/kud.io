"use client"

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react"
import type { ReactNode } from "react"
import { inkSwap, scopeGroundFor } from "@/components/ink"

// Scoped visitor themes: each themed surface (the blog, the Dusk pages under
// /projects) owns its own light/dark/system choice, stamped as data-theme on
// its wrapper element.
//
// app/layout.tsx runs fumadocs' RootProvider with forcedTheme: "dark", which
// puts class="dark" on <html> unconditionally, and home, fumadocs' tokens and
// --shiki-dark all rest on it. A scope never touches <html>: its CSS keys on
// [data-theme] on the wrapper, so the two axes never meet — PROVIDED nothing
// inside a scope keys on `.dark` or reads a raw --color-fd-* variable without
// overriding it on the scope. Break that and light silently goes half-dark.
// next-themes is not reused here because it targets document.documentElement
// exclusively; a second instance would contend with the first over <html> and
// over style.colorScheme. (ADR: scoped themes under a forced-dark root.)
//
// One stored choice covers every scope: picking Light on the blog means Light
// on /projects too.
export const THEME_KEY = "kud.theme"
// The blog's key before the choice was shared. Read once, moved, removed.
const LEGACY_THEME_KEY = "kud.blog.theme"
// Marks every wrapper the stored choice is applied to.
export const THEME_SCOPE_ATTR = "data-theme-scope"

export const BLOG_ROOT_ID = "blog-root"

// Every choice a picker offers. Anything that lists themes (the Dusk picker,
// the blog control, the command launcher's settings) maps over this and keeps
// its own word and mark in a Record<ScopedTheme, …>, so a theme added here
// fails the build until every list has something to say for it. Ink is the
// third world: everything drawn in ink (app/ink.css).
export const SCOPED_THEMES = ["system", "light", "dark", "ink"] as const

export type ScopedTheme = (typeof SCOPED_THEMES)[number]

const isTheme = (value: unknown): value is ScopedTheme =>
  (SCOPED_THEMES as readonly unknown[]).includes(value)

// Returns the stored choice, moving a legacy blog value to the shared key the
// first time it is seen. Throws when storage is blocked; callers catch.
const readStorage = (): string | null => {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored !== null) return stored
  const legacy = localStorage.getItem(LEGACY_THEME_KEY)
  if (legacy === null) return null
  localStorage.setItem(THEME_KEY, legacy)
  localStorage.removeItem(LEGACY_THEME_KEY)
  return legacy
}

// "system" is a real CSS state, not a JavaScript resolution: each scope's CSS
// resolves [data-theme="system"] with a prefers-color-scheme media query. So a
// first-time visitor needs no JavaScript at all — the server-rendered default is
// already correct — and the OS flipping mid-session needs no matchMedia
// listener. This script only has to replay an explicit stored choice onto the
// wrapper it sits in, before first paint. It reads the legacy key without
// moving it; the first client read moves it.
const THEME_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(t===null)t=localStorage.getItem(${JSON.stringify(
  LEGACY_THEME_KEY,
)});if(t==="light"||t==="dark"||t==="ink")document.currentScript.parentElement.dataset.theme=t}catch(e){}`

const themeListeners = new Set<() => void>()
// Holds the choice for this page load when storage is blocked, so the control
// still reflects what was picked even though it cannot persist.
let unpersistedTheme: ScopedTheme = "system"

const subscribeToTheme = (listener: () => void) => {
  themeListeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    themeListeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

export const readStoredTheme = (): ScopedTheme => {
  try {
    const stored = readStorage()
    return isTheme(stored) ? stored : "system"
  } catch {
    // Private browsing or blocked storage — "system" is a fine answer.
    return unpersistedTheme
  }
}

const serverTheme = (): ScopedTheme => "system"

const stampScopes = (theme: ScopedTheme) => {
  document
    .querySelectorAll<HTMLElement>(`[${THEME_SCOPE_ATTR}]`)
    .forEach((scope) => {
      scope.dataset.theme = theme
    })
}

export const useScopedTheme = () => {
  // The pre-paint script has already applied the stored value to the DOM; the
  // server snapshot keeps hydration on "system" and React then re-reads storage
  // on the client, which is why each wrapper carries suppressHydrationWarning.
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readStoredTheme,
    serverTheme,
  )

  // origin is the pressed control: the new light spreads out of it as ink in
  // the new ground (components/ink.ts). Storage and the control update at once;
  // only the stamp, the one thing that repaints the page, waits for the cover.
  // A choice that resolves to the ground already showing (Dark to Auto on a
  // dark OS) has nothing to cover and swaps plainly.
  const setTheme = useCallback((next: ScopedTheme, origin?: Element | null) => {
    const before = readStoredTheme()
    unpersistedTheme = next
    const from = scopeGroundFor(before)
    const to = scopeGroundFor(next)
    void inkSwap(from === to ? null : origin, to, () => stampScopes(next))
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Preference simply won't persist; the session still themes correctly.
    }
    themeListeners.forEach((listener) => listener())
  }, [])

  return { theme, setTheme }
}

// The first child of every themed wrapper. The wrapper itself carries
// data-theme="system", THEME_SCOPE_ATTR and suppressHydrationWarning.
//
// Two paths, because neither covers both cases. On a full load the inline
// script stamps the wrapper as the parser reaches it, before first paint. On a
// client-side navigation (home → /projects, home → /blog) React inserts the
// <script> as inert DOM and it never runs, so the wrapper would paint
// "system" over a stored choice; the layout effect re-applies it after commit
// and before paint. On a full load the effect is a no-op restamp.
export const ThemeScopeScript = () => {
  const ref = useRef<HTMLScriptElement>(null)

  useLayoutEffect(() => {
    const scope = ref.current?.parentElement
    if (!scope) return
    const stored = readStoredTheme()
    if (stored !== "system") scope.dataset.theme = stored
  }, [])

  return (
    <script
      ref={ref}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  )
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
const themeGlyph: Record<ScopedTheme, ReactNode> = {
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
  // A drop of ink, sized to the same circle as Moon and Auto at its belly.
  ink: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 1.25c-.26 0-.5.14-.63.37C6.1 3.84 3.5 7.1 3.5 10a4.5 4.5 0 0 0 9 0c0-2.9-2.6-6.16-3.87-8.38A.73.73 0 0 0 8 1.25Z" />
    </svg>
  ),
}

const themeLabel: Record<ScopedTheme, string> = {
  light: "Light",
  dark: "Dark",
  system: "Auto",
  ink: "Ink",
}

// Deliberately unstyled beyond the marks themselves: Iris owns how this looks
// and where it sits.
export const ThemeControl = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useScopedTheme()

  return (
    <div className={className} role="group" aria-label="Colour theme">
      {SCOPED_THEMES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={(event) => setTheme(option, event.currentTarget)}
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
