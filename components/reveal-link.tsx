"use client"

import type { MouseEvent, ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTransitionRouter } from "next-view-transitions"

type Props = {
  href: string
  className?: string
  children: ReactNode
}

// The home → /projects CTA. On desktop it fires the `ink:reveal` event so the
// InkTransition overlay spreads ink out of the button and navigates under the
// cover; the cover colour is /projects' dark background so the reveal is seamless.
// On mobile (and reduced-motion) it keeps the View-Transitions flat cross-fade +
// shared-avatar morph instead.
export const RevealLink = ({ href, className, children }: Props) => {
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

    if (desktop && !reducedMotion) {
      const rect = event.currentTarget.getBoundingClientRect()
      window.dispatchEvent(
        new CustomEvent("ink:reveal", {
          detail: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            href,
            color: "#08080f",
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
