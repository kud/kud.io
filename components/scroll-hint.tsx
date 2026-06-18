"use client"

import type { MouseEvent } from "react"
import styles from "@/app/page.module.css"

// On mobile, `.home` is the scroll-snap container, so a bare #experience hash
// link scrolls the document (which doesn't move) and the hint appears dead.
// scrollIntoView walks to the nearest scrollable ancestor, so it works on both
// the desktop (document) and mobile (.home) scrollers.
export const ScrollHint = () => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document
      .getElementById("experience")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <a className={styles.scrollHint} href="#experience" onClick={handleClick}>
      Experience
      <span className={styles.chevron} aria-hidden>
        ↓
      </span>
    </a>
  )
}
