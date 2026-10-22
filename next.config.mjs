import { createMDX } from "fumadocs-mdx/next"

// Posts unpublished in Notion. Their URLs may still be linked from elsewhere,
// so they land on the index rather than a 404.
const retiredPosts = [
  "2015/04/03/avoid-popup-blockers-with-ajax",
  "2017/09/13/bck-i-search",
  "2019/10/16/fixme-js",
  "2019/10/30/extending-styled-components",
  "2019/11/03/composing-styled-components",
  "2020/03/06/reactive-search-filter-reset",
  "2020/05/09/deploying-next-js-on-gh-pages",
  "2020/05/11/markdown-editing-2-editors",
  "2020/05/14/markdown-editing-3-prettier",
  "2020/06/13/last-array-item-destructuring",
  "2021/01/31/responsive-design-in-react",
]

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
    ...retiredPosts.map((path) => ({
      source: `/blog/${path}`,
      destination: "/blog",
      permanent: true,
    })),
    {
      source: "/blog/2017/12/01/macos-ssh-passphrase-fix",
      destination: "/blog/2020/06/08/ssh-config-include",
      permanent: true,
    },
  ],
}

const withMDX = createMDX()

export default withMDX(config)
