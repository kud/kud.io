"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"

type Status = "copied" | "linked" | ""

// The link is the heading's own id, so the URL it produces is the one the
// browser already scrolls to on load; nothing here has to resolve it.
export const BlogHeadingAnchor = ({
  id,
  label,
  styles,
}: {
  id: string
  label: string
  styles: Record<string, string>
}) => {
  const [status, setStatus] = useState<Status>("")
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const announce = (next: Status) => {
    setStatus(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus(""), 1800)
  }

  // pushState rather than letting the anchor navigate: the default would jump
  // the heading to the top of the viewport, and the reader is already looking
  // at it.
  const copy = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    history.pushState(null, "", `#${id}`)
    try {
      await navigator.clipboard.writeText(window.location.href)
      announce("copied")
    } catch {
      // Clipboard blocked — the address bar now holds the link instead.
      announce("linked")
    }
  }

  return (
    <>
      <a
        href={`#${id}`}
        className={styles.anchor}
        aria-label={`Link to section: ${label}`}
        onClick={copy}
      >
        <span aria-hidden="true">#</span>
      </a>
      <span className={styles.anchorStatus} role="status">
        {status === "copied" && "Link copied"}
        {status === "linked" && "Link in address bar"}
      </span>
    </>
  )
}
