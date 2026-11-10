"use client"

import { useSyncExternalStore } from "react"

// A release's age in words, worked out in the browser so a static page never
// shows a stale "today". Empty on the server and past two months; the short
// date beside it shows then, and the CSS shows one or the other.
const DAY = 86_400_000

const label = (iso: string): string => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY)
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 14) return "last week"
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`
  return ""
}

const noop = () => () => {}

export const RelativeDate = ({
  iso,
  className,
}: {
  iso: string
  className?: string
}) => {
  const text = useSyncExternalStore(
    noop,
    () => label(iso),
    () => "",
  )
  return <span className={className}>{text}</span>
}
