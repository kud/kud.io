// The newsletter is the one bilingual surface on kud.io: French by default,
// British English on request. Everything here is pure so the proxy, the pages,
// the client controls and the tests all read one definition of a language.

export const LANGS = ["fr", "en"] as const

export type Lang = (typeof LANGS)[number]

export const DEFAULT_LANG: Lang = "fr"

// One name for both stores: the cookie lets the proxy serve the right static
// page before anything paints; localStorage is the client's own copy, kept in
// case cookies are blocked while storage is not.
export const LANG_COOKIE = "kud.newsletter.lang"
export const LANG_STORAGE_KEY = LANG_COOKIE

export const parseLang = (value: unknown): Lang | null =>
  typeof value === "string" && (LANGS as readonly string[]).includes(value)
    ? (value as Lang)
    : null

// An explicit ?lang wins, then the reader's remembered choice, then French.
export const resolveLang = ({
  query,
  cookie,
}: {
  query?: string | null
  cookie?: string | null
}): Lang => parseLang(query) ?? parseLang(cookie) ?? DEFAULT_LANG

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

// Public URLs always carry the language in the query, never in the path: the
// path is the edition, the query is how you read it. French needs no query
// but gets one when a link has to override a remembered English choice.
export const newsletterHref = (
  page: { date?: string; archive?: boolean },
  lang: Lang,
  { explicit = false, hash }: { explicit?: boolean; hash?: string } = {},
) => {
  const path = page.archive
    ? "/newsletter/archive"
    : page.date
      ? `/newsletter/${page.date}`
      : "/newsletter"
  const query = explicit || lang !== DEFAULT_LANG ? `?lang=${lang}` : ""
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
    copied: "Prompt copié. Collez-le dans l’assistant de votre choix.",
    copyFallback:
      "La copie automatique n’a pas fonctionné. Le prompt est sélectionné ci-dessous : copiez-le.",
    close: "Fermer",
    researchHint:
      "Cochez des sujets pour préparer un prompt de recherche à coller dans l’assistant de votre choix.",
    previous: "Édition précédente",
    next: "Édition suivante",
    archive: "Toutes les éditions",
    latest: "Dernière édition",
    feed: "Flux RSS",
    emptyTitle: "Pas encore d’édition.",
    emptyBody:
      "La première arrive bientôt, un soir de semaine. Revenez un peu plus tard.",
    archiveTitle: "Archives",
    archiveIntro: "Chaque édition, de la plus récente à la plus ancienne.",
    items: (count: number) => (count === 1 ? "1 sujet" : `${count} sujets`),
    signupTitle: "Recevoir l’édition par e-mail",
    signupBody: "Un e-mail par édition, rien d’autre.",
    email: "Adresse e-mail",
    language: "Langue",
    consent:
      "Votre adresse et votre langue servent uniquement à vous envoyer la newsletter. Désinscription en un clic dans chaque e-mail.",
    subscribe: "M’inscrire",
    subscribed:
      "C’est presque fait : confirmez votre inscription avec le lien que nous venons de vous envoyer.",
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
    copied: "Prompt copied. Paste it into the assistant of your choice.",
    copyFallback:
      "Copying didn’t work automatically. The prompt is selected below: copy it from there.",
    close: "Close",
    researchHint:
      "Tick subjects to build a research prompt to paste into the assistant of your choice.",
    previous: "Previous edition",
    next: "Next edition",
    archive: "All editions",
    latest: "Latest edition",
    feed: "RSS feed",
    emptyTitle: "No edition yet.",
    emptyBody:
      "The first one lands soon, on a weekday evening. Do come back a little later.",
    archiveTitle: "Archive",
    archiveIntro: "Every edition, newest first.",
    items: (count: number) => (count === 1 ? "1 subject" : `${count} subjects`),
    signupTitle: "Get each edition by email",
    signupBody: "One email per edition, nothing else.",
    email: "Email address",
    language: "Language",
    consent:
      "Your address and language are used only to send you the newsletter. Unsubscribe in one click from any email.",
    subscribe: "Subscribe",
    subscribed:
      "Nearly there: confirm your subscription with the link we’ve just sent you.",
  },
} as const

export const LANG_NAME: Record<Lang, string> = {
  fr: "Français",
  en: "English",
}
