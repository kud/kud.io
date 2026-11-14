import type { Metadata } from "next"
import { InkLink as Link } from "@/components/ink-link"
import { hostOf } from "@/lib/links"
import {
  sectionsWithItems,
  type Edition,
  type LoadedEdition,
} from "@/lib/newsletter/content"
import {
  COPY,
  formatEditionDate,
  formatMonth,
  htmlLang,
  itemAnchor,
  newsletterHref,
  ogLocale,
  otherLang,
  type Lang,
} from "@/lib/newsletter/language"
import { headline } from "@/lib/newsletter/prompt"
import { LangSwitch } from "@/components/newsletter/lang-switch"
import { Prose } from "@/components/newsletter/prose"
import {
  ItemSelect,
  SelectionProvider,
  ShareItem,
} from "@/components/newsletter/research"
import {
  READER_SCRIPT,
  ReaderPreferences,
} from "@/components/newsletter/reader-preferences"
import { Signup } from "@/components/newsletter/signup"
import styles from "@/app/newsletter/newsletter.module.css"

export const EDITION_ROOT_ID = "newsletter-edition"

const SITE = "https://kud.io"

// The signup only exists once the email side is configured. A public build
// flag for now; the server-side check lives with the subscribe endpoint.
const emailConfigured = () => process.env.NEXT_PUBLIC_NEWSLETTER_EMAIL === "1"

const capitalise = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

const writtenAt = (iso: string | null, lang: Lang) => {
  if (!iso) return null
  const time = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
  return lang === "fr"
    ? `Écrite à ${time}, heure de Londres`
    : `Written at ${time}, London time`
}

const SourceLinks = ({ urls }: { urls: string[] }) => (
  <>
    {urls.map((url) => (
      <a key={url} href={url} rel="noreferrer" className={styles.citation}>
        <span aria-hidden>↗ </span>
        {hostOf(url)}
      </a>
    ))}
  </>
)

