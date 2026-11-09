"use client"

import type { MouseEvent, ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTransitionRouter } from "next-view-transitions"
import { inkNavigate } from "@/components/ink"

type Props = {
  href: string
  className?: string
  "aria-label"?: string
  children: ReactNode
}

// /projects → home. Home has one fixed ground, so this inks like
// every other move (components/ink.ts). Where ink does not apply it is the flat
// cross-fade + avatar morph, flagged as a "back" move so global.css drops the
// forward-only zoom.
export const BackLink = ({
  href,
  className,
  "aria-label": ariaLabel,
  children,
}: Props) => {
  const router = useRouter()
  const vtRouter = useTransitionRouter()

  useEffect(() => {
    router.prefetch(href)
  }, [router, href])

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return
    const inked = inkNavigate(event, href)
    event.preventDefault()
    if (inked) return

    document.documentElement.dataset.vt = "back"
    vtRouter.push(href, {
      onTransitionReady: () =>
        window.setTimeout(() => {
          delete document.documentElement.dataset.vt
        }, 700),
    })
  }

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
