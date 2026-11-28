"use client"

import { useEffect, useRef, useState } from "react"
import { useDismiss } from "@/components/newsletter/use-dismiss"
import type { Lang } from "@/lib/newsletter/language"
import {
  chatGptUrl,
  listenPrompt,
  markdownHref,
} from "@/lib/newsletter/markdown"

// "For an AI": a ready prompt that asks an assistant to read this edition
// aloud from its Markdown (lib/newsletter/markdown.ts), copied to the
// clipboard, or opened prefilled in ChatGPT, whose ?q= fills the composer
// without sending. Claude's web app has no documented prefill link, so the
// copied prompt is the way there. Nothing is sent from this page.

const LABELS = {
  fr: {
    title: "Pour une IA",
    hint: "Un prompt prêt à coller dans l’assistant de votre choix, pour qu’il vous lise l’édition à voix haute.",
    copy: "Copier le prompt",
    copied: "Prompt copié",
    failed: "La copie n’a pas fonctionné\u00a0: le prompt est ci-dessus.",
    chatgpt: "Ouvrir dans ChatGPT",
    markdown: "Version Markdown",
  },
  en: {
    title: "For an AI",
    hint: "A prompt ready to paste into the assistant of your choice, so it reads the edition to you aloud.",
    copy: "Copy the prompt",
    copied: "Prompt copied",
    failed: "Copying didn’t work: the prompt is above.",
    chatgpt: "Open in ChatGPT",
    markdown: "Markdown version",
  },
} as const

type Styles = Record<string, string>

export const AskAi = ({
  date,
  lang,
  styles,
}: {
  date: string
  lang: Lang
  styles: Styles
}) => {
  const labels = LABELS[lang]
  const prompt = listenPrompt(date, lang)
  const panel = useRef<HTMLDetailsElement>(null)
  const text = useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle")
  const close = () => {
    if (panel.current) panel.current.open = false
  }
  useDismiss(open, close, [panel])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      close()
      panel.current?.querySelector("summary")?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setStatus("copied")
    } catch {
      // Leave the prompt selected so the reader can copy it by hand.
      const range = document.createRange()
      if (text.current) range.selectNodeContents(text.current)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      setStatus("failed")
    }
  }

  return (
    <details
      ref={panel}
      className={styles.prefs}
      onToggle={(event) => {
        setOpen(event.currentTarget.open)
        setStatus("idle")
      }}
    >
      <summary>
        <span aria-hidden className={styles.prefsMark}>
          {lang === "fr" ? "IA" : "AI"}
        </span>
        <span className={styles.toolLabel}>{labels.title}</span>
      </summary>
      <div className={styles.prefsPanel}>
        <p className={styles.aiHint}>{labels.hint}</p>
        <p
          ref={text}
          className={styles.aiPrompt}
          lang={lang === "fr" ? "fr" : "en-GB"}
        >
          {prompt}
        </p>
        <div className={styles.aiActions}>
          <button type="button" onClick={copy} className={styles.aiPrimary}>
            {status === "copied" ? labels.copied : labels.copy}
          </button>
          <a href={chatGptUrl(prompt)} target="_blank" rel="noreferrer">
            {labels.chatgpt} <span aria-hidden>↗</span>
          </a>
          <a href={markdownHref(date, lang)} type="text/markdown">
            {labels.markdown}
          </a>
        </div>
        <p className={styles.aiStatus} role="status">
          {status === "failed" ? labels.failed : ""}
        </p>
      </div>
    </details>
  )
}
