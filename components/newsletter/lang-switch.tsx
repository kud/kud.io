"use client"

import { useEffect, type MouseEvent, type SyntheticEvent } from "react"
import {
  LANG_COOKIE,
  LANG_STORAGE_KEY,
  newsletterHref,
  type Lang,
} from "@/lib/newsletter/language"

// A plain link, not a client route: the language is resolved by the proxy
// before the page is served, so a full request is the honest path. Without
// JavaScript it still switches, to the top of the same edition. With it, it
// keeps the reader's place: the item at the top of the window becomes the
// anchor, and the choice is remembered for the next visit.
export const rememberLang = (lang: Lang) => {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // Storage blocked: the cookie below still carries it.
  }
  try {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`
  } catch {
    // Cookies blocked: the explicit ?lang in the link still works.
  }
}

// The switch sits in the masthead, so by the time a reader reaches it they
// have scrolled back to the top. The place worth keeping is the story they
// were reading before that: the last item at the top of the window while
// they were down in the edition, tracked as they scroll.
let lastRead: string | undefined

const itemAtTop = () => {
  for (const item of document.querySelectorAll<HTMLElement>("[data-item]"))
    if (item.getBoundingClientRect().bottom > 96) return item.id
  return undefined
}

const trackReading = () => {
  let frame = 0
  const onScroll = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      if (window.scrollY > 400) lastRead = itemAtTop()
    })
  }
  window.addEventListener("scroll", onScroll, { passive: true })
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener("scroll", onScroll)
  }
}

export const LangSwitch = ({
  to,
  page,
  label,
  short,
  className,
}: {
  to: Lang
  page: { date?: string; archive?: boolean }
  label: string
  short: string
  className?: string
}) => {
  const href = newsletterHref(page, to, { explicit: true })
  useEffect(trackReading, [])
  // The anchor is set as the pointer goes down (and on focus for the
  // keyboard), not on click: the site's ink transition reads href from a
  // capture-phase click listener on the document, before this would run.
  const aim = (event: SyntheticEvent<HTMLAnchorElement>) => {
    const hash =
      (window.scrollY > 400 ? itemAtTop() : lastRead) ??
      (location.hash.slice(1) || undefined)
    event.currentTarget.href = newsletterHref(page, to, {
      explicit: true,
      hash,
    })
  }
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    aim(event)
    rememberLang(to)
  }
  return (
    <a
      href={href}
      hrefLang={to === "fr" ? "fr" : "en-GB"}
      lang={to === "fr" ? "fr" : "en-GB"}
      className={className}
      onPointerDown={aim}
      onFocus={aim}
      onClick={onClick}
    >
      <span aria-hidden>{short}</span>
      <span>{label}</span>
    </a>
  )
}
