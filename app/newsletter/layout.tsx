import type { ReactNode } from "react"
import { InkLink as Link } from "@/components/ink-link"
import { BLOG_ROOT_ID, ThemeScopeScript } from "@/components/scoped-theme"
import { SiteFooter } from "@/components/site-footer"
import { ThemePicker } from "@/components/theme-picker"
import blog from "../blog/blog.module.css"
import styles from "./newsletter.module.css"

// The newsletter is read the way Writing is read, so it wears Writing's shell:
// the same tokens (blog.module.css keys them on #blog-root), the same picker,
// site line and footer, and so the same light, dark and Ink. Only one of the
// two layouts is ever on a page, so the shared id stays unique.
const NewsletterLayout = ({ children }: { children: ReactNode }) => (
  <div
    id={BLOG_ROOT_ID}
    data-theme="system"
    data-theme-scope
    suppressHydrationWarning
  >
    <ThemeScopeScript />
    <ThemePicker className="dusk-picker-top blog-picker" />
    <div className={`${blog.wrap} ${styles.wrap}`}>
      <div className={blog.site}>
        <Link href="/" className={blog.who}>
          kud.io
        </Link>
        <Link href="/newsletter" className={blog.where}>
          /newsletter
        </Link>
      </div>
      {children}
    </div>
    <SiteFooter className={blog.footer} />
  </div>
)

export default NewsletterLayout
