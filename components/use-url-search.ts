"use client"

import { useSyncExternalStore } from "react"

// The query string as React state, for a listing whose filters live in the
// URL. The page itself stays static: the server snapshot is the bare page,
// and the real query string takes over right after hydration (or at once on
// a client-side return, such as Back from a project).
//
// Writes go through history.replaceState, which Next folds into its router,
// so the filtered address is the one Back and Forward return to. Typing and
// toggling replace rather than push: a filter is a view of one page, not a
// step to walk back through.

const CHANGE = "kud:url-search"

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange)
  window.addEventListener(CHANGE, onChange)
  return () => {
    window.removeEventListener("popstate", onChange)
    window.removeEventListener(CHANGE, onChange)
  }
}

export const useUrlSearch = () =>
  useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  )

// `search` is "" or "?…". The hash is kept, so an anchored arrival
// (/projects#apps) is not lost to the first filter.
export const replaceUrlSearch = (search: string) => {
  if (search === window.location.search) return
  const { pathname, hash } = window.location
  // null, not history.state: Next only follows a replaceState whose state is
  // not already its own, and copies its internal state across itself.
  window.history.replaceState(null, "", `${pathname}${search}${hash}`)
  window.dispatchEvent(new Event(CHANGE))
}
