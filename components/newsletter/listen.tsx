"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Lang } from "@/lib/newsletter/language"
import type { Passage } from "@/lib/newsletter/listen"
import { pickVoice, SPEECH_LANG } from "@/lib/newsletter/voice"

// Reads the edition aloud with the browser's own speech synthesis: no server,
// no audio files. The passages arrive already spoken-ready from the server
// (lib/newsletter/listen), one per paragraph, and are queued one at a time.
// Pause cancels the current paragraph and Resume starts it again from its
// first word: Chrome's own pause and resume are unreliable, and a paragraph is
// short enough to hear twice. Without speech synthesis, or without a voice in
// the page's language, nothing renders.

type State = "idle" | "playing" | "paused"

const LABELS: Record<
  Lang,
  {
    listen: string
    pause: string
    resume: string
    stop: string
    status: Record<State | "ended", string>
  }
> = {
  fr: {
    listen: "Écouter",
    pause: "Pause",
    resume: "Reprendre",
    stop: "Arrêter la lecture",
    status: {
      idle: "Lecture arrêtée",
      playing: "Lecture à voix haute en cours",
      paused: "Lecture en pause",
      ended: "Fin de l’édition",
    },
  },
  en: {
    listen: "Listen",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop reading",
    status: {
      idle: "Stopped reading",
      playing: "Reading aloud",
      paused: "Paused",
      ended: "End of the edition",
    },
  },
}

const MARK = "listening"

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden focusable="false">
    <path d="M4.5 2.8v10.4L13 8z" fill="currentColor" />
  </svg>
)

const PauseIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden focusable="false">
    <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
  </svg>
)

const StopIcon = () => (
  <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden focusable="false">
    <rect x="3" y="3" width="10" height="10" rx="1.5" fill="currentColor" />
  </svg>
)

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

// Brings the passage being read into view, only when it has drifted out of
// the upper half of the window, so the page does not twitch at every
// paragraph of a story already on screen.
const follow = (element: HTMLElement) => {
  const { top, bottom } = element.getBoundingClientRect()
  const height = window.innerHeight
  if (top >= 0 && top <= height * 0.5) return
  if (top < 0 && bottom > height * 0.35) return
  window.scrollTo({
    top: window.scrollY + top - 24,
    behavior: reducedMotion() ? "auto" : "smooth",
  })
}

export const Listen = ({
  passages,
  lang,
  styles,
}: {
  passages: Passage[]
  lang: Lang
  styles: Record<string, string>
}) => {
  const labels = LABELS[lang]
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [state, setState] = useState<State>("idle")
  const [announcement, setAnnouncement] = useState("")
  const index = useRef(0)
  // Bumped on every stop and pause: an utterance cancelled by either still
  // fires its end event, and must not advance a queue that has moved on.
  const run = useRef(0)
  const marked = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!("speechSynthesis" in window)) return
    const synth = window.speechSynthesis
    const load = () => setVoice(pickVoice(synth.getVoices(), lang))
    load()
    synth.addEventListener("voiceschanged", load)
    return () => synth.removeEventListener("voiceschanged", load)
  }, [lang])

  const mark = useCallback((target: string | null) => {
    const element = target ? document.getElementById(target) : null
    if (marked.current === element) return
    if (marked.current) delete marked.current.dataset[MARK]
    marked.current = element
    if (element) {
      element.dataset[MARK] = ""
      follow(element)
    }
  }, [])

  const halt = useCallback(() => {
    run.current += 1
    window.speechSynthesis?.cancel()
  }, [])

  const stop = useCallback(
    (announce = true) => {
      halt()
      index.current = 0
      mark(null)
      setState("idle")
      if (announce) setAnnouncement(LABELS[lang].status.idle)
    },
    [halt, lang, mark],
  )

  const speak = useCallback(
    (from: number) => {
      const synth = window.speechSynthesis
      const current = run.current
      const step = (at: number) => {
        if (run.current !== current) return
        const passage = passages[at]
        if (!passage || !voice) {
          index.current = 0
          mark(null)
          setState("idle")
          setAnnouncement(LABELS[lang].status.ended)
          return
        }
        index.current = at
        mark(passage.target)
        const utterance = new SpeechSynthesisUtterance(passage.text)
        utterance.lang = SPEECH_LANG[lang]
        utterance.voice = voice
        utterance.onend = () => step(at + 1)
        utterance.onerror = (event) => {
          if (event.error === "interrupted" || event.error === "canceled")
            return
          step(at + 1)
        }
        synth.speak(utterance)
      }
      step(from)
    },
    [lang, mark, passages, voice],
  )

  const play = () => {
    halt()
    setState("playing")
    setAnnouncement(labels.status.playing)
    // A tick between cancel and speak: Chrome can drop an utterance queued in
    // the same task as a cancel.
    const from = index.current
    const current = run.current
    window.setTimeout(() => {
      if (run.current === current) speak(from)
    }, 0)
  }

  const pause = () => {
    halt()
    setState("paused")
    setAnnouncement(labels.status.paused)
  }

  // Silence on the way out: unmount (a client navigation), a language switch
  // (new passages), or the page itself going away, since some browsers keep
  // speaking after a full navigation.
  useEffect(() => {
    const leave = () => window.speechSynthesis?.cancel()
    window.addEventListener("pagehide", leave)
    return () => {
      window.removeEventListener("pagehide", leave)
      stop(false)
    }
  }, [passages, lang, stop])

  if (!voice || passages.length === 0) return null

  return (
    <span className={styles.listen} data-state={state}>
      <button
        type="button"
        className={styles.listenButton}
        onClick={state === "playing" ? pause : play}
      >
        <span aria-hidden className={styles.listenMark}>
          {state === "playing" ? <PauseIcon /> : <PlayIcon />}
        </span>
        {state === "playing"
          ? labels.pause
          : state === "paused"
            ? labels.resume
            : labels.listen}
      </button>
      {state !== "idle" && (
        <button
          type="button"
          className={`${styles.listenButton} ${styles.listenStop}`}
          aria-label={labels.stop}
          title={labels.stop}
          onClick={() => stop()}
        >
          <StopIcon />
        </button>
      )}
      <span role="status" aria-live="polite" className={styles.visuallyHidden}>
        {announcement}
      </span>
    </span>
  )
}
