"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Headphones, Pause, Play, Square } from "lucide-react"
import type { Lang } from "@/lib/newsletter/language"
import { chunkText, cleanSpokenText, pickVoice } from "@/lib/newsletter/speech"

// Listen: the edition read aloud by the browser's own voice (the Web Speech
// API's speechSynthesis). Nothing leaves the device and nothing is paid for;
// where the browser has no speech synthesis the control is not drawn at all.
// It reads the edition's <article> in order, block by block, skipping what is
// marked data-listen="skip" (the meta line, the contents, the sources), and
// marks the block being read so the eye can follow.

const LABELS = {
  fr: {
    listen: "Écouter",
    listenLong: "Écouter l’édition",
    pause: "Pause",
    resume: "Reprendre",
    stop: "Arrêter",
  },
  en: {
    listen: "Listen",
    listenLong: "Listen to the edition",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
  },
} as const

const BLOCKS = "h1, h2, h3, h4, p, li, blockquote, dt, dd"
const SKIP = '[data-listen="skip"]'
const UNSPOKEN =
  '[aria-hidden="true"], sup, code, pre, button, input, svg, script, style, [data-listen="skip"]'

type Chunk = { element: HTMLElement; text: string }

// The leaf blocks of the article in reading order: a list item that holds
// paragraphs is read through its paragraphs, not twice.
const collect = (root: HTMLElement): Chunk[] => {
  const candidates = [...root.querySelectorAll<HTMLElement>(BLOCKS)].filter(
    (element) => !element.closest(SKIP),
  )
  const leaves = candidates.filter(
    (element) =>
      !candidates.some((other) => other !== element && element.contains(other)),
  )
  return leaves.flatMap((element) => {
    let raw = element.dataset.listenText
    if (!raw) {
      const clone = element.cloneNode(true) as HTMLElement
      clone.querySelectorAll(UNSPOKEN).forEach((node) => node.remove())
      raw = clone.textContent ?? ""
    }
    const text = cleanSpokenText(raw)
    return text
      ? chunkText(text).map((piece) => ({ element, text: piece }))
      : []
  })
}

const subscribe = () => () => {}
const hasSpeech = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

type State = "idle" | "playing" | "paused"

export const Listen = ({
  lang,
  articleId,
  className,
  stopClassName,
}: {
  lang: Lang
  articleId: string
  className?: string
  stopClassName?: string
}) => {
  const supported = useSyncExternalStore(subscribe, hasSpeech, () => false)
  const labels = LABELS[lang]
  const [state, setState] = useState<State>("idle")

  const chunks = useRef<Chunk[]>([])
  const index = useRef(0)
  // Each start or stop bumps the run; an utterance from an older run (one
  // cancel() interrupted) is ignored when its end or error arrives.
  const run = useRef(0)
  // Held so the engine cannot drop an utterance before it ends (Chrome may
  // otherwise never fire its end event).
  const current = useRef<SpeechSynthesisUtterance | null>(null)
  const voices = useRef<SpeechSynthesisVoice[]>([])
  const marked = useRef<HTMLElement | null>(null)

  const mark = (element: HTMLElement | null) => {
    if (marked.current === element) return
    marked.current?.removeAttribute("data-speaking")
    marked.current = element
    if (!element) return
    element.setAttribute("data-speaking", "")
    const box = element.getBoundingClientRect()
    if (box.top < 0 || box.bottom > window.innerHeight)
      element.scrollIntoView({
        block: "center",
        behavior: reducedMotion() ? "auto" : "smooth",
      })
  }

  const finish = () => {
    run.current += 1
    window.speechSynthesis.cancel()
    current.current = null
    index.current = 0
    mark(null)
    setState("idle")
  }

  const speakFrom = (position: number, token: number) => {
    if (token !== run.current) return
    const chunk = chunks.current[position]
    if (!chunk) {
      finish()
      return
    }
    index.current = position
    const utterance = new SpeechSynthesisUtterance(chunk.text)
    utterance.lang = lang === "fr" ? "fr-FR" : "en-GB"
    const voice = pickVoice(voices.current, lang)
    try {
      if (voice) utterance.voice = voice
    } catch {
      // A voice the engine no longer accepts: lang alone picks one.
    }
    utterance.onstart = () => {
      if (token === run.current) mark(chunk.element)
    }
    utterance.onend = () => speakFrom(position + 1, token)
    utterance.onerror = (event) => {
      if (event.error === "interrupted" || event.error === "canceled") return
      // No voice at all, or speech refused: stop rather than race through.
      if (
        event.error === "not-allowed" ||
        event.error === "synthesis-unavailable" ||
        event.error === "language-unavailable" ||
        event.error === "voice-unavailable"
      ) {
        if (token === run.current) finish()
        return
      }
      speakFrom(position + 1, token)
    }
    current.current = utterance
    try {
      window.speechSynthesis.speak(utterance)
      // Some engines start paused after an earlier pause(); never rely on it.
      window.speechSynthesis.resume()
    } catch {
      finish()
    }
  }

  const play = () => {
    if (state === "idle") {
      const article = document.getElementById(articleId)
      chunks.current = article ? collect(article) : []
      index.current = 0
    }
    run.current += 1
    const token = run.current
    window.speechSynthesis.cancel()
    setState("playing")
    speakFrom(index.current, token)
  }

  // Pausing is a cancel that keeps its place: speechSynthesis.pause() is
  // unreliable across engines, and the piece in progress is short enough to
  // start again.
  const pause = () => {
    run.current += 1
    window.speechSynthesis.cancel()
    current.current = null
    setState("paused")
  }

  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const load = () => {
      voices.current = synth.getVoices()
    }
    load()
    synth.addEventListener?.("voiceschanged", load)
    // Leaving the page must not leave the voice talking.
    const stop = () => {
      run.current += 1
      synth.cancel()
    }
    window.addEventListener("pagehide", stop)
    return () => {
      synth.removeEventListener?.("voiceschanged", load)
      window.removeEventListener("pagehide", stop)
      stop()
      marked.current?.removeAttribute("data-speaking")
    }
  }, [supported])

  if (!supported) return null

  const playing = state === "playing"
  const label = playing
    ? labels.pause
    : state === "paused"
      ? labels.resume
      : labels.listen
  const Icon = playing ? Pause : state === "paused" ? Play : Headphones

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={playing ? pause : play}
        aria-label={state === "idle" ? labels.listenLong : label}
        data-state={state}
      >
        <Icon size={14} strokeWidth={1.75} aria-hidden />
        <span>{label}</span>
      </button>
      {state !== "idle" && (
        <button
          type="button"
          className={stopClassName ?? className}
          onClick={finish}
          aria-label={labels.stop}
        >
          <Square size={12} strokeWidth={1.75} aria-hidden />
          <span>{labels.stop}</span>
        </button>
      )}
    </>
  )
}
