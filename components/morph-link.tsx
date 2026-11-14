"use client"

import { Link } from "next-view-transitions"
import { useEffect } from "react"
import type { ComponentProps, MouseEvent } from "react"

// sessionStorage key naming the project a return morph started from, read by
// MorphArrival on /projects to pick the one card that glides home.
export const MORPH_RETURN_KEY = "kud:morph-return"

const NAMED = '[style*="view-transition-name"]'

// The names a project owns in either page: its icon and its title.
export const morphNames = (slug: string) => [
  `app-icon-${slug}`,
  `project-${slug}`,
]

// Flag the next view transition as a morph, so global.css holds the incoming
// page hidden until the shared elements have landed (html[data-vt="morph"]).
// The flag lasts until the transition it belongs to has finished. It used to
// clear one second after the press, but the transition only starts once the
// next page has loaded: on a first visit or a slow phone that took longer, the
// flag was gone by the snapshot and the browser's default cross-fade played,
// doubling and stretching the cover and title (2026-11-14). The long timer
// only covers a press that never leads to a transition.
let clearFlag: number | undefined
let flagged = false

const clearMorph = () => {
  window.clearTimeout(clearFlag)
  flagged = false
  const el = document.documentElement
  if (el.dataset.vt === "morph") delete el.dataset.vt
}

// Every view transition passes through here, next-view-transitions' included:
// one that starts while the flag is up owns it and clears it when it ends.
const watchTransitions = () => {
  const doc = document as Document & { __morphWatched?: boolean }
  if (typeof doc.startViewTransition !== "function" || doc.__morphWatched)
    return
  doc.__morphWatched = true
  const start = doc.startViewTransition.bind(doc)
  doc.startViewTransition = (
    ...args: Parameters<Document["startViewTransition"]>
  ) => {
    const transition = start(...args)
    if (flagged) {
      flagged = false
      window.clearTimeout(clearFlag)
      transition.finished.finally(() => {
        if (!flagged) clearMorph()
      })
    }
    return transition
  }
}

export const flagMorph = () => {
  watchTransitions()
  document.documentElement.dataset.vt = "morph"
  flagged = true
  window.clearTimeout(clearFlag)
  clearFlag = window.setTimeout(clearMorph, 10000)
}

type Props = ComponentProps<typeof Link> & {
  // Set on a project page's way back to /projects: the morph is the project's
  // own icon and title, and the browser's Back button morphs the same way.
  slug?: string
}

// A transition-aware Link for the /projects ↔ project moves: a shared-element
// morph of the icon and title, with no ink.
export const MorphLink = ({ onClick, slug, ...props }: Props) => {
  // Back button: next-view-transitions already wraps every popstate in a view
  // transition, but unflagged, so it was a plain cross-fade with ~100 named
  // cards fading in on their own. Flag it and remember the slug, exactly as
  // the link does; this page's named elements are already in place.
  useEffect(() => {
    if (!slug) return
    const onPopState = () => {
      if (window.location.pathname !== "/projects") return
      flagMorph()
      try {
        sessionStorage.setItem(MORPH_RETURN_KEY, slug)
      } catch {}
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [slug])

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // A modified click opens a new tab and leaves this page where it is.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      onClick?.(event)
      return
    }
    flagMorph()
    // Only the moving project should carry a view-transition-name into the
    // snapshot; anything else named is lifted into a group of its own and
    // fades on the browser's default 250ms, independent of the root hold. On
    // /projects that is every other card; on a project page the link sits
    // outside the icon and title it is taking home, so they are kept by name
    // rather than by containment. This runs before the snapshot.
    const own = event.currentTarget
    const keep = slug ? morphNames(slug) : []
    document.querySelectorAll<HTMLElement>(NAMED).forEach((named) => {
      if (own.contains(named)) return
      if (keep.includes(named.style.viewTransitionName)) return
      named.style.viewTransitionName = "none"
    })
    if (slug) {
      try {
        sessionStorage.setItem(MORPH_RETURN_KEY, slug)
      } catch {}
    }
    onClick?.(event)
  }

  return <Link {...props} onClick={handleClick} />
}
