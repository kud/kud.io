"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { X } from "lucide-react"
import type { Edition } from "@/lib/newsletter/content"
import { COPY, type Lang } from "@/lib/newsletter/language"
import { buildResearchPrompt } from "@/lib/newsletter/prompt"

// Selection is page state and nothing else: it is not stored, not sent, and
// gone on reload. The prompt is assembled locally by buildResearchPrompt and
// only leaves the page through the reader's own clipboard.

type Selection = {
  selected: ReadonlySet<string>
  toggle: (id: string, on: boolean) => void
  clear: () => void
}

type ResearchEdition = Pick<Edition, "date" | "items" | "narrative">

const SelectionContext = createContext<Selection | null>(null)

type Styles = Record<string, string>

export const SelectionProvider = ({
  edition,
  lang,
  styles,
  children,
}: {
  edition: ResearchEdition
  lang: Lang
  styles: Styles
  children: ReactNode
}) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const toggle = useCallback((id: string, on: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])
  const clear = useCallback(() => setSelected(new Set()), [])
  const value = useMemo(
    () => ({ selected, toggle, clear }),
    [selected, toggle, clear],
  )

  return (
    <SelectionContext.Provider value={value}>
      {children}
      <ResearchBar edition={edition} lang={lang} styles={styles} />
    </SelectionContext.Provider>
  )
}

const useSelection = () => {
  const selection = useContext(SelectionContext)
  if (!selection) throw new Error("ItemSelect outside SelectionProvider")
  return selection
}

// The visible word is short ("Select"); the accessible name carries the item,
// so a screen reader hears "Select 01 · Title" rather than eight "Select"s.
export const ItemSelect = ({
  id,
  title,
  lang,
  className,
  hiddenClassName,
}: {
  id: string
  title: string
  lang: Lang
  className?: string
  hiddenClassName?: string
}) => {
  const { selected, toggle } = useSelection()
  const label = COPY[lang].select(id, title)
  const word = lang === "fr" ? "Sélectionner" : "Select"
  return (
    <label className={className}>
      <input
        type="checkbox"
        checked={selected.has(id)}
        onChange={(event) => toggle(id, event.target.checked)}
      />
      <span aria-hidden>{word}</span>
      <span className={hiddenClassName}>{label}</span>
    </label>
  )
}

const ResearchBar = ({
  edition,
  lang,
  styles,
}: {
  edition: ResearchEdition
  lang: Lang
  styles: Styles
}) => {
  const { selected, clear } = useSelection()
  const copy = COPY[lang]
  const [status, setStatus] = useState("")
  const [fallback, setFallback] = useState<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const area = useRef<HTMLTextAreaElement>(null)
  const count = selected.size

  useEffect(() => {
    if (!status) return
    const timer = window.setTimeout(() => setStatus(""), 4000)
    return () => window.clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (fallback === null) return
    dialog.current?.showModal()
    area.current?.focus()
    area.current?.select()
  }, [fallback])

  const copyPrompt = async () => {
    const text = buildResearchPrompt(edition, selected, lang)
    try {
      await navigator.clipboard.writeText(text)
      setStatus(copy.copied)
    } catch {
      // No clipboard (an older browser, an insecure context, a denied
      // permission): hand the text over selected, ready for the reader's
      // own copy.
      setFallback(text)
    }
  }

  return (
    <>
      <div
        className={styles.bar}
        data-open={count > 0 || status ? "" : undefined}
        aria-hidden={count === 0 && !status}
        inert={count === 0 && !status}
      >
        {/* Labels come long and short; CSS shows one per width, and
            display: none keeps the other out of the accessible name. On a
            phone the count is a bare number, its words kept for readers. */}
        <p className={styles.barCount} data-status={status ? "" : undefined}>
          {status ? (
            <>
              <span className={styles.barLong}>{status}</span>
              <span className={styles.barShort}>{copy.copiedShort}</span>
            </>
          ) : (
            <>
              <span className={styles.barNumber} aria-hidden>
                {count}
              </span>
              <span className={styles.barLong}>{copy.selected(count)}</span>
            </>
          )}
        </p>
        {count > 0 && (
          <div className={styles.barActions}>
            <button type="button" className={styles.barQuiet} onClick={clear}>
              <X className={styles.barIcon} aria-hidden />
              <span className={styles.barQuietWord}>{copy.clear}</span>
            </button>
            <button
              type="button"
              className={styles.barPrimary}
              onClick={copyPrompt}
            >
              <span className={styles.barLong}>{copy.copyPrompt}</span>
              <span className={styles.barShort}>{copy.copyPromptShort}</span>
            </button>
          </div>
        )}
      </div>
      <p role="status" className={styles.visuallyHidden}>
        {status}
      </p>
      <dialog
        ref={dialog}
        className={styles.fallback}
        onClose={() => setFallback(null)}
        aria-labelledby="research-fallback-title"
      >
        <p id="research-fallback-title">{copy.copyFallback}</p>
        <textarea
          ref={area}
          readOnly
          value={fallback ?? ""}
          rows={12}
          onFocus={(event) => event.currentTarget.select()}
        />
        <form method="dialog">
          <button className={styles.barPrimary}>{copy.close}</button>
        </form>
      </dialog>
    </>
  )
}

// Copies the address of one story, edition and anchor included. The link is
// the canonical dated one, so it still points at the same story tomorrow.
export const ShareItem = ({
  href,
  title,
  lang,
  className,
  hiddenClassName,
}: {
  href: string
  title: string
  lang: Lang
  className?: string
  hiddenClassName?: string
}) => {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!done) return
    const timer = window.setTimeout(() => setDone(false), 2500)
    return () => window.clearTimeout(timer)
  }, [done])
  const word = lang === "fr" ? "Partager" : "Share"
  const copied = lang === "fr" ? "Lien copié" : "Link copied"
  const share = async () => {
    const url = new URL(href, location.origin).toString()
    try {
      await navigator.clipboard.writeText(url)
      setDone(true)
    } catch {
      window.prompt(word, url)
    }
  }
  return (
    <button type="button" className={className} onClick={share}>
      <span aria-hidden>{done ? copied : word}</span>
      <span className={hiddenClassName}>
        {done ? copied : `${word} ${title}`}
      </span>
    </button>
  )
}
