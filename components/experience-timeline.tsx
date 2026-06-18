"use client"

import { useEffect, useRef, useState } from "react"
import { experience } from "@/lib/experience"
import { CvDownloadButton } from "@/components/cv-download-button"
import styles from "@/app/page.module.css"

// The home timeline, with each role clickable to reveal a fuller modal. The
// short note stays on the card as a teaser; the summary, highlights, and stack
// live behind the click so the page reads as a portrait, not a CV — the depth
// is there only for people who care to open it.
export const ExperienceTimeline = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (activeIndex !== null && !dialog.open) dialog.showModal()
    if (activeIndex === null && dialog.open) dialog.close()
  }, [activeIndex])

  // "Depile" the entries: they stay hidden (.entryReveal) until we arrive at the
  // section, then deal out one by one with a staggered delay.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const items = Array.from(
      track.querySelectorAll<HTMLElement>(`.${styles.entryReveal}`),
    )
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      (observed) => {
        if (!observed.some((entry) => entry.isIntersecting)) return
        items.forEach((item, index) => {
          item.style.transitionDelay = `${index * 90}ms`
          item.classList.add(styles.entryRevealed)
        })
        observer.disconnect()
      },
      { threshold: 0.12 },
    )
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  const active = activeIndex === null ? null : experience[activeIndex]

  return (
    <section id="experience" className={styles.timeline}>
      <div className={styles.timelineInner}>
        <p className={styles.timelineEyebrow}>Career</p>
        <h2 className={styles.timelineTitle}>Experience</h2>

        <div className={styles.track} ref={trackRef}>
          {experience.map((item, index) => (
            <button
              key={`${item.org}-${item.period}`}
              type="button"
              className={`${styles.entry} ${styles.entryButton} ${styles.entryReveal}`}
              onClick={() => setActiveIndex(index)}
              aria-haspopup="dialog"
            >
              <span className={styles.entryPeriod}>{item.period}</span>
              <span className={styles.entryRole}>{item.role}</span>
              <span className={styles.entryOrg}>
                {item.org}
                {item.team ? ` · ${item.team}` : ""}{" "}
                <span className={styles.entryPlace}>·&nbsp;{item.place}</span>
              </span>
              <span className={styles.entryNote}>{item.note}</span>
              {item.detail ? (
                <span className={styles.entryMore} aria-hidden>
                  View details →
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className={styles.timelineMore}>
          <div className={styles.timelineButtons}>
            <CvDownloadButton />
            <a
              className={styles.timelineButton}
              href="https://linkedin.kud.io/"
              target="_blank"
              rel="noreferrer"
              data-mascot="history"
            >
              Full history on LinkedIn
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.modal}
        aria-labelledby="experience-modal-role"
        onClose={() => setActiveIndex(null)}
        onClick={(event) => {
          // Clicking the backdrop (the dialog element itself, not its inner
          // card) dismisses — the native default only closes on Esc.
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

            <p className={styles.modalPeriod}>{active.period}</p>
            <h3 id="experience-modal-role" className={styles.modalRole}>
              {active.role}
            </h3>
            <p className={styles.modalMeta}>
              {active.org}
              {active.team ? ` · ${active.team}` : ""} ·&nbsp;{active.place}
            </p>

            {active.detail ? (
              <>
                <p className={styles.modalSummary}>{active.detail.summary}</p>

                {active.detail.highlights.length > 0 ? (
                  <>
                    <p className={styles.modalSectionLabel}>Highlights</p>
                    <ul className={styles.modalHighlights}>
                      {active.detail.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {active.detail.stack.length > 0 ? (
                  <>
                    <p className={styles.modalSectionLabel}>Stack</p>
                    <ul className={styles.modalStack}>
                      {active.detail.stack.map((tech) => (
                        <li key={tech} className={styles.stackChip}>
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            ) : (
              <p className={styles.modalSummary}>{active.note}</p>
            )}

            <div className={styles.modalActions}>
              <a
                className={styles.modalVisit}
                href={active.url}
                target="_blank"
                rel="noreferrer"
              >
                Visit {active.org}
                <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  )
}
