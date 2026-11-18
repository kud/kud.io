// The newsletter is the one bilingual surface on kud.io: British English or
// French, picked per reader. Everything here is pure so the proxy, the pages,
// the client controls and the tests all read one definition of a language.

export const LANGS = ["fr", "en"] as const

export type Lang = (typeof LANGS)[number]

export const DEFAULT_LANG: Lang = "en"

// One name for both stores: the cookie lets the proxy serve the right static
// page before anything paints; localStorage is the client's own copy, kept in
// case cookies are blocked while storage is not.
export const LANG_COOKIE = "kud.newsletter.lang"
export const LANG_STORAGE_KEY = LANG_COOKIE

export const parseLang = (value: unknown): Lang | null =>
  typeof value === "string" && (LANGS as readonly string[]).includes(value)
    ? (value as Lang)
    : null

// The browser's own ranking (Accept-Language), best first. Only the language
// part counts: fr-CA and fr-BE are French, en-US is English. q=0 means "not
// this one".
export const langFromAcceptLanguage = (header?: string | null): Lang | null => {
  if (!header) return null
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="))
      return {
        tag: tag.trim().toLowerCase(),
        q: q ? Number(q.slice(2)) : 1,
        index,
      }
    })
    .filter(({ q }) => Number.isFinite(q) && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
  for (const { tag } of ranked) {
    const lang = parseLang(tag.split("-")[0])
    if (lang) return lang
  }
  return null
}

// Where the request comes from, as the host reports it (Vercel's
// x-vercel-ip-country). A weaker hint than the browser's language, so it only
// counts when the browser names neither: countries whose everyday language is
// French.
const FRENCH_COUNTRIES = new Set(["FR", "BE", "LU", "MC"])

export const langFromCountry = (country?: string | null): Lang | null =>
  country && FRENCH_COUNTRIES.has(country.toUpperCase()) ? "fr" : null

// An explicit ?lang wins, then the reader's remembered choice (cookie), then
// the browser's language, then the country, then English.
export const resolveLang = ({
  query,
  cookie,
  acceptLanguage,
  country,
}: {
  query?: string | null
  cookie?: string | null
  acceptLanguage?: string | null
  country?: string | null
}): Lang =>
  parseLang(query) ??
  parseLang(cookie) ??
  langFromAcceptLanguage(acceptLanguage) ??
  langFromCountry(country) ??
  DEFAULT_LANG

export const otherLang = (lang: Lang): Lang => (lang === "fr" ? "en" : "fr")

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const isEditionDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return false
  const day = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(day.getTime()) && day.toISOString().slice(0, 10) === value
  )
}

export const itemAnchor = (id: string) => `item-${id}`

// Public URLs carry the language in the query, never in the path: the path is
// the page, the query is how you read it. Every link names its language, since
// the bare address is resolved per reader (resolveLang) and so belongs to no
// language: it is the x-default. The bare /newsletter redirects to the newest
// edition (next.config.mjs), so a link to the list of every edition names
// /newsletter/editions.
export const newsletterPath = (page: { date?: string; editions?: boolean }) =>
  page.date
    ? `/newsletter/${page.date}`
    : page.editions
      ? "/newsletter/editions"
      : "/newsletter"

export const newsletterHref = (
  page: { date?: string; editions?: boolean },
  lang: Lang,
  { hash }: { hash?: string } = {},
) => {
  const path = newsletterPath(page)
  const query = `?lang=${lang}`
  return `${path}${query}${hash ? `#${hash}` : ""}`
}

const LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-GB" }

export const htmlLang: Record<Lang, string> = { fr: "fr", en: "en-GB" }

export const ogLocale: Record<Lang, string> = { fr: "fr_FR", en: "en_GB" }

// Dates are calendar days, not instants: format them at UTC midnight so the
// server's zone can never shift an edition onto the day before.
// Assembled from parts rather than taken whole: ICU's en-GB long date puts a
// comma after the weekday ("Friday, 13 November"), which British print does
// not, and the comma has come and gone between ICU releases.
export const formatEditionDate = (
  date: string,
  lang: Lang,
  style: "long" | "short" = "long",
) => {
  const parts = new Intl.DateTimeFormat(LOCALE[lang], {
    timeZone: "UTC",
    ...(style === "long"
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      : { day: "numeric", month: "short" }),
  }).formatToParts(new Date(`${date}T00:00:00Z`))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? ""
  return (
    style === "long"
      ? [part("weekday"), part("day"), part("month"), part("year")]
      : [part("day"), part("month")]
  ).join(" ")
}

