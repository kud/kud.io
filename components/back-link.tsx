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

// /projects → home. Symmetric with the forward CTA: on desktop it inks back, but
// with the home's cream as the cover colour so the reveal is seamless. On mobile
// (and reduced-motion) it keeps the flat cross-fade + avatar morph, flagged as a
// "back" move so global.css drops the forward-only zoom.
export const BackLink = ({ href, className, children }: Props) => {
  const router = useRouter()
  const vtRouter = useTransitionRouter()

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
            color: "#fdfbf8",
          },
        }),
      )
      return
    }

    document.documentElement.dataset.vt = "back"
    vtRouter.push(href, {
      onTransitionReady: () =>
        window.setTimeout(() => {
          delete document.documentElement.dataset.vt
        }, 700),
    })
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
