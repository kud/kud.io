"use client"

import { useEffect } from "react"
import { MORPH_RETURN_KEY, morphNames } from "@/components/morph-link"

// /projects, arriving back from a project (its ← Projects link or the Back
// button, both via MorphLink). Every card here carries its own
// view-transition-name so a forward press can morph any of them, which on
// arrival put ~100 entry-only groups into the new snapshot, each fading in
// on its own over bare ground. Keep only the returning project's icon and
// title named, and scroll its card into view so the glide lands somewhere
// visible. This runs in a passive effect: after the router's own scroll
// (a layout-phase effect, which would otherwise undo ours) and before the
// ViewTransitions provider's effect lets the browser take the new snapshot.
// The other names come back once the transition is over, ready for the next
// press.
export const MorphArrival = () => {
  useEffect(() => {
    let slug: string | null = null
    try {
      slug = sessionStorage.getItem(MORPH_RETURN_KEY)
      sessionStorage.removeItem(MORPH_RETURN_KEY)
    } catch {}
    if (!slug) return

    const keep = morphNames(slug)
    const stripped: [HTMLElement, string][] = []
    let card: HTMLElement | null = null
    const named = document.querySelectorAll<HTMLElement>(
      '[style*="view-transition-name"]',
    )
    for (const el of named) {
      const name = el.style.viewTransitionName
      if (keep.includes(name)) {
        card ??= el.closest<HTMLElement>("a") ?? el
        continue
      }
      stripped.push([el, name])
      el.style.viewTransitionName = "none"
    }

    // Instant on purpose: the glide is the motion, and the snapshot is taken
    // on the next frame, so a smooth scroll would be caught mid-way.
    card?.scrollIntoView({ block: "center" })

    // No cleanup: React's dev double-run would clear it and leave the names
    // stripped, and restoring onto a detached element is harmless.
    window.setTimeout(() => {
      for (const [el, name] of stripped) el.style.viewTransitionName = name
    }, 700)
  }, [])

  return null
}
