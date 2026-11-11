"use client"

import { usePathname } from "next/navigation"
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react"
import type { ReactNode } from "react"
import { scopeGroundFor } from "@/components/ink"
import { themeMerge } from "@/components/theme-merge"

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
// By default one stored choice covers every scope: picking Light on the blog
// means Light on /projects too. A visitor can opt into a theme per section
// (Erwann, 2026-11-10: "my blog in light but projects in dark"): Writing and
// Projects then each keep their own key, which wins over the shared one. The
// opt-in is the presence of a section key, so there is no third flag to drift
// out of step with the values it describes.
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
// third world: an e-ink reader, white paper and greys only (app/ink.css).
export const SCOPED_THEMES = ["system", "light", "dark", "ink"] as const

export type ScopedTheme = (typeof SCOPED_THEMES)[number]

// Ink has a light of its own: white paper by day, a dark panel by night, or
// whichever the OS says (Erwann, 2026-11-11). It is one choice for every ink
// page, stamped beside data-theme as data-ink-tone, and white paper stays the
// default so an Ink chosen before this keeps the page it had.
export const INK_TONES = ["system", "light", "dark"] as const
export type InkTone = (typeof INK_TONES)[number]
export const INK_TONE_KEY = "kud.theme.ink"

// The picker's two axes. Tone is the light (Auto, Light, Dark); style is
// whether the page keeps its colour or is printed in ink. Stored as before:
// the theme key holds a tone or "ink", and the ink key holds ink's tone.
export type ThemeStyle = "colour" | "ink"

// The sections a visitor may theme apart. Home and anything unclaimed always
// follow the shared choice.
export const THEME_SECTIONS = ["writing", "projects"] as const

export type ThemeSection = (typeof THEME_SECTIONS)[number]

export const SECTION_LABEL: Record<ThemeSection, string> = {
  writing: "Writing",
  projects: "Projects",
}

const sectionKey = (section: ThemeSection) => `${THEME_KEY}.${section}`

// The section a path belongs to. The pre-paint script repeats this test as a
// string; change one, change both.
export const sectionOf = (pathname: string): ThemeSection | null => {
  if (pathname === "/blog" || pathname.startsWith("/blog/")) return "writing"
  if (pathname === "/projects" || pathname.startsWith("/projects/"))
    return "projects"
  return null
}

const isInkTone = (value: unknown): value is InkTone =>
  (INK_TONES as readonly unknown[]).includes(value)

export const readInkTone = (): InkTone => {
  const stored = read(INK_TONE_KEY)
  return isInkTone(stored) ? stored : "light"
}

const isTheme = (value: unknown): value is ScopedTheme =>
  (SCOPED_THEMES as readonly unknown[]).includes(value)

// Holds every choice for this page load when storage is blocked, so the
// controls still reflect what was picked even though it cannot persist.
const unpersisted = new Map<string, string>()

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return unpersisted.get(key) ?? null
  }
}

const write = (key: string, value: string | null) => {
  if (value === null) unpersisted.delete(key)
  else unpersisted.set(key, value)
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Preference simply won't persist; the session still themes correctly.
  }
}

// The shared choice, moving a legacy blog value to the shared key the first
// time it is seen.
const readShared = (): string | null => {
  const stored = read(THEME_KEY)
  if (stored !== null) return stored
  const legacy = read(LEGACY_THEME_KEY)
  if (legacy === null) return null
  write(THEME_KEY, legacy)
  write(LEGACY_THEME_KEY, null)
  return legacy
}

// "system" is a real CSS state, not a JavaScript resolution: each scope's CSS
// resolves [data-theme="system"] with a prefers-color-scheme media query. So a
// first-time visitor needs no JavaScript at all — the server-rendered default is
// already correct — and the OS flipping mid-session needs no matchMedia
// listener. This script only has to replay an explicit stored choice onto the
// wrapper it sits in, before first paint: the section's own when there is one,
// else the shared one. It reads the legacy key without moving it; the first
// client read moves it.
const THEME_SCRIPT = `try{var p=location.pathname,s=p==="/blog"||p.indexOf("/blog/")===0?"writing":p==="/projects"||p.indexOf("/projects/")===0?"projects":null,v=function(x){return x==="system"||x==="light"||x==="dark"||x==="ink"},t=s?localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)}+"."+s):null;if(!v(t))t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(t===null)t=localStorage.getItem(${JSON.stringify(
  LEGACY_THEME_KEY,
)});var e=document.currentScript.parentElement,k=localStorage.getItem(${JSON.stringify(
  INK_TONE_KEY,
)});if(k==="system"||k==="dark")e.dataset.inkTone=k;if(t==="light"||t==="dark"||t==="ink")e.dataset.theme=t}catch(e){}`

const themeListeners = new Set<() => void>()

