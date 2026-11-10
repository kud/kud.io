"use client"

import { Link } from "next-view-transitions"
import type { ComponentProps, MouseEvent } from "react"
import { inkNavigate } from "@/components/ink"

// A link whose move carries a shared element: the app icon glides from the
// card to the landing (view-transition-name app-icon-<slug>).
//
// Normally the move is ink like every other (components/ink.ts): ink covers
// the page, the navigation runs inside a view transition flagged "ink-morph",
// so the root swaps under the cover with no fade and only the icon travels,
// over the ink, before the ink lifts (components/ink-transition.tsx). Where
// ink does not apply (reduced motion, a modified click) it falls through to
// the old "morph": the icon glides while the root holds and fades
// (html[data-vt="morph"] in app/global.css). The flag self-clears afterwards.
export const MorphLink = ({
  onClick,
  href,
  ...props
}: ComponentProps<typeof Link>) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    const el = document.documentElement
    // Every card on /projects carries its own view-transition-name, so each
    // one was lifted out of the root snapshot into a group of its own: ~100
    // titles and icons fading on the browser's default 250ms, independent of
    // the root hold, each leaving a hole in the old page where the ground
    // showed through. Only the pressed card should morph; the rest stay in the
    // page. This runs before the transition takes the snapshot.
    const own = event.currentTarget
    document
      .querySelectorAll<HTMLElement>('[style*="view-transition-name"]')
      .forEach((named) => {
        if (!own.contains(named)) named.style.viewTransitionName = "none"
      })
    const shared = [
      ...own.querySelectorAll<HTMLElement>('[style*="view-transition-name"]'),
    ]
      .map((named) => named.style.viewTransitionName)
      .find((name) => name && name !== "none")
    if (
      typeof href === "string" &&
      inkNavigate(event, href, { morph: shared ?? "" })
    ) {
      event.preventDefault()
      return
    }
    el.dataset.vt = "morph"
    window.setTimeout(() => {
      if (el.dataset.vt === "morph") delete el.dataset.vt
    }, 700)
  }

  return <Link {...props} href={href} onClick={handleClick} />
}
