"use client"

import { useEffect } from "react"
import type { ComponentProps, MouseEvent } from "react"
import { MorphLink, flagMorph } from "@/components/morph-link"
import { readGlide } from "@/components/blog-morph-preview"
import { InkLink } from "@/components/ink-link"

// sessionStorage key naming the post a return glide started from, read by
// BlogMorphArrival on the index to name the one row the cover lands in.
export const POST_RETURN_KEY = "kud:post-morph-return"

// sessionStorage key holding the index's scroll at the press, with the slug
// pressed. The way back restores it before the index is snapshotted: left to
// the browser, the restore lands after the snapshot, so the cover glided to
// where its row sat at scroll 0, often below the fold, and the page jumped
// once it was over.
const INDEX_SCROLL_KEY = "kud:blog-index-scroll"

const slowFactor = () => (document.documentElement.dataset.blogSlow ? 5 : 1)

// The thumb's hover lean at the press, as a scale (1 when at rest), for the
// incoming cover to start from (global.css, post-cover-settle).
let clearZoom: number | undefined

const holdZoom = (cover: HTMLElement | null | undefined) => {
  const img = cover?.querySelector("img")
  const scale = img ? new DOMMatrix(getComputedStyle(img).transform).a : 1
  const root = document.documentElement
  root.style.setProperty("--morph-zoom", String(scale || 1))
  window.clearTimeout(clearZoom)
  clearZoom = window.setTimeout(
    () => root.style.removeProperty("--morph-zoom"),
    1000 * slowFactor(),
  )
}

// Post → index, by any way back (the Back button or gesture, Alt+←, the
// header's /writing): flag the glide and leave the slug for BlogMorphArrival,
// which names the row on the index side. The post's own cover and title are
// named in its markup already.
export const flagPostReturn = (slug: string) => {
  if (readGlide() === "none") return
  flagMorph()
  // The lean belongs to the press that opened the post, not to the row the
  // cover lands back in.
  document.documentElement.style.removeProperty("--morph-zoom")
  try {
    sessionStorage.setItem(POST_RETURN_KEY, slug)
  } catch {}
}

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
    const { cover } = nameRow(event.currentTarget.closest("li"), slug)
    holdZoom(cover)
    try {
      sessionStorage.setItem(INDEX_SCROLL_KEY, `${slug} ${window.scrollY}`)
    } catch {}
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

// On a post: the browser's Back to the index (button, gesture, Alt+←) glides
// the same way, home. next-view-transitions already wraps every popstate in a
// view transition, unflagged; this flags it before the old page is captured.
export const PostMorphReturn = ({ slug }: { slug: string }) => {
  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname === "/blog") flagPostReturn(slug)
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [slug])

  return null
}

// On the index, arriving back from a post: put the list back where it was at
// the press, name the one row the cover and title return to, and make sure it
// is in view, so the glide lands somewhere visible. A passive effect, like
// MorphArrival on /projects: after the router's own scroll and before the new
// snapshot is taken. Every scroll here is instant, never the page's smooth
// default: a smooth scroll is still at its start when the snapshot is taken.
// The names come off once the transition is over, so the next press starts
// clean.
export const BlogMorphArrival = () => {
  useEffect(() => {
    let slug: string | null = null
    try {
      slug = sessionStorage.getItem(POST_RETURN_KEY)
      sessionStorage.removeItem(POST_RETURN_KEY)
    } catch {}
    if (!slug) return
    let scroll: string | null = null
    try {
      scroll = sessionStorage.getItem(INDEX_SCROLL_KEY)
    } catch {}
    // Only the scroll saved by this post's own press: a post reached some
    // other way leaves an older value behind.
    const [from, top] = scroll?.split(" ") ?? []
    if (from === slug)
      window.scrollTo({ top: Number(top), behavior: "instant" })
    const link = document.querySelector(`h2 a[href$="/${slug}"]`)
    const row = link?.closest("li") ?? null
    const { cover, title } = nameRow(row, slug)
    // Only when the row is still off screen (a resized window, a list that
    // changed), so a row in view leaves the page where it was.
    const box = row?.getBoundingClientRect()
    if (box && (box.bottom < 0 || box.top > window.innerHeight - 40))
      row?.scrollIntoView({ block: "center", behavior: "instant" })
    window.setTimeout(() => {
      if (cover) cover.style.viewTransitionName = ""
      if (title) title.style.viewTransitionName = ""
    }, 1000 * slowFactor())
  }, [])

  return null
}

// The header's /writing. On a post it is a way back like the browser's, so it
// glides home the same way; anywhere else it is the plain InkLink it wraps.
export const BlogIndexLink = ({
  onClick,
  ...props
}: ComponentProps<typeof InkLink>) => (
  <InkLink
    {...props}
    onClick={(event) => {
      onClick?.(event)
      if (isModified(event)) return
      const post = window.location.pathname.match(
        /^\/blog\/\d{4}\/\d{2}\/\d{2}\/([^/]+)$/,
      )
      if (post) flagPostReturn(post[1])
    }}
  />
)
