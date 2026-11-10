import { InkLink as Link } from "@/components/ink-link"
import {
  BlueskyIcon,
  GitHubIcon,
  LinkedInIcon,
} from "@/components/social-icons"
import styles from "./site-footer.module.css"

// The one footer for the whole site: /projects, the project pages, their docs
// and the blog, which lends it its own greys (app/blog/blog.module.css). On Dusk
// tokens by default: site links on the left, the social marks on the right,
// © on a line of its own (Erwann, 2026-11-10).
const YEAR = new Date().getFullYear()

// Internal pages go through InkLink, which inks only on a change of world
// (components/ink.ts). The feed is a plain <a>: it is a route handler, not a
// page, so there is nothing for a client route to prefetch or ink into.
const SITE = [
  { href: "/blog", label: "Writing", external: false },
  { href: "/projects", label: "Projects", external: false },
  { href: "/blog/feed.xml", label: "RSS", external: false, plain: true },
  { href: "https://referrals.kud.io", label: "Referrals", external: true },
]

const SOCIAL = [
  { href: "https://github.kud.io/", label: "GitHub", Icon: GitHubIcon },
  { href: "https://bsky.kud.io/", label: "Bluesky", Icon: BlueskyIcon },
  { href: "https://linkedin.kud.io/", label: "LinkedIn", Icon: LinkedInIcon },
]

export const SiteFooter = ({ className }: { className?: string }) => (
  <footer
    className={className ? `${styles.footer} ${className}` : styles.footer}
  >
    <nav className={styles.links} aria-label="Site">
      {SITE.map(({ href, label, external, plain }) =>
        external ? (
          <a key={href} href={href}>
            {label} <span aria-hidden>↗</span>
          </a>
        ) : plain ? (
          <a key={href} href={href}>
            {label}
          </a>
        ) : (
          <Link key={href} href={href}>
            {label}
          </Link>
        ),
      )}
    </nav>
    <ul className={styles.marks}>
      {SOCIAL.map(({ href, label, Icon }) => (
        <li key={href}>
          <a href={href} aria-label={label} target="_blank" rel="noreferrer">
            <Icon className={styles.mark} />
          </a>
        </li>
      ))}
    </ul>
    <span className={styles.copy}>© {YEAR} Erwann Mest</span>
  </footer>
)
