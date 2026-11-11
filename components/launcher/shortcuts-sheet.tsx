"use client"

import { Fragment, useLayoutEffect, useRef, useState } from "react"
import type { KeyboardEvent, ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import styles from "./launcher.module.css"

type Row = { keys: string[][]; what: ReactNode }

// Every key the launcher answers to, on one sheet pushed over the list like
// the message form. Typing ? into an empty box opens it; Esc steps back.
const rows = (mod: string): { title: string; rows: Row[] }[] => [
  {
    title: "Anywhere",
    rows: [{ keys: [[mod, "K"]], what: "Open or close search" }],
  },
  {
    title: "In the list",
    rows: [
      { keys: [["↑"], ["↓"]], what: "Move" },
      { keys: [["tab"], ["⇧", "tab"]], what: "Next or previous section" },
      { keys: [["↵"]], what: "Open, or show the details first" },
      { keys: [[mod, "↵"]], what: "Open in a new tab" },
      { keys: [[mod, "C"]], what: "Copy the selected link or heading" },
      { keys: [[mod, "⇧", "C"]], what: "Copy this page as a Markdown link" },
      {
        keys: [["⌫"]],
        what: "On an empty box: remove the filter, then search all docs",
      },
      { keys: [["esc"]], what: "Back, then close" },
      { keys: [["?"]], what: "This sheet" },
    ],
  },
  {
    title: "Filters",
    rows: [
      {
        keys: [["#jenkins"]],
        what: "One family of projects, after a space",
      },
      {
        keys: [["cli:"], ["mcp:"], ["raycast:"]],
        what: "One kind of project",
      },
    ],
  },
]

export const ShortcutsSheet = ({ onBack }: { onBack: () => void }) => {
  const backRef = useRef<HTMLButtonElement>(null)
  const [mod] = useState(() =>
    /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl",
  )

  useLayoutEffect(() => {
    backRef.current?.focus()
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault()
      onBack()
    }
  }

  return (
    <div
      className={styles.panel}
      role="region"
      aria-labelledby="launcher-keys-title"
      onKeyDown={onKeyDown}
    >
      <div className={styles.bar}>
        <button
          ref={backRef}
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Back to search"
        >
          <ArrowLeft aria-hidden className={styles.backIcon} />
        </button>
        <h2 id="launcher-keys-title" className={styles.formTitle}>
          Keyboard shortcuts
        </h2>
        <span className={styles.formHint} aria-hidden>
          <kbd>esc</kbd> back
        </span>
      </div>
      <div className={styles.keys}>
        {rows(mod).map((group) => (
          <section key={group.title} className={styles.keysGroup}>
            <h3 className={styles.keysTitle}>{group.title}</h3>
            <dl className={styles.keysList}>
              {group.rows.map((row, index) => (
                <Fragment key={index}>
                  <dt>
                    {row.keys.map((combo, at) => (
                      <span key={at} className={styles.keysCombo}>
                        {combo.map((key) => (
                          <kbd key={key}>{key}</kbd>
                        ))}
                      </span>
                    ))}
                  </dt>
                  <dd>{row.what}</dd>
                </Fragment>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}
