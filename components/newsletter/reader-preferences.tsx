"use client"

import { useEffect, useState } from "react"
import type { Lang } from "@/lib/newsletter/language"

// Reading preferences, after the ones ai-feed-digest offers, cut to what
// kud.io can honour without a new web font: the site's sans, a system serif
// for a newspaper feel, and the site's mono. Size and measure each have three
// steps. They are stamped as data attributes on the edition root, before
// paint by READER_SCRIPT and afterwards from here, and the CSS reads them.
// Per reader, in localStorage, wrapped: storage may be blocked.

export const READER_PREFS = {
  font: {
    key: "kud.newsletter.font",
    values: ["sans", "serif", "mono"],
    fallback: "sans",
  },
  size: { key: "kud.newsletter.size", values: ["s", "m", "l"], fallback: "m" },
  width: {
    key: "kud.newsletter.width",
    values: ["narrow", "normal", "wide"],
    fallback: "normal",
  },
} as const

type Pref = keyof typeof READER_PREFS

const LABELS: Record<
  Lang,
  { title: string } & Record<
    Pref,
    { legend: string; options: Record<string, string> }
  >
> = {
  fr: {
    title: "Lecture",
    font: {
      legend: "Police",
      options: { sans: "Moderne", serif: "Journal", mono: "Mono" },
    },
    size: {
      legend: "Taille",
      options: { s: "Petite", m: "Normale", l: "Grande" },
    },
    width: {
      legend: "Largeur",
      options: { narrow: "Étroite", normal: "Normale", wide: "Large" },
    },
  },
  en: {
    title: "Reading",
    font: {
      legend: "Typeface",
      options: { sans: "Modern", serif: "Journal", mono: "Mono" },
    },
    size: { legend: "Size", options: { s: "Small", m: "Normal", l: "Large" } },
    width: {
      legend: "Width",
      options: { narrow: "Narrow", normal: "Normal", wide: "Wide" },
    },
  },
}

const PREFS = Object.keys(READER_PREFS) as Pref[]

// Replays stored choices onto the element it sits in, before first paint.
export const READER_SCRIPT = `try{var e=document.currentScript.parentElement,p=${JSON.stringify(
  Object.fromEntries(
    PREFS.map((pref) => [
      pref,
      [READER_PREFS[pref].key, READER_PREFS[pref].values],
    ]),
  ),
)};for(var k in p){var v=localStorage.getItem(p[k][0]);if(p[k][1].indexOf(v)>=0)e.dataset[k]=v}}catch(e){}`

const read = (pref: Pref): string => {
  const { key, values, fallback } = READER_PREFS[pref]
  try {
    const stored = localStorage.getItem(key)
    if (stored && (values as readonly string[]).includes(stored)) return stored
  } catch {}
  return fallback
}

export const ReaderPreferences = ({
  lang,
  rootId,
  styles,
}: {
  lang: Lang
  rootId: string
  styles: Record<string, string>
}) => {
  const labels = LABELS[lang]
  const [prefs, setPrefs] = useState<Record<Pref, string>>({
    font: READER_PREFS.font.fallback,
    size: READER_PREFS.size.fallback,
    width: READER_PREFS.width.fallback,
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs({ font: read("font"), size: read("size"), width: read("width") })
  }, [])

  const choose = (pref: Pref, value: string) => {
    setPrefs((previous) => ({ ...previous, [pref]: value }))
    const root = document.getElementById(rootId)
    if (root) root.dataset[pref] = value
    try {
      localStorage.setItem(READER_PREFS[pref].key, value)
    } catch {
      // Not persisted; this visit still reads as chosen.
    }
  }

  return (
    <details className={styles.prefs}>
      <summary>
        <span aria-hidden className={styles.prefsMark}>
          Aa
        </span>
        {labels.title}
      </summary>
      <div className={styles.prefsPanel}>
        {PREFS.map((pref) => (
          <fieldset key={pref} className={styles.prefsGroup}>
            <legend>{labels[pref].legend}</legend>
            {READER_PREFS[pref].values.map((value) => (
              <label key={value} data-value={value}>
                <input
                  type="radio"
                  name={`reader-${pref}`}
                  value={value}
                  checked={prefs[pref] === value}
                  onChange={() => choose(pref, value)}
                />
                <span>{labels[pref].options[value]}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
    </details>
  )
}
