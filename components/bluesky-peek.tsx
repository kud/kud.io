"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import styles from "./bluesky-card.module.css"

// The Bluesky icon in the hero socials (components/bluesky-card.tsx) peeks the
// latest post above itself.
//   Mouse     hover opens, leaving closes; a click still opens the profile.
//   Keyboard  focusing the icon opens; Tab walks into the card's links;
//             Escape closes and keeps focus on the icon.
//   Touch     no hover, so the first tap peeks and a second tap on the icon
//             opens the profile, as Safari treats hover menus; a tap anywhere
//             else closes it.
export const Peek = ({
  card,
  children,
}: {
  card: ReactNode
  children: ReactNode
}) => {
  const [open, setOpen] = useState(false)
  const item = useRef<HTMLLIElement>(null)
  const pointer = useRef("mouse")
  const closing = useRef<number | undefined>(undefined)
  const dismissed = useRef(false)

  const show = () => {
    window.clearTimeout(closing.current)
    setOpen(true)
  }
  // A short grace, so the pointer can cross the gap from the icon to the card.
  const hide = () => {
    window.clearTimeout(closing.current)
    closing.current = window.setTimeout(() => setOpen(false), 140)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      dismissed.current = true
      item.current?.querySelector<HTMLElement>(":scope > a")?.focus()
    }
    const onDown = (event: Event) => {
      if (!item.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("touchstart", onDown, { passive: true })
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("touchstart", onDown)
    }
  }, [open])

  return (
    <li
      ref={item}
      className={styles.peekItem}
      onPointerDown={(event) => {
        pointer.current = event.pointerType
      }}
      onTouchStart={() => {
        pointer.current = "touch"
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") show()
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") hide()
      }}
      onFocus={() => {
        if (!dismissed.current) show()
      }}
      onBlur={(event) => {
        if (item.current?.contains(event.relatedTarget as Node)) return
        dismissed.current = false
        hide()
      }}
      onClickCapture={(event) => {
        const icon = item.current?.querySelector(":scope > a")
        if (event.detail === 0 || pointer.current === "mouse") return
        if (!icon?.contains(event.target as Node) || open) return
        event.preventDefault()
        show()
      }}
    >
      {children}
      <div className={styles.peek} data-open={open || undefined}>
        {card}
      </div>
    </li>
  )
}
