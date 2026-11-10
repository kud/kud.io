"use client"

import { useLayoutEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Preview only (?docs=N, app/docs-motion.css): moving between docs pages
// stays inside one world, so it gets a quiet motion rather than ink. This
// marks each in-docs move with its direction, by the pages' order in the
// sidebar, so a candidate can travel the way the reader went. The first load
// is never marked: only a move animates.
export const DocsMotion = () => {
  const pathname = usePathname()
  const previous = useRef<string | null>(null)

  useLayoutEffect(() => {
    const from = previous.current
    previous.current = pathname
    if (from === null || from === pathname) return
    const order = [
      ...document.querySelectorAll<HTMLAnchorElement>("#nd-sidebar a[href]"),
    ].map((link) => new URL(link.href).pathname)
    const a = order.indexOf(from)
    const b = order.indexOf(pathname)
    document.documentElement.dataset.docsDir =
      a !== -1 && b !== -1 && b < a ? "back" : "fwd"
  }, [pathname])

  return null
}
