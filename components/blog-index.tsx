"use client"

import { Link } from "next-view-transitions"
import { postPath } from "@/lib/blog-path"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { CoverImage } from "@/components/blog-cover"
import type { CoverImages } from "@/lib/blog"

export type IndexEntry = {
  slug: string
  title: string
  date: string
  tags: string[]
  cover?: CoverImages
}

// A year is a heading over a list, not a property of a row — so grouping
// happens after filtering, never before: filter to one tag and the years that
// hold nothing must disappear along with their rows.
const byYear = (entries: IndexEntry[]) =>
  entries.reduce<[string, IndexEntry[]][]>((groups, entry) => {
    const year = entry.date.slice(0, 4)
    const last = groups.at(-1)
    if (last?.[0] === year) last[1].push(entry)
    else groups.push([year, [entry]])
    return groups
  }, [])

export const BlogIndex = ({
  entries,
  styles,
}: {
  entries: IndexEntry[]
  styles: Record<string, string>
}) => {
  const [tag, setTag] = useState<string | null>(null)

  const tags = useMemo(
    () => [...new Set(entries.flatMap((entry) => entry.tags))].sort(),
    [entries],
  )

  // ?tag= is how a post page links into a filtered index. It is read after
  // mount rather than through useSearchParams so the page stays static, and
  // written back with replaceState so a filtered view can be shared without
  // every click becoming a history entry.
  useEffect(() => {
    const requested = new URLSearchParams(location.search).get("tag")
    if (requested && tags.includes(requested)) setTag(requested)
  }, [tags])

  const choose = (next: string | null) => {
    setTag(next)
    const url = new URL(location.href)
    if (next) url.searchParams.set("tag", next)
    else url.searchParams.delete("tag")
    history.replaceState(history.state, "", url)
  }

  const groups = useMemo(
    () =>
      byYear(
        tag ? entries.filter((entry) => entry.tags.includes(tag)) : entries,
      ),
    [entries, tag],
  )

  return (
    <>
      {/* The filter bar is the index; the row tags are a reversal of an earlier
          "tags once, at the top" rule, asked for by Erwann so a post shows its
          topics at a glance. They stay quieter than the titles (smaller, no
          border at rest) and double as a shortcut into the same filter. */}
      {tags.length > 0 && (
        <div className={styles.filter} role="group" aria-label="Filter by tag">
          <button
            type="button"
            onClick={() => choose(null)}
            aria-pressed={tag === null}
            data-active={tag === null || undefined}
          >
            all
          </button>
          {tags.map((option) => (
            <button
              key={option}
              type="button"
              data-tag={option}
              onClick={() => choose(option)}
              aria-pressed={tag === option}
              data-active={tag === option || undefined}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {groups.map(([year, posts]) => (
        <section key={year}>
          <p className={styles.year}>{year}</p>
          <ul className={styles.list}>
            {posts.map((post) => (
              <li key={post.slug}>
                <time dateTime={post.date}>{post.date}</time>
                {/* The thumb repeats the title's link for the pointer only: one tab
                    stop and one announcement per post. While the cover loads,
                    its own colours wait there, blurred; a post with no cover
                    gets a plain tile in its first tag's hue rather than a gap,
                    so the title column starts at the same x on every row. */}
                <Link
                  href={postPath(post)}
                  className={styles.thumb}
                  data-tag={post.tags[0]}
                  data-cover={post.cover ? true : undefined}
                  style={
                    post.cover?.preview
                      ? ({ "--preview": `url(${post.cover.preview})` } as CSSProperties)
                      : undefined
                  }
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {post.cover && (
                    <CoverImage src={post.cover.thumb} loading="lazy" decoding="async" />
                  )}
                </Link>
                <h2>
                  <Link href={postPath(post)}>{post.title}</Link>
                </h2>
                {post.tags.length > 0 && (
                  <div className={styles.tags}>
                    {post.tags.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={styles.tag}
                        data-tag={option}
                        onClick={() => choose(option)}
                        aria-pressed={tag === option}
                        data-active={tag === option || undefined}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
