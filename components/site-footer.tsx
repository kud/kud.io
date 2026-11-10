import Link from "next/link"
import {
  BlueskyIcon,
  GitHubIcon,
  LinkedInIcon,
} from "@/components/social-icons"
import styles from "./site-footer.module.css"

// The footer for /projects, the project pages and their docs, in the blog's
// footer family on Dusk tokens: site links on the left, the social marks on
// the right, © on a line of its own (Erwann, 2026-11-10).
const YEAR = new Date().getFullYear()

const SITE = [
  { href: "/blog", label: "Writing", external: false },
  { href: "/projects", label: "Projects", external: false },
  { href: "/blog/feed.xml", label: "RSS", external: false },
  { href: "https://referrals.kud.io", label: "Referrals", external: true },
]

const SOCIAL = [
  { href: "https://github.kud.io/", label: "GitHub", Icon: GitHubIcon },
  { href: "https://bsky.kud.io/", label: "Bluesky", Icon: BlueskyIcon },
  { href: "https://linkedin.kud.io/", label: "LinkedIn", Icon: LinkedInIcon },
]

export const SiteFooter = () => (
  <footer className={styles.footer}>
    <nav className={styles.links} aria-label="Site">
      {SITE.map(({ href, label, external }) =>
        external ? (
          <a key={href} href={href}>
            {label} <span aria-hidden>↗</span>
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