export const formatMonth = (yearMonth: string, lang: Lang) =>
  new Intl.DateTimeFormat(LOCALE[lang], {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(`${yearMonth}-01T00:00:00Z`))

// Interface copy that sits inside the edition, so it follows the edition's
// language. The site's own chrome around it (site line, footer) stays English.
export const COPY = {
  fr: {
    name: "Newsletter",
    tagline: "Ce qui comptait aujourd’hui, expliqué. Chaque soir.",
    edition: "Édition du",
    switchTo: "Read in English",
    switchShort: "EN",
    sources: "Sources",
    select: (id: string, title: string) => `Sélectionner ${id} · ${title}`,
    selected: (count: number) =>
      count === 1 ? "1 sujet sélectionné" : `${count} sujets sélectionnés`,
    clear: "Effacer",
    copyPrompt: "Copier le prompt de recherche",
    copyPromptShort: "Copier le prompt",
    copied: "Prompt copié. Collez-le dans l’assistant de votre choix.",
    copiedShort: "Prompt copié",
    copyFallback:
      "La copie automatique n’a pas fonctionné. Le prompt est sélectionné ci-dessous : copiez-le.",
    close: "Fermer",
    researchHint:
      "Cochez des sujets pour préparer un prompt de recherche à coller dans l’assistant de votre choix.",
    previous: "Édition précédente",
    next: "Édition suivante",
    archive: "Toutes les éditions",
    editions: "Éditions",
    calendar: "Calendrier",
    calendarLabel: "Calendrier des éditions",
    previousMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    noEdition: "pas d’édition",
    current: "édition affichée",
    latest: "Dernière édition",
    feed: "Flux RSS",
    emptyTitle: "Pas encore d’édition.",
    emptyBody:
      "La première arrive bientôt, un soir de semaine. Revenez un peu plus tard.",
    read: "Lire l’édition",
    more: (count: number) =>
      count === 1 ? "1 autre sujet" : `${count} autres sujets`,
    items: (count: number) => (count === 1 ? "1 sujet" : `${count} sujets`),
    signupTitle: "Recevoir l’édition par e-mail",
    signupBody: "Un e-mail par édition, rien d’autre.",
    email: "Adresse e-mail",
    language: "Langue",
    consent:
      "Votre adresse et votre langue servent uniquement à vous envoyer la newsletter. Désinscription en un clic dans chaque e-mail.",
    subscribe: "M’inscrire",
    privacy: "Ce que l’inscription conserve",
    signupState: {
      check:
        "C’est presque fait : confirmez votre inscription avec le lien que nous venons de vous envoyer.",
      confirmed:
        "C’est confirmé : la prochaine édition arrivera dans votre boîte de réception.",
      invalid: "Cette adresse ne semble pas valide. Vous pouvez réessayer.",
      link: "Ce lien de confirmation n’est pas valide. Inscrivez-vous à nouveau pour en recevoir un autre.",
      expired:
        "Ce lien de confirmation a expiré. Inscrivez-vous à nouveau pour en recevoir un autre.",
      failed: "L’envoi n’a pas abouti. Vous pouvez réessayer dans un moment.",
      unavailable: "L’inscription par e-mail n’est pas encore ouverte.",
    },
  },
  en: {
    name: "Newsletter",
    tagline: "What mattered today, explained. Every evening.",
    edition: "Edition of",
    switchTo: "Lire en français",
    switchShort: "FR",
    sources: "Sources",
    select: (id: string, title: string) => `Select ${id} · ${title}`,
    selected: (count: number) =>
      count === 1 ? "1 subject selected" : `${count} subjects selected`,
    clear: "Clear",
    copyPrompt: "Copy research prompt",
    copyPromptShort: "Copy prompt",
    copied: "Prompt copied. Paste it into the assistant of your choice.",
    copiedShort: "Prompt copied",
    copyFallback:
      "Copying didn’t work automatically. The prompt is selected below: copy it from there.",
    close: "Close",
    researchHint:
      "Tick subjects to build a research prompt to paste into the assistant of your choice.",
    previous: "Previous edition",
    next: "Next edition",
    archive: "All editions",
    editions: "Editions",
    calendar: "Calendar",
    calendarLabel: "Calendar of editions",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    noEdition: "no edition",
    current: "edition shown",
    latest: "Latest edition",
    feed: "RSS feed",
    emptyTitle: "No edition yet.",
    emptyBody:
      "The first one lands soon, on a weekday evening. Do come back a little later.",
    read: "Read the edition",
    more: (count: number) =>
      count === 1 ? "1 more subject" : `${count} more subjects`,
    items: (count: number) => (count === 1 ? "1 subject" : `${count} subjects`),
    signupTitle: "Get each edition by email",
    signupBody: "One email per edition, nothing else.",
    email: "Email address",
    language: "Language",
    consent:
      "Your address and language are used only to send you the newsletter. Unsubscribe in one click from any email.",
    subscribe: "Subscribe",
    privacy: "What signing up keeps",
    signupState: {
      check:
        "Nearly there: confirm your subscription with the link we’ve just sent you.",
      confirmed: "You’re in: the next edition will land in your inbox.",
      invalid: "That address doesn’t look right. Do try again.",
      link: "That confirmation link isn’t valid. Sign up again for a fresh one.",
      expired:
        "That confirmation link has expired. Sign up again for a fresh one.",
      failed: "The email didn’t go out. Please try again in a moment.",
      unavailable: "Email sign-up isn’t open yet.",
    },
  },
} as const

export const LANG_NAME: Record<Lang, string> = {
  fr: "Français",
  en: "English",
}

// The outcome the subscribe and confirm routes put in the query when they
// redirect back: ?subscribed=check|1|0, with ?reason= when it is 0.
export type SignupState = keyof (typeof COPY)["en"]["signupState"]

export const signupStateOf = (search: string): SignupState | null => {
  const params = new URLSearchParams(search)
  const subscribed = params.get("subscribed")
  if (subscribed === "check") return "check"
  if (subscribed === "1") return "confirmed"
  if (subscribed !== "0") return null
  const reason = params.get("reason")
  return reason === "invalid" ||
    reason === "link" ||
    reason === "expired" ||
    reason === "unavailable"
    ? reason
    : "failed"
}