const subscribeToTheme = (listener: () => void) => {
  themeListeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    themeListeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

const notify = () => themeListeners.forEach((listener) => listener())

// True once the visitor has opted into a theme per section.
export const readSplit = (): boolean =>
  THEME_SECTIONS.some((section) => read(sectionKey(section)) !== null)

// The theme a section actually shows: its own when it has one, else the
// shared choice. No section (home) means the shared choice.
export const readStoredTheme = (
  section: ThemeSection | null = null,
): ScopedTheme => {
  if (section) {
    const own = read(sectionKey(section))
    if (isTheme(own)) return own
  }
  const shared = readShared()
  return isTheme(shared) ? shared : "system"
}

const serverTheme = (): ScopedTheme => "system"
const serverSplit = () => false
const serverInkTone = (): InkTone => "light"

// Every scope on the page belongs to the page's section, so one value covers
// them all.
const stampScopes = (theme: ScopedTheme) => {
  document
    .querySelectorAll<HTMLElement>(`[${THEME_SCOPE_ATTR}]`)
    .forEach((scope) => {
      scope.dataset.theme = theme
      scope.dataset.inkTone = readInkTone()
    })
}

// Picks a theme and stamps it, crossfading when the ground changes. The old
// light merges into the new one (components/theme-merge.ts). Ink is for
// changing world, never for a theme. A choice that resolves to the ground
// already showing (Dark to Auto on a dark OS) has nothing to blend and swaps
// plainly.
const applyTheme = (before: ScopedTheme, after: ScopedTheme) => {
  if (scopeGroundFor(before) === scopeGroundFor(after)) stampScopes(after)
  else themeMerge(() => stampScopes(after))
}

// A picker shows and sets the theme of the section it sits in. While the
// choice is shared that is the shared one, so a pick lands everywhere; once
// split, it is the section's own, and home keeps the shared one.
export const useScopedTheme = () => {
  const section = sectionOf(usePathname() ?? "")
  const readSection = useCallback(() => readStoredTheme(section), [section])

  // The pre-paint script has already applied the stored value to the DOM; the
  // server snapshot keeps hydration on "system" and React then re-reads storage
  // on the client, which is why each wrapper carries suppressHydrationWarning.
  const theme = useSyncExternalStore(subscribeToTheme, readSection, serverTheme)
  const split = useSyncExternalStore(subscribeToTheme, readSplit, serverSplit)

  // The pressed control is still accepted from callers but a crossfade has no
  // origin.
  const setTheme = useCallback(
    (next: ScopedTheme, _origin?: Element | null) => {
      const before = readStoredTheme(section)
      write(section && readSplit() ? sectionKey(section) : THEME_KEY, next)
      applyTheme(before, readStoredTheme(section))
      notify()
    },
    [section],
  )

  // Going separate copies the current choice into each section, so nothing
  // moves until a section is picked on its own. Going back to the same theme
  // everywhere keeps the one on screen and drops the rest.
  const setSplit = useCallback(
    (next: boolean) => {
      if (next === readSplit()) return
      const current = readStoredTheme(section)
      if (next) {
        THEME_SECTIONS.forEach((each) => write(sectionKey(each), current))
      } else {
        write(THEME_KEY, current)
        THEME_SECTIONS.forEach((each) => write(sectionKey(each), null))
      }
      stampScopes(current)
      notify()
    },
    [section],
  )

  const inkTone = useSyncExternalStore(
    subscribeToTheme,
    readInkTone,
    serverInkTone,
  )
  const tone: InkTone = theme === "ink" ? inkTone : theme
  const style: ThemeStyle = theme === "ink" ? "ink" : "colour"

  // A tone press keeps the style: in Ink it relights the paper, otherwise it
  // is the theme itself.
  const setTone = useCallback(
    (next: InkTone) => {
      if (readStoredTheme(section) !== "ink") return setTheme(next)
      if (next === readInkTone()) return
      write(INK_TONE_KEY, next)
      themeMerge(() => stampScopes("ink"))
      notify()
    },
    [section, setTheme],
  )

  // A style press keeps the tone: Ink takes the light on screen, Colour gives
  // the paper's light back to the page.
  const setStyle = useCallback(
    (next: ThemeStyle) => {
      const current = readStoredTheme(section)
      if ((current === "ink") === (next === "ink")) return
      if (next === "ink") {
        write(INK_TONE_KEY, current as InkTone)
        setTheme("ink")
      } else setTheme(readInkTone())
    },
    [section, setTheme],
  )

  return {
    theme,
    setTheme,
    split,
    setSplit,
    section,
    tone,
    setTone,
    style,
    setStyle,
  }
}

// The first child of every themed wrapper. The wrapper itself carries
// data-theme="system", THEME_SCOPE_ATTR and suppressHydrationWarning.
//
// Two paths, because neither covers both cases. On a full load the inline
// script stamps the wrapper as the parser reaches it, before first paint. On a
// client-side navigation (home → /projects, home → /blog) React inserts the
// <script> as inert DOM and it never runs, so the wrapper would paint
// "system" over a stored choice; the layout effect re-applies it after commit
// and before paint. On a full load the effect is a no-op restamp. The section
// comes from the router, not location, which may not have moved yet.
export const ThemeScopeScript = () => {
  const ref = useRef<HTMLScriptElement>(null)
  const section = sectionOf(usePathname() ?? "")

  useLayoutEffect(() => {
    const scope = ref.current?.parentElement
    if (!scope) return
    scope.dataset.theme = readStoredTheme(section)
    scope.dataset.inkTone = readInkTone()
  }, [section])

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
