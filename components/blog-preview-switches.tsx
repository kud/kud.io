"use client"

import { useEffect, useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import { BLOG_ROOT_ID } from "@/components/blog-theme"

// Preview switches for design candidates: ?bar=N, ?meta=N, ?footer=N. A value
// in the URL is remembered for the tab (sessionStorage), so one visit to
// ?meta=2 holds across post -> /blog -> post. ?name=0 forgets it. Absent or 0
// is today's rendering. This file goes when a candidate wins.
const NAMES = ["bar", "meta", "footer"] as const

export type PreviewSwitch = (typeof NAMES)[number]

type Values = Record<PreviewSwitch, number>

const storageKey = (name: PreviewSwitch) => `blog-preview:${name}`

const parse = (raw: string | null) => (raw && /^\d$/.test(raw) ? Number(raw) : 0)

const NONE: Values = { bar: 0, meta: 0, footer: 0 }

// One parse, shared: the component resolves, hooks subscribe. Before mount
// every switch reads 0, which is also what the server rendered.
let current = NONE
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const publish = (next: Values) => {
  if (NAMES.every((name) => next[name] === current[name])) return
  current = next
  listeners.forEach((listener) => listener())
}

const resolve = (): Values => {
  const params = new URLSearchParams(location.search)
  const next = { ...NONE }
  for (const name of NAMES) {
    const fromUrl = params.get(name)
    try {
      if (fromUrl !== null) {
        const value = parse(fromUrl)
        if (value === 0) sessionStorage.removeItem(storageKey(name))
        else sessionStorage.setItem(storageKey(name), String(value))
        next[name] = value
      } else {
        next[name] = parse(sessionStorage.getItem(storageKey(name)))
      }
    } catch {
      next[name] = parse(fromUrl)
    }
  }
  return next
}

const stamp = (values: Values) => {
  const root = document.getElementById(BLOG_ROOT_ID)
  if (!root) return
  for (const name of NAMES) {
    if (values[name] === 0) root.removeAttribute(`data-${name}`)
    else root.setAttribute(`data-${name}`, String(values[name]))
  }
}

export const usePreviewSwitch = (name: PreviewSwitch): number =>
  useSyncExternalStore(
    subscribe,
    () => current[name],
    () => 0,
  )

export const BlogPreviewSwitches = () => {
  const pathname = usePathname()

  // Re-resolved on every route change: the layout (and so this component)
  // outlives navigation, and a ?param on the landing URL must not be the only
  // moment the switches are read.
  useEffect(() => {
    const values = resolve()
    stamp(values)
    publish(values)
  }, [pathname])

  return null
}
