"use client"

import { BlogMorphArrival, PostMorphLink } from "@/components/post-morph-link"
import { postPath } from "@/lib/blog-path"
import { useEffect, useId, useMemo, useState, type CSSProperties } from "react"
import { CoverImage } from "@/components/blog-cover"
import type { CoverImages } from "@/lib/blog"

export type IndexEntry = {
  slug: string
  title: string
  date: string
  description: string
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL only exists after mount, and reading it there is what keeps the page static
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

  // The newest post in view leads with its cover at the full column, so the
  // index opens on a picture. Only with a cover: a lead without one would be
  // a slab of tag tint.
  const lead = groups[0]?.[1][0]
  const leadSlug = lead?.cover ? lead.slug : undefined

  // The two posts after it sit side by side under the lead as half-width
  // cards. Both need a cover and the lead's year, or the pair would be a
  // lone card or straddle a year heading; otherwise they stay plain rows.
  const pair = leadSlug ? groups[0][1].slice(1, 3) : []
  const pairSlugs = new Set(
    pair.length === 2 && pair.every((post) => post.cover)
      ? pair.map((post) => post.slug)
      : [],
  )

  const captionId = useId()

  return (
    <div className={styles.index}>
      <BlogMorphArrival />
      {/* The filter bar is the index; the row tags are a reversal of an earlier
          "tags once, at the top" rule, asked for by Erwann so a post shows its
          topics at a glance. They stay quieter than the titles (smaller, no
          border at rest) and double as a shortcut into the same filter. */}
      {tags.length > 0 && (
        <div className={styles.rail}>
          <div
            className={styles.filter}
            role="group"
            aria-labelledby={captionId}
          >
            <p id={captionId} className={styles.caption}>
              Topics
            </p>
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
        </div>
      )}

      {groups.map(([year, posts]) => (
        <section key={year}>
          <p className={styles.year}>{year}</p>
          <ul className={styles.list}>
            {posts.map((post) => (
              <li
                key={post.slug}
                data-lead={post.slug === leadSlug || undefined}
                data-pair={pairSlugs.has(post.slug) || undefined}
              >
                <time dateTime={post.date}>{post.date}</time>
                {/* The thumb repeats the title's link for the pointer only: one tab
                    stop and one announcement per post. While the cover loads,
                    its own colours wait there, blurred; a post with no cover
                    gets a plain tile in its first tag's hue rather than a gap,
                    so the title column starts at the same x on every row. */}
                <PostMorphLink
                  href={postPath(post)}
                  slug={post.slug}
                  hero={post.cover?.hero}
                  className={styles.thumb}
                  data-morph-cover={post.cover ? true : undefined}
                  data-tag={post.tags[0]}
                  data-cover={post.cover ? true : undefined}
                  style={
                    post.cover?.preview
                      ? ({
                          "--preview": `url(${post.cover.preview})`,
                        } as CSSProperties)
                      : undefined
                  }
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {post.cover && (
                    <CoverImage
                      src={post.cover.thumb}
                      {...(post.slug === leadSlug
                        ? {
                            srcSet: `${post.cover.thumb} 320w, ${post.cover.hero} 1600w`,
                            sizes:
                              "(max-width: 580px) calc(100vw - 36px), 754px",
                            loading: "eager",
                          }
                        : pairSlugs.has(post.slug)
                          ? {
                              srcSet: `${post.cover.thumb} 320w, ${post.cover.hero} 1600w`,
                              sizes:
                                "(max-width: 580px) calc(100vw - 36px), 365px",
                              loading: "lazy",
                            }
                          : { loading: "lazy" })}
                      decoding="async"
                    />
                  )}
                </PostMorphLink>
                {/* Title and summary share one grid cell, so a plain row keeps
                    its four columns and its thumb-high line whether or not the
                    post has a summary. */}
                <div className={styles.text}>
                  <h2 data-morph-title>
                    <PostMorphLink
                      href={postPath(post)}
                      slug={post.slug}
                      hero={post.cover?.hero}
                    >
                      {post.title}
                    </PostMorphLink>
                  </h2>
                  {post.description && (
                    <p className={styles.summary}>{post.description}</p>
                  )}
                </div>
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
    </div>
  )
}
