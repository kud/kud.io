"use client"

import { useEffect } from "react"
import { pickMore } from "@/lib/blog-more"

// The inline script draws the picks before first paint on a full load. A
// client-side hop between posts renders the list without running it, and
// keyed rows can come back carrying the last post's marks, so redraw here
// whenever the marks were made for another post. The list sits below the
// fold, so this one lands out of sight.
export const BlogMorePicks = ({ slug }: { slug: string }) => {
  useEffect(() => {
    const nav = document.querySelector("nav[data-more]")
    if (nav && nav.getAttribute("data-for") !== slug) pickMore(nav, slug)
  }, [slug])

  return null
}
