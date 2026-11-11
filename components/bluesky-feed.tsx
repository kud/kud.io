"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { BlueskyIcon } from "@/components/social-icons"
import styles from "./bluesky-card.module.css"

// The Bluesky icon in the hero socials (components/bluesky-card.tsx). A click,
// a tap, Enter or Space opens the recent posts in a modal; closing it hands
// focus back to the icon. Without JavaScript, or with a modifier held for a new
// tab, it stays the link to the profile it always was.
export const BlueskyFeedLink = ({
  href,
  label,
  profile,
  feed,
  children,
}: {
  href: string
  label: string
  profile: string
  feed: ReactNode
  children: ReactNode
}) => {
  const [reading, setReading] = useState(false)
  const link = useRef<HTMLAnchorElement>(null)
  const returning = useRef(false)

  // After the dialog has closed: while it is open the page is inert.
  useEffect(() => {
    if (reading || !returning.current) return
    returning.current = false
    link.current?.focus()
  }, [reading])

  return (
    <li>
      <a
        ref={link}
        href={href}
        aria-label={label}
        aria-haspopup="dialog"
        target="_blank"
        rel="noreferrer"
        onClick={(event) => {
          if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return
          event.preventDefault()
          setReading(true)
        }}
        onKeyDown={(event) => {
          if (event.key !== " ") return
          event.preventDefault()
          setReading(true)
        }}
      >
        {children}
      </a>
      {reading && (
        <BlueskyFeed
          profile={profile}
          onClose={() => {
            returning.current = true
            setReading(false)
          }}
        >
          {feed}
        </BlueskyFeed>
      )}
    </li>
  )
}

// The first screen's fold: a post starting less than CLEAR above it shows
// only its date under the fade, and one starting within SNUG below it ends
// the screen on a neat boundary. Either way the fold moves CUT above that
// post, into the one before.
const CLEAR = 112
const SNUG = 24
const CUT = 72

// Erwann's recent Bluesky posts in full. The launcher's family: a native modal
// <dialog> (focus trap, Escape and the backdrop for free), the whole viewport
// and transparent, so a click that misses the panel is a click outside.
const BlueskyFeed = ({
  onClose,
  profile,
  children,
}: {
  onClose: () => void
  profile: string
  children: ReactNode
}) => {
  const dialog = useRef<HTMLDialogElement>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const [atEnd, setAtEnd] = useState(false)

  useLayoutEffect(() => {
    const node = dialog.current
    if (!node) return
    node.showModal()
    return () => node.close()
  }, [])

  // The fade at the foot of the list says there is more below; it lifts at the
  // end. The first screen must also end mid-post: when the fold falls on a
  // post's first lines, all under the fade, the list reads as complete, so it
  // is shortened until the fold cuts the post above. Pictures load late and
  // lengthen the list, so the fit runs again until the reader scrolls.
  useEffect(() => {
    const node = scroll.current
    if (!node) return
    const measure = () =>
      setAtEnd(node.scrollTop + node.clientHeight >= node.scrollHeight - 2)
    const fit = () => {
      if (node.scrollTop > 0) return
      node.style.removeProperty("flex")
      node.style.removeProperty("height")
      delete node.dataset.trimmed
      const top = node.getBoundingClientRect().top
      const fold = node.clientHeight
      const hit = [...node.querySelectorAll(":scope > ol > li")]
        .map((post) => post.getBoundingClientRect().top - top)
        .find(
          (start) => start > 0 && fold - start > -SNUG && fold - start < CLEAR,
        )
      if (hit !== undefined) {
        node.style.flex = "none"
        node.style.height = `${hit - CUT}px`
        node.dataset.trimmed = ""
      }
      measure()
    }
    fit()
    node.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", fit)
    const observer = new ResizeObserver(fit)
    if (node.firstElementChild) observer.observe(node.firstElementChild)
    return () => {
      node.removeEventListener("scroll", measure)
      window.removeEventListener("resize", fit)
      observer.disconnect()
    }
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
        <div
          ref={scroll}
          className={styles.scroll}
          data-end={atEnd || undefined}
        >
          {children}
        </div>
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
