"use client"

import type { MouseEvent } from "react"
import { spill } from "@kud/inkblot"
import { readStoredTheme, type ScopedTheme } from "@/components/scoped-theme"

// Every ground a page can paint, mirrored from the CSS that paints it. The ink
// is always the DESTINATION's ground, so the cover and the page it lifts off
// are the same colour and the hand-off has no seam: light ink going to a light
// page, dark ink going to a dark one. Re-derive these from the stylesheets if a
// token moves, never from memory of how a page looks.
//   home  → app/page.module.css (.home background)
//   dusk  → app/warm.css (--dl-bg, --dn-bg)
//   blog  → app/blog/blog.module.css (#blog-root --bg)
export const HOME_GROUND = "#fdfbf8"
const DUSK_GROUND = { light: "#fbf7f3", dark: "#2a1d23" } as const
const BLOG_GROUND = { light: "#f7f8f9", dark: "#0e1418" } as const

type Scheme = "light" | "dark"

// "system" resolves the way each scope's CSS does: prefers-color-scheme.
export const resolveScheme = (theme: ScopedTheme): Scheme => {
  if (theme !== "system") return theme
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const scopeGround = (pathname: string, scheme: Scheme): string | null => {
  if (pathname === "/blog" || pathname.startsWith("/blog/"))
    return BLOG_GROUND[scheme]
  if (pathname === "/projects" || pathname.startsWith("/projects/"))
    return DUSK_GROUND[scheme]
  return null
}

// The ground a route will paint on arrival, or null when it isn't known (the
// 404, anything new), which means "navigate plainly", never "guess a colour".
export const groundFor = (pathname: string): string | null => {
  if (pathname === "/") return HOME_GROUND
  try {
    return scopeGround(pathname, resolveScheme(readStoredTheme()))
  } catch {
    return null
  }
}

// The ink a move spills, given the ground it is heading to: white by day,
// where the ground itself would be beige, and the night ground by night
// (Erwann, 2026-11-10). By day the cover lifts off white onto the page, a
// deliberate seam: the ink reads as ink, not as the page arriving early.
const isLightGround = (hex: string) =>
  parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) > 300
export const inkFor = (ground: string): string =>
  isLightGround(ground) ? "#ffffff" : ground

// The site's worlds, by first path segment: "/" is home, the rest are named
// by their section. A path no world claims is its own.
const WORLDS = ["projects", "blog"]
const worldOf = (pathname: string): string => {
  const head = pathname.split("/")[1] ?? ""
  if (head === "") return "home"
  return WORLDS.includes(head) ? head : pathname
}

export const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches

export const INK_OVERLAY_ID = "ink-overlay"

export type InkNavigateDetail = {
  x: number
  y: number
  href: string
  pathname: string
  color: string
}

// Called from a link's click handler. Returns true when it took the
// navigation over (the caller then prevents its own), false when the link
// should do whatever it would have done anyway. Same-page links never ink:
// nothing would commit to lift the cover.
export const inkNavigate = (
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
): boolean => {
  if (event.defaultPrevented) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return false
  if (event.button !== 0) return false
  if (reducedMotion()) return false

  const url = new URL(href, window.location.href)
  if (url.origin !== window.location.origin) return false
  if (url.pathname === window.location.pathname) return false
  // Ink marks a change of world (home, projects, blog), never a move inside
  // one: /projects to a project page or its docs is the same place, so it
  // takes the quieter view transition the link falls through to (Erwann,
  // 2026-11-10). The icon glide rides on that one.
  if (worldOf(url.pathname) === worldOf(window.location.pathname)) return false

  const ground = groundFor(url.pathname)
  if (!ground) return false
  const color = inkFor(ground)

  const rect = event.currentTarget.getBoundingClientRect()
  window.dispatchEvent(
    new CustomEvent<InkNavigateDetail>("ink:reveal", {
      detail: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        href,
        pathname: url.pathname,
        color,
      },
    }),
  )
  return true
}

let swapRun = 0

// The theme switch: ink in the new light's ground spreads out of the pressed
// control, the scope is restamped only once it fully covers the page (so the
// old theme never shows in the new colour, nor the reverse), then lifts. With
// reduced motion, or when the overlay is missing, it is a plain swap.
export const inkSwap = async (
  origin: Element | null | undefined,
  color: string,
  apply: () => void,
) => {
  const el = document.getElementById(INK_OVERLAY_ID)
  if (!el || !origin || reducedMotion()) {
    apply()
    return
  }
  swapRun += 1
  const run = swapRun
  const ink = inkFor(color)
  await spill(el, { mode: "cover", from: origin, colour: ink, duration: 380 })
  // A newer press took over mid-spread: its own apply decides the end state.
  if (run !== swapRun) return
  apply()
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (run !== swapRun) return
      void spill(el, {
        mode: "reveal",
        from: origin,
        colour: ink,
        duration: 420,
      })
    }),
  )
}

// The ground a scoped page paints under a given choice: the blog's own, or
// Dusk's for /projects and the docs.
export const scopeGroundFor = (theme: ScopedTheme): string => {
  const blog = document.getElementById("blog-root") !== null
  return (blog ? BLOG_GROUND : DUSK_GROUND)[resolveScheme(theme)]
}
