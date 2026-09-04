import type { ReactNode } from "react"
import Link from "next/link"
import {
  BLOG_ROOT_ID,
  BLOG_THEME_SCRIPT,
  BlogThemeControl,
} from "@/components/blog-theme"
import { mono } from "./fonts"
import styles from "./blog.module.css"

// The wrapper lives in the layout, not in either page, because it is the thing
// the theme is stamped on: two copies would be two ids, and the pre-paint
// script resolves exactly one. suppressHydrationWarning is required — the
// script below rewrites data-theme before React ever sees the element.
const BlogLayout = ({ children }: { children: ReactNode }) => (
  <div
    id={BLOG_ROOT_ID}
    data-theme="system"
    suppressHydrationWarning
    className={mono.variable}
  >
    <script dangerouslySetInnerHTML={{ __html: BLOG_THEME_SCRIPT }} />
    <div className={styles.wrap}>
      {/* A div, not a p: BlogThemeControl renders a div, and a div inside a
          p makes the browser close the paragraph early — which silently
          drops the pill out of the flex row it is meant to sit in. */}
      <div className={styles.site}>
        <Link href="/" className={styles.who}>
          kud.io
        </Link>
        <Link href="/blog" className={styles.where}>
          /writing
        </Link>
        <BlogThemeControl className={styles.theme} />
      </div>
      {children}
    </div>
  </div>
)

export default BlogLayout
