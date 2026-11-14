import type { Lang } from "./language.ts"

// The calendar that jumps to any edition. Pure, so the month grid can be
// tested without a browser: dates are calendar days ("YYYY-MM-DD"), months are
// "YYYY-MM", and every computation runs at UTC midnight so no time zone can
// move a day into its neighbour.

const LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-GB" }

const utc = (day: string) => new Date(`${day}T00:00:00Z`)

export const monthOf = (date: string) => date.slice(0, 7)

export const shiftMonth = (month: string, delta: number) => {
  const day = utc(`${month}-01`)
  day.setUTCMonth(day.getUTCMonth() + delta)
  return day.toISOString().slice(0, 7)
}

// Weeks start on Monday in both languages: French and British calendars
// agree, so the grid is the same shape whichever language reads it.
// Each week is seven cells; a cell outside the month is null.
export const monthGrid = (month: string): (string | null)[][] => {
  const first = utc(`${month}-01`)
  const lead = (first.getUTCDay() + 6) % 7
  const next = utc(`${shiftMonth(month, 1)}-01`)
  const length = Math.round((next.getTime() - first.getTime()) / 86_400_000)
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from(
      { length },
      (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`,
    ),
  ]
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, week) =>
    cells.slice(week * 7, week * 7 + 7),
  )
}

// Monday to Sunday, short for the column head and long for its abbr.
// 2024-01-01 was a Monday.
export const weekdays = (lang: Lang) =>
  Array.from({ length: 7 }, (_, index) => {
    const day = utc(`2024-01-0${index + 1}`)
    const name = (weekday: "short" | "long") =>
      new Intl.DateTimeFormat(LOCALE[lang], {
        timeZone: "UTC",
        weekday,
      }).format(day)
    return { short: name("short"), long: name("long") }
  })

// The months a reader can page through: from the oldest edition's to the
// newest's, so the arrows never lead to a run of empty months.
export const monthBounds = (dates: string[]) => {
  const months = dates.map(monthOf).sort()
  return months.length
    ? { first: months[0], last: months[months.length - 1] }
    : null
}
