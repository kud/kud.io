"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Moving between docs pages stays inside one world, so it gets a quiet settle
// rather than ink (app/docs-motion.css). This marks the first in-docs move; the
// first load is never marked, so only a move animates.
export const DocsMotion = () => {
  const pathname = usePathname()
  const previous = useRef<string | null>(null)

  useLayoutEffect(() => {
    const from = previous.current
    previous.current = pathname
    if (from === null || from === pathname) return
    document.documentElement.dataset.docsMoved = ""
  }, [pathname])

  // Leaving the docs clears the mark, so coming back is a first load again.
  useEffect(
    () => () => {
      delete document.documentElement.dataset.docsMoved
    },
    [],
  )

  return null
}
