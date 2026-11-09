"use client"

import { useEffect } from "react"
import { reducedMotion } from "@/components/ink"

// The target of a same-document hash link, or null when the link leaves the
// page (another path or query, another origin) or names nothing on it.
const sameDocumentTarget = (anchor: HTMLAnchorElement): Element | null => {
  const raw = anchor.getAttribute("href")
  if (!raw || !raw.includes("#")) return null
  const url = new URL(anchor.href, window.location.href)
  const here = window.location
  if (url.origin !== here.origin) return null
  if (url.pathname !== here.pathname || url.search !== here.search) return null
  const id = decodeURIComponent(url.hash.slice(1))
  if (!id || id === "top") return document.body
  return (
    document.getElementById(id) ?? document.getElementsByName(id)[0] ?? null
  )
}

// A same-page anchor (docs table of contents, heading anchors, the home
// scroll hint, in-post links) is a scroll and nothing else. Left alone, two
// things turn it into a page move: next-view-transitions' Link wraps every
// click, a hash included, in a view transition and a router push; and its
// ViewTransitions provider starts one on every popstate, which Chrome fires
// for a plain fragment click too. Both are a fade over a page that never
// changed. This listens on window in the capture phase, ahead of React's
// root listener, so it prevents the default before either sees the click
// (both stand down on defaultPrevented, as does inkNavigate); the URL moves
// with pushState, which fires no popstate. scrollIntoView walks to the nearest
// scrolling ancestor, so it also works where an element, not the document,
// scrolls (home's scroll-snap container on phones). Reduced motion jumps.
export const HashScroll = () => {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return
      const anchor = (event.target as Element | null)?.closest?.("a[href]")
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target && anchor.target !== "_self") return
      if (anchor.hasAttribute("download")) return
      const target = sameDocumentTarget(anchor)
      if (!target) return

      event.preventDefault()
      target.scrollIntoView({
        behavior: reducedMotion() ? "auto" : "smooth",
        block: "start",
      })
      const hash = new URL(anchor.href).hash
      if (hash !== window.location.hash)
        window.history.pushState(null, "", hash || "#")
    }
    window.addEventListener("click", onClick, { capture: true })
    return () => window.removeEventListener("click", onClick, { capture: true })
  }, [])

  return null
}
