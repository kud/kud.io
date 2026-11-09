"use client"

import { Link } from "next-view-transitions"
import type { ComponentProps, MouseEvent } from "react"
import { inkNavigate } from "@/components/ink"

// The site's default internal link. On desktop it hands the move to the ink
// overlay (components/ink-transition.tsx), in the destination's ground; when
// ink doesn't apply (a phone, reduced motion, same page, a route whose ground
// isn't known) it falls through to the view-transition Link it wraps, which
// stops on defaultPrevented, so the two never both run.
export const InkLink = ({
  onClick,
  href,
  ...props
}: ComponentProps<typeof Link>) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (typeof href === "string" && inkNavigate(event, href))
      event.preventDefault()
  }

  return <Link {...props} href={href} onClick={handleClick} />
}
