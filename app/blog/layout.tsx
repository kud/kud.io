import type { ReactNode } from "react"
import { InkLink as Link } from "@/components/ink-link"
import { BLOG_ROOT_ID, ThemeScopeScript } from "@/components/scoped-theme"
import { BlogMorphPreview } from "@/components/blog-morph-preview"
import { BlogIndexLink } from "@/components/post-morph-link"
import { SiteFooter } from "@/components/site-footer"
import { ThemePicker } from "@/components/theme-picker"
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
  >
    <ThemeScopeScript />
    {/* The same picker, in the same corner, as every other themed page. */}
    <ThemePicker className="dusk-picker-top blog-picker" />
    <div className={styles.wrap}>
      <div className={styles.site} data-morph-still>
        <Link href="/" className={styles.who}>
          kud.io
        </Link>
        <BlogIndexLink href="/blog" className={styles.where}>
          /writing
        </BlogIndexLink>
      </div>
      {children}
    </div>
    {/* Outside .wrap: the footer restates the column itself (blog.module.css). */}
    <SiteFooter className={styles.footer} />
    <BlogMorphPreview />
  </div>
)

export default BlogLayout
