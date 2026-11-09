import type { ReactNode } from "react"
import { InkLink as Link } from "@/components/ink-link"
import {
  BLOG_ROOT_ID,
  ThemeScopeScript,
} from "@/components/scoped-theme"
import { ThemePicker } from "@/components/theme-picker"
import { mono } from "./fonts"
import styles from "./blog.module.css"

// The wrapper lives in the layout, not in either page, because it is the thing
// the theme is stamped on: two copies would be two ids, and the mermaid and
// image viewers resolve exactly one. suppressHydrationWarning is required —
// ThemeScopeScript rewrites data-theme before React ever sees the element.
const BlogLayout = ({ children }: { children: ReactNode }) => (
  <div
    id={BLOG_ROOT_ID}
    data-theme="system"
    data-theme-scope
    suppressHydrationWarning
    className={mono.variable}
  >
    <ThemeScopeScript />
    {/* The same picker, in the same corner, as every other themed page. */}
    <ThemePicker className="dusk-picker-top blog-picker" />
    <div className={styles.wrap}>
      <div className={styles.site}>
        <Link href="/" className={styles.who}>
          kud.io
        </Link>
        <Link href="/blog" className={styles.where}>
          /writing
        </Link>
      </div>
      {children}
    </div>
    {/* Outside .wrap, because .footer carries its own max-width and gutters —
        inside, both would be inert and the footer text would sit 18px in from
        the body's. The feed link is a plain <a>: feed.xml is a route handler,
        not a page, so there is no client route for Link to prefetch. */}
    <footer className={styles.footer}>
      <a href="/blog/feed.xml">RSS</a>
      <Link href="/">
        kud.io <span aria-hidden>↗</span>
      </Link>
    </footer>
  </div>
)

export default BlogLayout
