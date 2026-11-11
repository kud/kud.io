"use client"

import { useEffect, useState } from "react"
import { currentSection } from "@/components/reading-position"
import styles from "./rail-toc.module.css"

export type TocItem = { url: string; title: React.ReactNode }

// "On this page", under the infobox in a project's right rail. Hidden once the
// rail stacks above the story, where it would only push the reading down.
// Marks the section being read the way the blog's rail does.
export const RailToc = ({ items }: { items: TocItem[] }) => {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.url.replace(/^#/, "")))
      .filter((node): node is HTMLElement => node !== null)
    const update = () => setActive(currentSection(headings))
    const frame = requestAnimationFrame(update)
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [items])

  return items.length > 1 ? (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.title}>On this page</p>
      <ul>
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              aria-current={
                active !== null && item.url === `#${active}`
                  ? "location"
                  : undefined
              }
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  ) : null
}
