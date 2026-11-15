"use client"

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { useDismiss } from "@/components/newsletter/use-dismiss"
import { InkLink as Link } from "@/components/ink-link"
import {
  monthBounds,
  monthGrid,
  monthOf,
  shiftMonth,
  weekdays,
} from "@/lib/newsletter/calendar"
import {
  COPY,
  formatEditionDate,
  formatMonth,
  newsletterHref,
  type Lang,
} from "@/lib/newsletter/language"

type Styles = Record<string, string>

const capitalise = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

// Two quiet glyphs drawn in currentColor, so they follow the theme like text.
const ListIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false">
    <path
      d="M2 4h12M2 8h12M2 12h8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false">
    <rect
      x="2"
      y="3"
      width="12"
      height="11"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

// The edition's top bar: the way out to every edition, and a calendar that
// opens in the page's own flow, under the bar, pushing the edition down
// rather than floating over it. It is a disclosure, not a dialog: nothing is
// trapped, Escape closes it and gives focus back to its button.
export const EditionBar = ({
  date,
  dates,
  lang,
  styles,
  children,
}: {
  date: string
  dates: string[]
  lang: Lang
  styles: Styles
  children: ReactNode
}) => {
  const copy = COPY[lang]
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useDismiss(open, () => setOpen(false), [toggle, panel])

  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      toggle.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <div className={styles.topBar}>
        <nav
          className={styles.topNav}
          aria-label={lang === "fr" ? "Navigation des éditions" : "Editions"}
        >
          <Link href={newsletterHref({ editions: true }, lang)}>
            <ListIcon />
            <span>{copy.editions}</span>
          </Link>
          <button
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <CalendarIcon />
            <span>{copy.calendar}</span>
          </button>
        </nav>
        <div className={styles.mastTools}>{children}</div>
      </div>
      <div ref={panel} id={panelId} hidden={!open}>
        {open && (
          <EditionCalendar
            date={date}
            dates={dates}
            lang={lang}
            styles={styles}
          />
        )}
      </div>
    </>
  )
}

const EditionCalendar = ({
  date,
  dates,
  lang,
  styles,
}: {
  date: string
  dates: string[]
  lang: Lang
  styles: Styles
}) => {
  const copy = COPY[lang]
  const available = new Set(dates)
  const bounds = monthBounds(dates)
  const [month, setMonth] = useState(monthOf(date))
  const captionId = useId()
  const hasPrevious = bounds !== null && month > bounds.first
  const hasNext = bounds !== null && month < bounds.last

  // Page Up and Page Down turn the month, as in a date picker.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "PageUp" && hasPrevious) {
      event.preventDefault()
      setMonth(shiftMonth(month, -1))
    }
    if (event.key === "PageDown" && hasNext) {
      event.preventDefault()
      setMonth(shiftMonth(month, 1))
    }
  }

  return (
    <div
      className={styles.calendar}
      role="group"
      aria-label={copy.calendarLabel}
      onKeyDown={onKeyDown}
    >
      <div className={styles.calendarHead}>
        <button
          type="button"
          aria-label={copy.previousMonth}
          disabled={!hasPrevious}
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          <span aria-hidden>←</span>
        </button>
        <p id={captionId} aria-live="polite" className={styles.calendarMonth}>
          {capitalise(formatMonth(month, lang))}
        </p>
        <button
          type="button"
          aria-label={copy.nextMonth}
          disabled={!hasNext}
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          <span aria-hidden>→</span>
        </button>
      </div>
      <table className={styles.calendarGrid} aria-labelledby={captionId}>
        <thead>
          <tr>
            {weekdays(lang).map((day) => (
              <th key={day.long} scope="col" abbr={day.long}>
                {day.short.replace(".", "")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(month).map((week) => (
            <tr key={week.find(Boolean)}>
              {week.map((day, index) => {
                if (!day) return <td key={`empty-${index}`} />
                const label = capitalise(formatEditionDate(day, lang))
                const number = Number(day.slice(8))
                if (!available.has(day))
                  return (
                    <td key={day} data-empty>
                      <span aria-hidden>{number}</span>
                      <span className={styles.visuallyHidden}>
                        {label}, {copy.noEdition}
                      </span>
                    </td>
                  )
                return (
                  <td key={day}>
                    <Link
                      href={newsletterHref({ date: day }, lang)}
                      aria-label={
                        day === date ? `${label}, ${copy.current}` : label
                      }
                      aria-current={day === date ? "page" : undefined}
                    >
                      {number}
                    </Link>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
