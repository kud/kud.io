"use client"

import { Link } from "next-view-transitions"
import type { ComponentProps, MouseEvent } from "react"

// A transition-aware Link that flags the navigation as a shared-element "morph",
// so global.css can hold the incoming page's content hidden until the title morph
// has landed (see html[data-vt="morph"] in app/global.css), instead of letting it
// cross-fade in over the top. The flag self-clears after the transition window.
export const MorphLink = ({
  onClick,
  ...props
}: ComponentProps<typeof Link>) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const el = document.documentElement
    el.dataset.vt = "morph"
    // Every card on /projects carries its own view-transition-name, so each
    // one was lifted out of the root snapshot into a group of its own: ~100
    // titles and icons fading on the browser's default 250ms, independent of
    // the root hold, each leaving a hole in the old page where the ground
    // showed through. Only the pressed card should morph; the rest stay in the
    // page. This runs before next-view-transitions takes the snapshot.
    const own = event.currentTarget
    document
      .querySelectorAll<HTMLElement>('[style*="view-transition-name"]')
      .forEach((named) => {
        if (!own.contains(named)) named.style.viewTransitionName = "none"
      })
    window.setTimeout(() => {
      if (el.dataset.vt === "morph") delete el.dataset.vt
    }, 700)
    onClick?.(event)
  }

  return <Link {...props} onClick={handleClick} />
}
