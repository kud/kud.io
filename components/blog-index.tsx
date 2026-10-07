"use client"

import { Link } from "next-view-transitions"
import { postPath } from "@/lib/blog-path"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

export type IndexEntry = {
  slug: string
  title: string
  date: string
  tags: string[]
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

// ?tag= is the shareable form of the filter. replaceState rather than a router
// push: a filter click is not a page, and Back should leave the index.
const writeTagToUrl = (tag: string | null) => {
  const params = new URLSearchParams(location.search)
  if (tag) params.set("tag", tag)
  else params.delete("tag")
  const query = params.toString()
  history.replaceState(
    history.state,
    "",
    `${location.pathname}${query ? `?${query}` : ""}${location.hash}`,
  )
}

export const BlogIndex = ({
  entries,
  styles,
  initialTag = null,
}: {
  entries: IndexEntry[]
  styles: Record<string, string>
  initialTag?: string | null
}) => {
  const tags = useMemo(
    () => [...new Set(entries.flatMap((entry) => entry.tags))].sort(),
    [entries],
  )

  // A tag nobody has is ignored rather than filtering the list to nothing.
  const [tag, setTagState] = useState<string | null>(
    initialTag && tags.includes(initialTag) ? initialTag : null,
  )

  const setTag = (next: string | null) => {
    setTagState(next)
    writeTagToUrl(next)
  }

  const groups = useMemo(
    () =>
      byYear(tag ? entries.filter((entry) => entry.tags.includes(tag)) : entries),
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
            onClick={() => setTag(null)}
            aria-pressed={tag === null}
            data-active={tag === null || undefined}
          >
            all
          </button>
          {tags.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTag(option)}
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
                <h2>
                  <Link href={postPath(post)}>{post.title}</Link>
                </h2>
                {post.tags.length > 0 && (
                  <div className={styles.tags}>
                    {post.tags.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTag(option)}
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

export const BlogIndexFromUrl = (props: {
  entries: IndexEntry[]
  styles: Record<string, string>
}) => <BlogIndex {...props} initialTag={useSearchParams().get("tag")} />
