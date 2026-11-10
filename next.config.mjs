import { readFileSync } from "node:fs"
import { createMDX } from "fumadocs-mdx/next"

// Written by scripts/sync-notion.js from posts marked Retired in Notion.
const readBlogRedirects = () => {
  try {
    return JSON.parse(readFileSync("content/blog-redirects.json", "utf8"))
  } catch {
    return []
  }
}

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // React-PDF bundles its own reconciler + Yoga layout engine; keep it as a
  // runtime Node dependency rather than letting the bundler inline it.
  serverExternalPackages: ["@react-pdf/renderer"],

  // The share cards regenerate with their pages (hourly, the GitHub fetch's
  // revalidate), so the function that redraws one needs the card font and the
  // icons and art it reads from disk; public/ is not in a function by default.
  outputFileTracingIncludes: {
    "/projects/**/*-image": [
      "./lib/og/fonts/**",
      "./public/apps/**",
      "./public/projects/art/**",
    ],
    "/og/docs/**": ["./lib/og/fonts/**", "./public/apps/**"],
  },

  // Post URLs nest by date, so a reader can truncate to /blog/2020/06/ or
  // /blog/2020/. Those are meant to become archive pages; until they do a
  // redirect is the honest placeholder, because the alternative is a URL
  // shape that invites a 404. Replace these with real routes, do not keep
  // both — a redirect shadowing a page is a silent way to lose it.
  redirects: async () => [
    { source: "/blog/:year(\\d{4})", destination: "/blog", permanent: false },
    {
      source: "/blog/:year(\\d{4})/:month(\\d{2})",
      destination: "/blog",
      permanent: false,
    },
    // A retired post folded into a later one lands on that post. Listed before
    // the generated file, which sends every retired post to the index: the
    // first matching redirect wins.
    {
      source: "/blog/2017/12/01/macos-ssh-passphrase-fix",
      destination: "/blog/2020/06/08/ssh-config-include",
      permanent: true,
    },
    // Referrals left the catalogue for a footer link; its old landing goes
    // straight to the site.
    {
      source: "/projects/referrals",
      destination: "https://referrals.kud.io",
      permanent: true,
    },
    ...readBlogRedirects().map((redirect) => ({
      ...redirect,
      permanent: true,
    })),
  ],
}

const withMDX = createMDX()

export default withMDX(config)
