"use client"

import { useCallback, useEffect, useState } from "react"

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

// Three words rather than two icons — two icons cannot say three things.
// "Auto" rather than "System": it is shorter, it is what the state actually
// does, and the stored value stays "system" so nothing downstream shifts.
// Deliberately unstyled: Iris owns how this looks and where it sits.
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
          {option === "light" ? "Light" : option === "dark" ? "Dark" : "Auto"}
        </button>
      ))}
    </div>
  )
}
