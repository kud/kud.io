"use client"

import type { ComponentProps, MouseEvent } from "react"
import { MorphLink } from "@/components/morph-link"

// The names a post owns on the index and on its own page: its cover and its
// title. Both carry a view-transition-class too (blog page.module.css and the
// post's page.module.css), so global.css can treat every cover alike.
export const postMorphNames = (slug: string) => ({
  cover: `post-cover-${slug}`,
  title: `post-title-${slug}`,
})

const isModified = (event: MouseEvent) =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey

type Props = ComponentProps<typeof MorphLink> & { slug: string }

// Index → post, inside the blog: a glide, not ink (ink marks a change of
// world). The index names nothing in its markup; the pressed row's cover and
// title are named here, at the click, after MorphLink has stripped every
// other name and before the browser takes its snapshot. Naming them up front
// would put every row into the snapshot on a Back to the index, the bug
// MorphArrival exists to undo on /projects.
export const PostMorphLink = ({ slug, onClick, ...props }: Props) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (isModified(event)) return
    // Preview only: ?morph=cover picks anim-2 (the cover alone), ?morph=solo
    // anim-3, ?morph=none today's plain cross-fade (anim-0, the baseline).
    const variant = new URLSearchParams(location.search).get("morph")
    if (variant === "none") {
      delete document.documentElement.dataset.vt
      return
    }
    if (variant) document.documentElement.dataset.blogMorph = variant
    else delete document.documentElement.dataset.blogMorph

    const row = event.currentTarget.closest("li")
    const names = postMorphNames(slug)
    const cover = row?.querySelector<HTMLElement>("[data-morph-cover]")
    const title = row?.querySelector<HTMLElement>("[data-morph-title]")
    if (cover) cover.style.viewTransitionName = names.cover
    if (title) title.style.viewTransitionName = names.title
  }

  return <MorphLink {...props} onClick={handleClick} />
}
