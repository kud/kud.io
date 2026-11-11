"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { currentPeek } from "@/components/peek-candidate"
import type { Peek } from "@/lib/peek"
import styles from "./project-peek.module.css"

// Preview only: a click on a /projects card opens a summary of the project
// over the grid instead of leaving it. The URL becomes the project's own, so
// Back closes the peek, a reload or a shared link lands on the full page, and
// a modified click still opens a new tab. Which shape it takes, or whether it
// opens at all, is read at click time (components/peek-candidate.tsx).
type Open = { slug: string; style: "2" | "3" }

const CARD = /^\/projects\/([^/]+)\/?$/

export const ProjectPeek = ({ peeks }: { peeks: Record<string, Peek> }) => {
  const [open, setOpen] = useState<Open | null>(null)
  const origin = useRef<HTMLElement | null>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor = (event.target as Element | null)?.closest?.("a[href]")
      if (!(anchor instanceof HTMLAnchorElement) || anchor.closest("dialog"))
        return
      const url = new URL(anchor.href)
      const slug = CARD.exec(url.pathname)?.[1]
      if (url.origin !== location.origin || url.hash || !slug || !peeks[slug])
        return
      const style = currentPeek()
      if (!style) return
      // Ahead of the card's own handler, so no morph and no navigation start.
      event.preventDefault()
      event.stopPropagation()
      origin.current = anchor
      window.history.pushState({ peek: slug }, "", url.pathname)
      setOpen({ slug, style })
    }
    const onPopState = () => {
      const slug = window.history.state?.peek
      if (typeof slug === "string" && peeks[slug]) {
        setOpen({ slug, style: currentPeek() ?? "2" })
      } else setOpen(null)
    }
    document.addEventListener("click", onClick, true)
    window.addEventListener("popstate", onPopState)
    return () => {
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("popstate", onPopState)
    }
  }, [peeks])

  // Focus goes back to the card that opened it, once the page is no longer inert.
  useEffect(() => {
    if (open) {
      wasOpen.current = true
      return
    }
    if (!wasOpen.current) return
    wasOpen.current = false
    origin.current?.focus({ preventScroll: true })
  }, [open])

  const close = () => {
    if (window.history.state?.peek) window.history.back()
    else setOpen(null)
  }

  const peek = open ? peeks[open.slug] : null
  if (!open || !peek) return null
  return (
    <PeekDialog
      key={open.slug}
      peek={peek}
      style={open.style}
      onClose={close}
      onLeave={() => setOpen(null)}
    />
  )
}

const PeekDialog = ({
  peek,
  style,
  onClose,
  onLeave,
}: {
  peek: Peek
  style: Open["style"]
  onClose: () => void
  onLeave: () => void
}) => {
  const dialog = useRef<HTMLDialogElement>(null)
  const router = useRouter()
  const href = `/projects/${peek.slug}`
  // A cover already shows the project; the shots follow only without one.
  const shots = peek.cover ? peek.shots.slice(0, 1) : peek.shots

  useLayoutEffect(() => {
    const node = dialog.current
    if (!node) return
    node.showModal()
    return () => node.close()
  }, [])

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      data-peek-style={style}
      aria-labelledby="peek-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // The dialog fills the viewport and is transparent: a click on it,
      // rather than inside the panel, is a click on the page around it.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={styles.panel}>
        <div className={styles.bar}>
          <span className={styles.type}>{peek.type}</span>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            Esc
          </button>
        </div>
        <div className={styles.body}>
          {peek.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.cover} src={peek.cover} alt="" />
          ) : null}
          <div className={styles.head}>
            {peek.icon ? (
              <span className={styles.icon}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={peek.icon} alt="" />
              </span>
            ) : null}
            <h2 id="peek-title" className={styles.name}>
              {peek.name}
            </h2>
          </div>
          {peek.description ? (
            <p className={styles.description}>{peek.description}</p>
          ) : null}
          {shots.length > 0 ? (
            <div className={styles.shots} data-count={shots.length}>
              {shots.map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`${peek.name} screenshot ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div className={styles.actions}>
          {peek.primary ? (
            <a
              href={peek.primary.href}
              className={styles.primary}
              {...(peek.primary.external
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
            >
              {peek.primary.label} {peek.primary.external ? "↗" : "↓"}
            </a>
          ) : null}
          <a
            href={href}
            className={styles.full}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey) return
              event.preventDefault()
              // The peek's history entry becomes the page: Back from it
              // returns to the grid, not to the peek.
              onLeave()
              router.replace(href)
            }}
          >
            Full page →
          </a>
        </div>
      </div>
    </dialog>
  )
}
