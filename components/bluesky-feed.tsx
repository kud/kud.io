"use client"

import { useLayoutEffect, useRef } from "react"
import type { ReactNode } from "react"
import { BlueskyIcon } from "@/components/social-icons"
import styles from "./bluesky-card.module.css"

// Erwann's recent Bluesky posts in full, opened from the peek
// (components/bluesky-peek.tsx). The launcher's family: a native modal
// <dialog> (focus trap, Escape and the backdrop for free), the whole viewport
// and transparent, so a click that misses the panel is a click outside.
export const BlueskyFeed = ({
  onClose,
  profile,
  children,
}: {
  onClose: () => void
  profile: string
  children: ReactNode
}) => {
  const dialog = useRef<HTMLDialogElement>(null)

  useLayoutEffect(() => {
    const node = dialog.current
    if (!node) return
    node.showModal()
    return () => node.close()
  }, [])

  return (
    <dialog
      ref={dialog}
      className={styles.feedDialog}
      aria-labelledby="bsky-feed-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={styles.panel}>
        <header className={styles.bar}>
          <BlueskyIcon className={styles.barMark} />
          <h2 id="bsky-feed-title" className={styles.title}>
            Lately on Bluesky
          </h2>
          <span className={styles.handle}>@kud.io</span>
          <button
            type="button"
            className={styles.esc}
            onClick={onClose}
            aria-label="Close"
          >
            <span className={styles.escKey}>esc</span>
            <span className={styles.escWord}>Close</span>
          </button>
        </header>
        <div className={styles.scroll}>{children}</div>
        <footer className={styles.foot}>
          <a
            href={profile}
            className={styles.continue}
            target="_blank"
            rel="noreferrer"
          >
            Continue on Bluesky
            <span aria-hidden>↗</span>
          </a>
        </footer>
      </div>
    </dialog>
  )
}
