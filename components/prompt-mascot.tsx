"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./prompt-mascot.module.css"

// A pool of lines per trigger type, so it doesn't repeat itself.
const MESSAGES: Record<string, string[]> = {
  greeting: [
    "Coucou! It's me 👋",
    "It's me!",
    "Hey, that's me!",
    "Oh, hi there!",
  ],
  contact: [
    "Got an idea? Let's build it!",
    "Let's talk!",
    "Drop me a line — I reply!",
    "Say hi, don't be shy!",
  ],
  history: [
    "Psst — the whole story's here!",
    "Curious? It's all on LinkedIn.",
    "Want the full journey?",
    "18 years, all in one place!",
  ],
  tickets: [
    "Not a Jira fan either — but the MCP saves it 😅",
    "Jira? Meh. At least there's an MCP for it.",
    "Tickets are fine… once they're MCP-driven.",
  ],
  cv: [
    "Grab it — the tidy PDF version!",
    "My whole career, one click.",
    "Fresh off the build — enjoy!",
    "Want it on paper? Here you go!",
  ],
}

const pickLine = (type: string): string => {
  const pool = MESSAGES[type]
  if (!pool || pool.length === 0) return "Coucou!"
  return pool[Math.floor(Math.random() * pool.length)]
}

// The window title doubles as the "command" behind each line — a wink that ties
// the title bar to whatever you hovered.
const TITLES: Record<string, string> = {
  greeting: "whoami",
  contact: "say-hi.sh",
  history: "git log",
  tickets: "jira 🙄",
  cv: "cat cv.pdf",
}

const TYPE_SPEED_MS = 42

// One shared terminal mascot. Any element with a [data-mascot="<type>"] attribute
// summons it on hover: a small terminal window rises up and types a random line
// for that type, with a blinking cursor. Otherwise it stays below the edge.
export const PromptMascot = () => {
  const [message, setMessage] = useState<string | null>(null)
  const [typed, setTyped] = useState("It's me!")
  const [title, setTitle] = useState("zsh")

  // Typewriter: retype from empty whenever a new line is summoned.
  useEffect(() => {
    if (!message) return
    setTyped("")
    let index = 0
    const id = window.setInterval(() => {
      index += 1
      setTyped(message.slice(0, index))
      if (index >= message.length) window.clearInterval(id)
    }, TYPE_SPEED_MS)
    return () => window.clearInterval(id)
  }, [message])

  useEffect(() => {
    const triggers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-mascot]"),
    )
    const show = (event: Event) => {
      const type = (event.currentTarget as HTMLElement).dataset.mascot
      if (!type) return
      setTitle(TITLES[type] ?? "zsh")
      setMessage(pickLine(type))
    }
    const hide = () => setMessage(null)
    for (const trigger of triggers) {
      trigger.addEventListener("mouseenter", show)
      trigger.addEventListener("mouseleave", hide)
    }
    return () => {
      for (const trigger of triggers) {
        trigger.removeEventListener("mouseenter", show)
        trigger.removeEventListener("mouseleave", hide)
      }
    }
  }, [])

  return (
    <div className={`${styles.term} ${message ? styles.peek : ""}`} aria-hidden>
      <div className={styles.bar}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.body}>
        <span className={styles.prompt}>❯</span>
        <span className={styles.text}>{typed}</span>
        <span className={styles.cursor} />
      </div>
    </div>
  )
}
