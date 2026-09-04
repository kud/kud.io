import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // React-PDF bundles its own reconciler + Yoga layout engine; keep it as a
  // runtime Node dependency rather than letting the bundler inline it.
  serverExternalPackages: ["@react-pdf/renderer"],

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
  ],
}

const withMDX = createMDX()

export default withMDX(config)