export const EditionView = ({
  edition,
  lang,
  dates,
  latest = false,
}: {
  edition: LoadedEdition
  lang: Lang
  dates: string[]
  latest?: boolean
}) => {
  const copy = COPY[lang]
  const page = latest ? {} : { date: edition.date }
  const index = dates.indexOf(edition.date)
  const newer = index > 0 ? dates[index - 1] : null
  const older = index >= 0 && index < dates.length - 1 ? dates[index + 1] : null
  const sections = sectionsWithItems(edition)
  const minutes = edition.readingMinutes?.[lang]
  const words = edition.wordCount?.[lang]
  const at = writtenAt(edition.generatedAt, lang)
  const numberFormat = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB")

  return (
    <SelectionProvider
      edition={{
        date: edition.date,
        items: edition.items,
        narrative: edition.narrative,
      }}
      lang={lang}
      styles={styles}
    >
      <article
        id={EDITION_ROOT_ID}
        className={styles.edition}
        data-edition={edition.date}
        lang={htmlLang[lang]}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: READER_SCRIPT }} />
        <header className={styles.masthead}>
          <div className={styles.mastRow}>
            <p className={styles.kicker}>
              {copy.name}
              {latest && (
                <span className={styles.kickerNote}> · {copy.latest}</span>
              )}
            </p>
            <div className={styles.mastTools}>
              <ReaderPreferences
                lang={lang}
                rootId={EDITION_ROOT_ID}
                styles={styles}
              />
              <LangSwitch
                to={otherLang(lang)}
                page={page}
                label={copy.switchTo}
                short={copy.switchShort}
                className={styles.langSwitch}
              />
            </div>
          </div>
          <h1 className={styles.title}>
            {capitalise(formatEditionDate(edition.date, lang))}
          </h1>
          {edition.lede[lang] && (
            <p className={styles.lede}>{edition.lede[lang]}</p>
          )}
          <p className={styles.meta}>
            {minutes ? <strong>{minutes} min</strong> : null}
            {words ? (
              <span>
                {numberFormat.format(words)} {lang === "fr" ? "mots" : "words"}
              </span>
            ) : null}
            <span>{copy.items(edition.items.length)}</span>
            {at && <span>{at}</span>}
          </p>
          <nav
            className={styles.contents}
            aria-label={lang === "fr" ? "Sommaire" : "Contents"}
          >
            {sections.map((section) => (
              <a key={section.key} href={`#section-${section.key}`}>
                {section.title[lang]}
              </a>
            ))}
          </nav>
        </header>

        {sections.map((section) => (
          <section
            key={section.key}
            id={`section-${section.key}`}
            className={styles.section}
            data-kind={section.kind}
            aria-labelledby={`section-${section.key}-title`}
          >
            <h2
              id={`section-${section.key}-title`}
              className={
                section.key === "closing" || section.key === "overview"
                  ? styles.visuallyHidden
                  : styles.sectionTitle
              }
            >
              {section.title[lang]}
            </h2>

            {section.kind === "narrative" && (
              <Prose
                markdown={
                  edition.narrative[
                    section.key as "overview" | "analysis" | "closing"
                  ]?.[lang] ?? ""
                }
                citations
                className={`${styles.prose} ${styles.narrative}`}
                citationClassName={styles.citation}
              />
            )}

            {section.key === "overview" && (
              <p className={styles.researchHint}>{copy.researchHint}</p>
            )}

            {section.key === "timeline" && (
              <ol className={styles.timeline}>
                {edition.timeline.map((entry) => (
                  <li key={`${entry.date}-${entry.text.en}`}>
                    <time dateTime={entry.date}>
                      {formatEditionDate(entry.date, lang, "short")}{" "}
                      {entry.date.slice(0, 4)}
                    </time>
                    <span>
                      {entry.text[lang]} <SourceLinks urls={entry.urls} />
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {section.key === "inbrief" && (
              <ul className={styles.facts}>
                {edition.inBrief.map((fact) => (
                  <li key={fact.text.en}>
                    {fact.text[lang]} <SourceLinks urls={fact.urls} />
                  </li>
                ))}
              </ul>
            )}

            {section.kind === "items" && (
              <div className={styles.items}>
                {section.entries.map((item) => (
                  <article
                    key={item.id}
                    id={itemAnchor(item.id)}
                    data-item={item.id}
                    className={styles.item}
                    aria-labelledby={`${itemAnchor(item.id)}-title`}
                  >
                    <h3
                      id={`${itemAnchor(item.id)}-title`}
                      className={styles.itemTitle}
                    >
                      <span className={styles.num}>{item.id}</span>
                      <span className={styles.visuallyHidden}> · </span>
                      {item.kicker?.[lang] && (
                        <span className={styles.kickerLabel}>
                          {item.kicker[lang]}
                          <span className={styles.visuallyHidden}> · </span>
                        </span>
                      )}
                      {item.kicker?.[lang] !== item.title[lang] && (
                        <span className={styles.itemTitleText}>
                          {item.title[lang]}
                        </span>
                      )}
                    </h3>
                    <div className={styles.itemTools}>
                      <ShareItem
                        href={newsletterHref({ date: edition.date }, lang, {
                          explicit: lang !== "fr",
                          hash: itemAnchor(item.id),
                        })}
                        lang={lang}
                        title={headline(item, lang)}
                        className={styles.share}
                        hiddenClassName={styles.visuallyHidden}
                      />
                      <ItemSelect
                        id={item.id}
                        title={headline(item, lang)}
                        lang={lang}
                        className={styles.select}
                        hiddenClassName={styles.visuallyHidden}
                      />
                    </div>
                    <Prose
                      markdown={
                        edition.bodies[lang][item.id] || item.summary[lang]
                      }
                      className={styles.prose}
                    />
                    {item.sources.length > 0 && (
                      <div className={styles.sources}>
                        <p className={styles.sourcesLabel}>{copy.sources}</p>
                        <ul>
                          {item.sources.map((source) => (
                            <li key={source.url}>
                              <a href={source.url} rel="noreferrer">
                                {source.label[lang]}
                              </a>
                              <span className={styles.host}>
                                {hostOf(source.url)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}

        <footer className={styles.editionFooter}>
          <nav
            className={styles.pager}
            aria-label={lang === "fr" ? "Éditions" : "Editions"}
          >
            {older ? (
              <Link href={newsletterHref({ date: older }, lang)} rel="prev">
                ← {copy.previous}
                <small>{formatEditionDate(older, lang)}</small>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link
                href={newsletterHref({ date: newer }, lang)}
                rel="next"
                className={styles.pagerNext}
              >
                {copy.next} →<small>{formatEditionDate(newer, lang)}</small>
              </Link>
            )}
          </nav>
          <p className={styles.footLinks}>
            <Link href={newsletterHref({ archive: true }, lang)}>
              {copy.archive}
            </Link>
            <a href={`/newsletter/${lang}.xml`}>{copy.feed}</a>
          </p>
          {emailConfigured() && <Signup lang={lang} styles={styles} />}
        </footer>
      </article>
    </SelectionProvider>
  )
}

export const EmptyEdition = ({ lang }: { lang: Lang }) => {
  const copy = COPY[lang]
  return (
    <div className={styles.empty} lang={htmlLang[lang]} data-edition="">
      <p className={styles.kicker}>{copy.name}</p>
      <h1 className={styles.title}>{copy.emptyTitle}</h1>
      <p className={styles.lede}>{copy.emptyBody}</p>
      {emailConfigured() && <Signup lang={lang} styles={styles} />}
    </div>
  )
}

export const ArchiveView = ({
  editions,
  lang,
}: {
  editions: Edition[]
  lang: Lang
}) => {
  const copy = COPY[lang]
  const months = new Map<string, Edition[]>()
  for (const edition of editions) {
    const month = edition.date.slice(0, 7)
    months.set(month, [...(months.get(month) ?? []), edition])
  }
  return (
    <div className={styles.archive} lang={htmlLang[lang]}>
      <div className={styles.mastRow}>
        <p className={styles.kicker}>{copy.name}</p>
        <LangSwitch
          to={otherLang(lang)}
          page={{ archive: true }}
          label={copy.switchTo}
          short={copy.switchShort}
          className={styles.langSwitch}
        />
      </div>
      <h1 className={styles.title}>{copy.archiveTitle}</h1>
      <p className={styles.lede}>{copy.archiveIntro}</p>
      {editions.length === 0 && <p className={styles.lede}>{copy.emptyBody}</p>}
      {[...months].map(([month, list]) => (
        <section
          key={month}
          className={styles.month}
          aria-labelledby={`month-${month}`}
        >
          <h2 id={`month-${month}`} className={styles.sectionTitle}>
            {capitalise(formatMonth(month, lang))}
          </h2>
          <ol className={styles.archiveList}>
            {list.map((edition) => {
              const titles = edition.items
                .slice(0, 3)
                .map((item) => item.title[lang])
              return (
                <li key={edition.date}>
                  <Link href={newsletterHref({ date: edition.date }, lang)}>
                    <time dateTime={edition.date}>
                      {capitalise(formatEditionDate(edition.date, lang))}
                    </time>
                    <span className={styles.archiveLede}>
                      {edition.lede[lang] ?? titles.join(" · ")}
                    </span>
                    <span className={styles.archiveTitles}>
                      {titles.join(" · ")}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}

const FEED_TITLE: Record<Lang, string> = {
  fr: "Newsletter (français) — kud.io",
  en: "Newsletter (English) — kud.io",
}

const feeds = (lang: Lang) => ({
  "application/rss+xml": [
    { url: `/newsletter/${lang}.xml`, title: FEED_TITLE[lang] },
  ],
})

export const newsletterMetadata = ({
  edition,
  lang,
  page,
}: {
  edition: Edition | null
  lang: Lang
  page: { date?: string; archive?: boolean }
}): Metadata => {
  const copy = COPY[lang]
  const title = page.archive
    ? `${copy.name} · ${copy.archiveTitle} — kud.io`
    : edition
      ? `${copy.name} · ${capitalise(formatEditionDate(edition.date, lang))} — kud.io`
      : `${copy.name} — kud.io`
  const description = page.archive
    ? copy.tagline
    : (edition?.lede[lang] ??
      (edition
        ? edition.items
            .slice(0, 3)
            .map((item) => item.title[lang])
            .join(" · ")
        : copy.tagline))
  const href = (to: Lang) => newsletterHref(page, to, { explicit: to !== "fr" })
  return {
    title,
    description,
    alternates: {
      canonical: href(lang),
      languages: {
        fr: href("fr"),
        "en-GB": href("en"),
        "x-default": href("fr"),
      },
      types: feeds(lang),
    },
    openGraph: {
      type: edition && !page.archive ? "article" : "website",
      url: `${SITE}${href(lang)}`,
      siteName: "kud.io",
      locale: ogLocale[lang],
      alternateLocale: ogLocale[otherLang(lang)],
      title,
      description,
      ...(edition?.publishedAt && !page.archive
        ? { publishedTime: edition.publishedAt }
        : {}),
    },
    twitter: { title, description },
  }
}
