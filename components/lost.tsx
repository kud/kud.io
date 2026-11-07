"use client"

import { useId, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Link } from "next-view-transitions"
import styles from "./lost.module.css"

export type Place = {
  href: string
  label: string
  kind: "Page" | "Project" | "Writing"
  keys: string[]
  detail?: string
}

const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

const distance = (a: string, b: string) => {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    previous = current
  }
  return previous[b.length]
}

// How near a typed segment is to one of a place's keys, from 0 to 1: an edit
// distance for typos (/projetcs), containment for truncations (/inkbl), and
// shared words for slugs typed in a different order.
const nearness = (typed: string, place: Place) => {
  const typedWords = words(typed)
  let best = 0
  for (const key of place.keys) {
    const k = key.toLowerCase()
    if (k === typed) return 1
    best = Math.max(
      best,
      1 - distance(typed, k) / Math.max(typed.length, k.length),
    )
    if (
      Math.min(typed.length, k.length) >= 4 &&
      (k.includes(typed) || typed.includes(k))
    )
      best = Math.max(best, 0.8)
    const keyWords = new Set(words(k))
    const shared = typedWords.filter((word) => keyWords.has(word)).length
    if (shared)
      best = Math.max(
        best,
        (0.9 * shared) / Math.max(typedWords.length, keyWords.size),
      )
  }
  return best
}

// The last segment carries the intent: /blog/2024/03/01/some-post means
// some-post, and /projects/inkblt means inkblt.
const lastSegment = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean).pop() ?? ""
  try {
    return decodeURIComponent(segment)
      .toLowerCase()
      .replace(/\.[a-z]+$/, "")
  } catch {
    return segment.toLowerCase()
  }
}

const closest = (pathname: string, places: Place[]) => {
  const typed = lastSegment(pathname)
  if (!typed) return null
  let winner: Place | null = null
  let score = 0.55
  for (const place of places) {
    const next = nearness(typed, place)
    if (next > score) {
      score = next
      winner = place
    }
  }
  return winner
}

const PlaceLink = ({ place }: { place: Place }) => (
  <Link href={place.href} className={styles.place}>
    <span className={styles.kind}>{place.kind}</span>
    <span className={styles.label}>{place.label}</span>
    {place.detail && <span className={styles.detail}>{place.detail}</span>}
  </Link>
)

export const Lost = ({
  places,
  illustration,
}: {
  places: Place[]
  illustration?: string
}) => {
  const pathname = usePathname() ?? "/"
  const guess = useMemo(() => closest(pathname, places), [pathname, places])
  const [query, setQuery] = useState("")
  const searchId = useId()

  const needle = query.trim().toLowerCase()
  const results = needle
    ? places
        .filter((place) =>
          [place.label, place.detail ?? "", ...place.keys].some((field) =>
            field.toLowerCase().includes(needle),
          ),
        )
        .slice(0, 6)
    : []

  return (
    <main className={styles.lost}>
      <div className={styles.inner}>
        {illustration && (
          // Decorative: the heading already says everything it shows.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={illustration}
            alt=""
            width={480}
            height={360}
            className={styles.art}
          />
        )}
        <p className={styles.eyebrow}>404 · Page not found</p>
        <h1 className={styles.title}>Nothing lives here.</h1>
        <p className={styles.lede}>
          You asked for{" "}
          <code className={styles.path} translate="no">
            {pathname}
          </code>
          . I&rsquo;ve had a proper look, and there&rsquo;s nothing at that
          address. It may have moved, it may never have existed, or someone made
          a typo. Statistically, that someone was me.
        </p>

        <section className={styles.block} aria-label="Closest match">
          {guess ? (
            <>
              <p className={styles.note}>The closest thing I&rsquo;ve got:</p>
              <PlaceLink place={guess} />
            </>
          ) : (
            <p className={styles.note}>
              Nothing even close. Impressive, in its way.
            </p>
          )}
        </section>

        <form
          className={styles.block}
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            const first = event.currentTarget.querySelector("a")
            first?.focus()
          }}
        >
          <label htmlFor={searchId} className={styles.note}>
            Or have a look yourself
          </label>
          <input
            id={searchId}
            type="search"
            className={styles.search}
            placeholder="A project or a post"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div aria-live="polite">
            {needle &&
              (results.length ? (
                <ul className={styles.results}>
                  {results.map((place) => (
                    <li key={place.href}>
                      <PlaceLink place={place} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>
                  Nothing called that either. I did check.
                </p>
              ))}
          </div>
        </form>

        <nav className={styles.actions} aria-label="Ways back">
          <Link href="/" className={styles.primary}>
            Take me home <span aria-hidden>→</span>
          </Link>
          <Link href="/projects" className={styles.secondary}>
            Projects
          </Link>
          <Link href="/blog" className={styles.secondary}>
            Writing
          </Link>
        </nav>

        <p className={styles.footnote}>
          If one of my own links sent you here, that one&rsquo;s on me.{" "}
          <a href="mailto:m+site@kud.io">Tell me</a>
          {" and I\u2019ll mend it."}
        </p>
      </div>
    </main>
  )
}
