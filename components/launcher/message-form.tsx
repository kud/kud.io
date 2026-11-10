"use client"

import { useLayoutEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { ArrowLeft, Check, Copy } from "lucide-react"
import styles from "./launcher.module.css"

// The address the home page publishes; the +site tag says where it came from.
export const CONTACT_ADDRESS = "m+site@kud.io"

const FALLBACK_SUBJECT = "A message from kud.io"

// RFC 6068 wants line breaks as CRLF; encodeURIComponent then makes them
// %0D%0A, which every mail client keeps as a new line.
export const mailtoHref = (subject: string, body: string) => {
  const encode = (text: string) =>
    encodeURIComponent(text.replace(/\r?\n/g, "\r\n"))
  return `mailto:${CONTACT_ADDRESS}?subject=${encode(
    subject.trim() || FALLBACK_SUBJECT,
  )}&body=${encode(body)}`
}

export type MessageDraft = { subject: string; body: string }

type Props = {
  draft: MessageDraft
  onDraft: (draft: MessageDraft) => void
  onBack: () => void
  onCopy: () => void
  copied: boolean
  announce: (text: string) => void
}

// The launcher's detail view: a short form that hands the message to the
// visitor's own mail app. No "your email" field: the mail app sends from
// their address already, and a typed one could only be wrong.
export const MessageForm = ({
  draft,
  onDraft,
  onBack,
  onCopy,
  copied,
  announce,
}: Props) => {
  const subjectRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [handed, setHanded] = useState(false)
  const [mod] = useState(() =>
    /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl",
  )

  useLayoutEffect(() => {
    subjectRef.current?.focus()
  }, [])

  const send = () => {
    if (!draft.body.trim()) {
      announce("Write a message first")
      bodyRef.current?.focus()
      return
    }
    window.location.href = mailtoHref(draft.subject, draft.body)
    setHanded(true)
    announce("Opening your mail app")
  }

  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    const field = event.target as HTMLInputElement | HTMLTextAreaElement
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      send()
    } else if (event.key === "Enter" && field === subjectRef.current) {
      event.preventDefault()
      bodyRef.current?.focus()
    } else if (
      event.key === "Backspace" &&
      !field.value &&
      !draft.subject &&
      !draft.body
    ) {
      event.preventDefault()
      onBack()
    }
  }

  return (
    <form
      className={styles.panel}
      aria-labelledby="launcher-message-title"
      onKeyDown={onKeyDown}
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Back to search"
        >
          <ArrowLeft aria-hidden className={styles.backIcon} />
        </button>
        <h2 id="launcher-message-title" className={styles.formTitle}>
          Send me a message
        </h2>
        <span className={styles.formHint} aria-hidden>
          <kbd>esc</kbd> back
        </span>
      </div>

      <div className={styles.form}>
        <p className={styles.formTo}>
          To <span className={styles.formAddress}>{CONTACT_ADDRESS}</span>
        </p>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            Subject <span className={styles.fieldHint}>optional</span>
          </span>
          <input
            ref={subjectRef}
            className={styles.fieldInput}
            value={draft.subject}
            onChange={(event) =>
              onDraft({ ...draft, subject: event.target.value })
            }
            placeholder={FALLBACK_SUBJECT}
            enterKeyHint="next"
            autoComplete="off"
          />
        </label>
        <label className={`${styles.field} ${styles.fieldGrow}`}>
          <span className={styles.fieldLabel}>Message</span>
          <textarea
            ref={bodyRef}
            className={`${styles.fieldInput} ${styles.fieldArea}`}
            value={draft.body}
            onChange={(event) =>
              onDraft({ ...draft, body: event.target.value })
            }
            placeholder="Hi Erwann, …"
            rows={6}
          />
        </label>
        {handed ? (
          <p className={styles.formNote}>
            Handed to your mail app. Nothing opened? Copy the address and write
            from wherever you like.
          </p>
        ) : null}
      </div>

      <div className={styles.formFoot}>
        <button type="button" className={styles.ghost} onClick={onCopy}>
          {copied ? (
            <Check aria-hidden className={styles.ghostIcon} />
          ) : (
            <Copy aria-hidden className={styles.ghostIcon} />
          )}
          {copied ? "Copied" : "Copy address"}
        </button>
        <button type="submit" className={styles.primary}>
          Open in mail app
          <span className={styles.primaryKeys} aria-hidden>
            <kbd>{mod}</kbd>
            <kbd>↵</kbd>
          </span>
        </button>
      </div>
    </form>
  )
}
