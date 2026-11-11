// The site's own links and the places Erwann lives elsewhere, shared by the
// footer (components/site-footer.tsx) and the launcher's Elsewhere group
// (components/launcher/launcher.tsx), so an address changes in one place.
// Dependency-free, and no icons: each consumer maps a key to its own mark.

export type SiteLink = {
  href: string
  label: string
  external: boolean
  // A same-site URL that is not a page (the feed): a plain <a>, no client route.
  plain?: boolean
}

export type ElsewhereKey =
  "referrals" | "beansontoast" | "github" | "bluesky" | "linkedin"

export type ElsewhereLink = {
  key: ElsewhereKey
  label: string
  href: string
}

const REFERRALS: ElsewhereLink = {
  key: "referrals",
  label: "Referrals",
  href: "https://referrals.kud.io",
}

const BEANS_ON_TOAST: ElsewhereLink = {
  key: "beansontoast",
  label: "Beans on Toast",
  href: "https://beansontoast.app",
}

export const SOCIAL: ElsewhereLink[] = [
  {
    key: "github",
    label: "GitHub",
    href: "https://github.kud.io/",
  },
  {
    key: "bluesky",
    label: "Bluesky",
    href: "https://bsky.kud.io/",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.kud.io/",
  },
]

export const SITE: SiteLink[] = [
  { href: "/blog", label: "Writing", external: false },
  { href: "/projects", label: "Projects", external: false },
  { href: "/blog/feed.xml", label: "RSS", external: false, plain: true },
  { href: REFERRALS.href, label: REFERRALS.label, external: true },
]

export const ELSEWHERE: ElsewhereLink[] = [REFERRALS, BEANS_ON_TOAST, ...SOCIAL]

// The domain a link goes to, shown as its hint: "bsky.kud.io".
export const hostOf = (href: string): string => {
  try {
    return new URL(href).host.replace(/^www\./, "")
  } catch {
    return href
  }
}
