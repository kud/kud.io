"use client"

import type { MouseEvent, ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTransitionRouter } from "next-view-transitions"

type Props = {
  href: string
  className?: string
  children: ReactNode
  resolveCover?: () => string | null
}

// /projects follows the reader's light, so no single ink colour matches it: a
// link that doesn't supply resolveCover navigates without ink.
const DEFAULT_COVER: string | null = null

// The home → destination CTA. On desktop it fires the `ink:reveal` event so the
// InkTransition overlay spreads ink out of the button and navigates under the
// cover; the cover colour is the destination's own background so the reveal is
// seamless. On mobile (and reduced-motion) it keeps the View-Transitions flat
// cross-fade + shared-avatar morph instead.
//
// The ink only ever earns its place when it has a ground change to cover AND
// the cover colour is known to match: spreading dark ink between two LIGHT
// pages is a black flash, the precise artefact this effect exists to prevent.
// A destination whose ground is decided at runtime (the blog, which the visitor
// themes) therefore supplies resolveCover, and returning null there means
// "navigate without ink" — never "guess a colour".

export const RevealLink = ({
  href,
  className,
  children,
  resolveCover,
}: Props) => {
  const router = useRouter()
  const vtRouter = useTransitionRouter()

  // Prefetch the destination so the under-cover navigation paints instantly,
  // leaving no plateau between ink-cover and reveal.
  useEffect(() => {
    router.prefetch(href)
  }, [router, href])

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return
    event.preventDefault()

    const desktop = window.matchMedia("(min-width: 861px)").matches
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    // Resolved here, at click time, so the component renders identically on the
    // server and the client — the answer depends on localStorage and on the OS
    // theme, neither of which may be read during render.
    const cover = resolveCover ? resolveCover() : DEFAULT_COVER

    if (desktop && !reducedMotion && cover) {
      const rect = event.currentTarget.getBoundingClientRect()
      window.dispatchEvent(
        new CustomEvent("ink:reveal", {
          detail: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            href,
            color: cover,
          },
        }),
      )
      return
    }

    vtRouter.push(href)
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
