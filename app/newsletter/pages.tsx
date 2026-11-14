import { notFound } from "next/navigation"
import {
  ArchiveView,
  EditionView,
  EmptyEdition,
  newsletterMetadata,
} from "@/components/newsletter/edition-view"
import {
  getEditions,
  getLatestEdition,
  listEditionDates,
  loadEdition,
} from "@/lib/newsletter/content"
import type { Lang } from "@/lib/newsletter/language"

// One implementation per page, called by a French route (/newsletter/...) and
// its English twin (/newsletter/en/...). The English tree is internal: proxy.ts
// rewrites ?lang=en (or a remembered English choice) onto it, so every page is
// prerendered in its own language, metadata included, and the public URL
// keeps the language in the query.

export const latestMetadata = async (lang: Lang) =>
  newsletterMetadata({ edition: await getLatestEdition(), lang, page: {} })

export const LatestPage = async ({ lang }: { lang: Lang }) => {
  const [edition, dates] = await Promise.all([
    getLatestEdition(),
    listEditionDates(),
  ])
  return edition ? (
    <EditionView edition={edition} lang={lang} dates={dates} latest />
  ) : (
    <EmptyEdition lang={lang} />
  )
}

export const dateParams = async () =>
  (await listEditionDates()).map((date) => ({ date }))

export const dateMetadata = async (date: string, lang: Lang) =>
  newsletterMetadata({
    edition: await loadEdition(date),
    lang,
    page: { date },
  })

export const DatePage = async ({
  date,
  lang,
}: {
  date: string
  lang: Lang
}) => {
  const [edition, dates] = await Promise.all([
    loadEdition(date),
    listEditionDates(),
  ])
  if (!edition) notFound()
  return <EditionView edition={edition} lang={lang} dates={dates} />
}

export const archiveMetadata = (lang: Lang) =>
  newsletterMetadata({ edition: null, lang, page: { archive: true } })

export const ArchivePage = async ({ lang }: { lang: Lang }) => (
  <ArchiveView editions={await getEditions()} lang={lang} />
)
