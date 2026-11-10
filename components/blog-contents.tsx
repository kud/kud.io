"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import styles from "./blog-contents.module.css"

type Heading = { id: string; text: string }

const HEADINGS = "article h2[id]"

// The headings are read from the rendered post, so the rail can never drift
// from what the reader sees. The server snapshot is empty: the rail only
// appears once the title has scrolled away, so rendering it after hydration
// costs nothing visible. A string snapshot keeps reads stable between renders.
const readHeadings = () =>
  JSON.stringify(
    Array.from(document.querySelectorAll<HTMLHeadingElement>(HEADINGS)).map(
      (node) => ({ id: node.id, text: node.textContent ?? "" }),
    ),
  )

const subscribe = () => () => {}

// "On this page": fixed in the right gutter at 1280px and wider, hidden below.
// It fades in once the title has scrolled away, marks the section being read,
// and steps aside while a figure wider than the column passes under it.
export const BlogContents = () => {
  const raw = useSyncExternalStore(subscribe, readHeadings, () => "[]")
  const headings: Heading[] = JSON.parse(raw)
  const [active, setActive] = useState<string | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    // The current section is the last heading above the top third of the
    // viewport: reading position, not whichever heading happens to be visible.
    const update = () => {
      const line = window.innerHeight * 0.33
      let current: string | null = null
      for (const node of document.querySelectorAll(HEADINGS)) {
        if (node.getBoundingClientRect().top <= line) current = node.id
      }
      setActive(current)

      const title = document.querySelector("article h1")
      const pastTitle = title ? title.getBoundingClientRect().bottom < 0 : true
      // Any figure wider than the 790px shell is a breakout (an image stage,
      // a diagram, a long code card); a narrow card stays in the column.
      const wide = Array.from(
        document.querySelectorAll(
          'article [class*="imageStage"], article [class*="diagram"], article [class*="codeStage"] > *',
        ),
      ).some((el) => {
        const box = el.getBoundingClientRect()
        return box.width > 800 && box.top < 420 && box.bottom > 80
      })
      setShown(pastTitle && !wide)
    }

    const frame = requestAnimationFrame(update)
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  if (headings.length < 3) return null

  return (
    <nav
      className={styles.contents}
      data-shown={shown || undefined}
      aria-label="On this page"
    >
      <p className={styles.label}>On this page</p>
      <ol>
        {headings.map(({ id, text }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
