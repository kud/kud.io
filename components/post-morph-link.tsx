"use client"

import { useEffect } from "react"
import type { ComponentProps, MouseEvent } from "react"
import { MorphLink, flagMorph } from "@/components/morph-link"
import { readGlide } from "@/components/blog-morph-preview"

// sessionStorage key naming the post a return glide started from, read by
// BlogMorphArrival on the index to name the one row the cover lands in.
export const POST_RETURN_KEY = "kud:post-morph-return"

// The names a post owns on the index and on its own page: its cover and its
// title. global.css gives them their view-transition-class.
export const postMorphNames = (slug: string) => ({
  cover: `post-cover-${slug}`,
  title: `post-title-${slug}`,
})

// The hero is a bigger file than the thumb. Asking for it on the way to a
// press (hover, focus, touch) gives it a head start, so the cover lands sharp.
const preloaded = new Set<string>()
const preload = (src?: string) => {
  if (!src || preloaded.has(src)) return
  preloaded.add(src)
  new Image().src = src
}

const isModified = (event: MouseEvent) =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey

// Name a row's cover and title, so a transition picks them up.
export const nameRow = (row: Element | null, slug: string) => {
  const names = postMorphNames(slug)
  const cover = row?.querySelector<HTMLElement>("[data-morph-cover]")
  const title = row?.querySelector<HTMLElement>("[data-morph-title]")
  if (cover) cover.style.viewTransitionName = names.cover
  if (title) title.style.viewTransitionName = names.title
  return { cover, title }
}

type Props = ComponentProps<typeof MorphLink> & { slug: string; hero?: string }

// Index → post, inside the blog: a glide, not ink (ink marks a change of
// world). The index names nothing in its markup; the pressed row's cover and
// title are named here, at the click, after MorphLink has stripped every
// other name and before the browser takes its snapshot. Naming them up front
// would put every row into the snapshot on a Back to the index.
export const PostMorphLink = ({
  slug,
  hero,
  onClick,
  onPointerEnter,
  onFocus,
  onTouchStart,
  ...props
}: Props) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (isModified(event)) return
    preload(hero)
    // Preview only: "now" on the preview banner is today's plain cross-fade.
    if (readGlide() === "none") {
      delete document.documentElement.dataset.vt
      document.documentElement.dataset.blogMorph = "none"
      return
    }
    delete document.documentElement.dataset.blogMorph
    nameRow(event.currentTarget.closest("li"), slug)
  }

  return (
    <MorphLink
      {...props}
      onClick={handleClick}
      onPointerEnter={(event) => {
        preload(hero)
        onPointerEnter?.(event)
      }}
      onFocus={(event) => {
        preload(hero)
        onFocus?.(event)
      }}
      onTouchStart={(event) => {
        preload(hero)
        onTouchStart?.(event)
      }}
    />
  )
}

// On a post: the browser's Back to the index glides the same way, home. The
// popstate is already wrapped in a view transition by next-view-transitions,
// unflagged; flag it and leave the slug for BlogMorphArrival, which names the
// row on the index side. This page's own cover and title are named in its
// markup already.
export const PostMorphReturn = ({ slug }: { slug: string }) => {
  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname !== "/blog") return
      if (readGlide() === "none") return
      flagMorph()
      try {
        sessionStorage.setItem(POST_RETURN_KEY, slug)
      } catch {}
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [slug])

  return null
}

// On the index, arriving back from a post: name the one row the cover and
// title return to, and bring it into view so the glide lands somewhere
// visible. A passive effect, like MorphArrival on /projects: after the
// router's own scroll and before the new snapshot is taken. The names come
// off once the transition is over, so the next press starts clean.
export const BlogMorphArrival = () => {
  useEffect(() => {
    let slug: string | null = null
    try {
      slug = sessionStorage.getItem(POST_RETURN_KEY)
      sessionStorage.removeItem(POST_RETURN_KEY)
    } catch {}
    if (!slug) return
    const link = document.querySelector(`h2 a[href$="/${slug}"]`)
    const row = link?.closest("li") ?? null
    const { cover, title } = nameRow(row, slug)
    // Only when the row is off screen, so a row already in view (the
    // usual Back) leaves the page where it was, header and all, still.
    // Instant on purpose: the glide is the motion.
    const box = row?.getBoundingClientRect()
    if (box && (box.bottom < 0 || box.top > window.innerHeight - 40))
      row?.scrollIntoView({ block: "center" })
    const slow = document.documentElement.dataset.blogSlow ? 5 : 1
    window.setTimeout(() => {
      if (cover) cover.style.viewTransitionName = ""
      if (title) title.style.viewTransitionName = ""
    }, 1000 * slow)
  }, [])

  return null
}
