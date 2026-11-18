import { notFound } from "next/navigation"
import {
  EditionView,
  EditionsView,
  newsletterMetadata,
} from "@/components/newsletter/edition-view"
import {
  getEditions,
  listEditionDates,
  loadEdition,
} from "@/lib/newsletter/content"
import {
  editionDateOf,
  editionSegments,
  type EditionSegments,
  type Lang,
} from "@/lib/newsletter/language"

// One implementation per page, called by a French route (/newsletter/...) and
// its English twin (/newsletter/en/...). The English tree is internal: proxy.ts
// rewrites ?lang=en (or a remembered English choice) onto it, so every page is
// prerendered in its own language, metadata included, and the public URL
// keeps the language in the query.

// The list of every edition describes the newsletter, not whichever edition
// is newest: an edition's own metadata lives at its own address. The bare
// /newsletter redirects to the newest edition (next.config.mjs) and renders
// this list only while there is none, so the list's canonical is its own.
export const editionsMetadata = (lang: Lang) =>
  newsletterMetadata({ edition: null, lang, page: { editions: true } })

export const EditionsPage = async ({ lang }: { lang: Lang }) => (
  <EditionsView editions={await getEditions()} lang={lang} />
)

// An edition's route is /newsletter/[year]/[month]/[day], the blog's shape;
// the date is put back together here and nowhere else.
export const dateParams = async () =>
  (await listEditionDates()).map(editionSegments)

export const dateMetadata = async (segments: EditionSegments, lang: Lang) => {
  const date = editionDateOf(segments)
  return newsletterMetadata({
    edition: date ? await loadEdition(date) : null,
    lang,
    page: date ? { date } : {},
  })
}

export const DatePage = async ({
  segments,
  lang,
}: {
  segments: EditionSegments
  lang: Lang
}) => {
  const date = editionDateOf(segments)
  if (!date) notFound()
  const [edition, dates] = await Promise.all([
    loadEdition(date),
    listEditionDates(),
  ])
  if (!edition) notFound()
  return <EditionView edition={edition} lang={lang} dates={dates} />
}
