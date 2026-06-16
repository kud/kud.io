"use client"

import { useRef, useState, type ReactNode } from "react"
import styles from "./landing-kit.module.css"

// Renders a fenced code block (passed as MDX children) inside terminal chrome.
// The copy button reads the rendered text, so multiline code works reliably —
// unlike template-literal props, which next-mdx-remote drops.
export const Terminal = ({
  children,
  label = "terminal",
}: {
  children: ReactNode
  label?: string
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const text = ref.current?.textContent ?? ""
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard unavailable — nothing to do.
    }
  }

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalBar}>
        <span className={styles.tdot} />
        <span className={styles.tdot} />
        <span className={styles.tdot} />
        <span className={styles.terminalLabel}>{label}</span>
        <button type="button" onClick={copy} className={styles.copy}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <div ref={ref} className={styles.terminalBody}>
        {children}
      </div>
    </div>
  )
}
