"use client"

import {
  LANG_COOKIE,
  LANG_STORAGE_KEY,
  newsletterHref,
  type Lang,
} from "@/lib/newsletter/language"

// A plain link, not a client route: the language is resolved by the proxy
// before the page is served, so a full request is the honest path. It goes to
// the top of the same edition in the other language, with or without
// JavaScript; with it, the choice is also remembered for the next visit.
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

export const LangSwitch = ({
  to,
  page,
  label,
  short,
  className,
}: {
  to: Lang
  page: { date?: string; editions?: boolean }
  label: string
  short: string
  className?: string
}) => (
  <a
    href={newsletterHref(page, to)}
    hrefLang={to === "fr" ? "fr" : "en-GB"}
    lang={to === "fr" ? "fr" : "en-GB"}
    className={className}
    onClick={() => rememberLang(to)}
  >
    <span aria-hidden>{short}</span>
    <span>{label}</span>
  </a>
)
