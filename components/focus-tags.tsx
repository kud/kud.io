"use client"

import { useEffect, useId, useRef, useState } from "react"
import { focus } from "@/lib/focus"
import styles from "@/app/page.module.css"

// The hero's focus values, each a button that opens a short "what I mean by
// this" modal (same native <dialog> pattern as the experience timeline). Turns
// a random-looking pill cloud into something with intent behind each word.
export const FocusTags = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Unique per instance — FocusTags renders in both the desktop and mobile hero,
  // so a static id would collide and mis-point aria-labelledby.
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (activeIndex !== null && !dialog.open) dialog.showModal()
    if (activeIndex === null && dialog.open) dialog.close()
  }, [activeIndex])

  const active = activeIndex === null ? null : focus[activeIndex]

  return (
    <>
      <ul className={styles.focus}>
        {focus.map((item, index) => (
          <li key={item.label}>
            <button
              type="button"
              className={styles.focusTag}
              onClick={() => setActiveIndex(index)}
              aria-haspopup="dialog"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.modal}
        aria-labelledby={titleId}
        onClose={() => setActiveIndex(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setActiveIndex(null)
        }}
      >
        {active ? (
          <div className={styles.modalCard}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setActiveIndex(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <p className={styles.modalSectionLabel}>What I mean</p>
            <h3 id={titleId} className={styles.modalRole}>
              {active.label}
            </h3>
            <p className={styles.modalSummary}>{active.description}</p>
          </div>
        ) : null}
      </dialog>
    </>
  )
}
