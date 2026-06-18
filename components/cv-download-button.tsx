"use client"

import { useState } from "react"
import styles from "@/app/page.module.css"

const MIN_VISIBLE_MS = 600

// "Download my CV" with a real loading state. It fetches the generated PDF as a
// blob and triggers a download, showing a spinner meanwhile. The fetch is raced
// against a minimum visible duration so the spinner never just flashes (the PDF
// is prerendered, so the request can resolve almost instantly).
export const CvDownloadButton = () => {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      const [response] = await Promise.all([
        fetch("/cv.pdf"),
        new Promise((resolve) => window.setTimeout(resolve, MIN_VISIBLE_MS)),
      ])
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "erwann-mest-systems-designer-cv.pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={`${styles.timelineButton} ${styles.timelineButtonPrimary}`}
      data-mascot="cv"
      onClick={handleClick}
      disabled={loading}
      aria-busy={loading}
      aria-label={loading ? "Preparing your CV…" : undefined}
    >
      Download my CV
      <span className={styles.btnIcon} aria-hidden>
        {loading ? <span className={styles.spinner} /> : "↓"}
      </span>
    </button>
  )
}
