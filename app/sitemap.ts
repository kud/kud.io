import type { MetadataRoute } from "next"
import { getAllPosts, postPath } from "@/lib/blog"
import { getProjects } from "@/lib/projects"
import { getListedRecords } from "@/lib/listed-apps"
import { source } from "@/lib/source"
import { listEditionDates } from "@/lib/newsletter/content"
import { editionPath } from "@/lib/newsletter/language"

// Absolute URLs, matching the metadataBase in app/layout.tsx. A sitemap is read
// by crawlers that have no page context to resolve a relative path against, so
// this is the one place on the site that cannot lean on metadataBase.
const SITE = "https://kud.io"

// Docs pages are filtered to authored .mdx, the same test projectHasExtraDocs
// uses: a project with no docs/ still prerenders a generated docs/index.md that
// re-shows its README, and advertising that URL would submit the landing's own
// content a second time under a different address.
const docsRoutes = () =>
  source
    .getPages()
    .filter((page) => page.path.endsWith(".mdx"))
    .map((page) => ({ url: `${SITE}${page.url}` }))

// The newsletter has one URL per page and language, ?lang=fr or ?lang=en (the
// proxy serves English from /newsletter/en). The bare address picks a language
// per reader, so it is the x-default.
const bilingual = (path: string, lastModified?: string) => ({
  url: `${SITE}${path}`,
  lastModified,
  alternates: {
    languages: {
      fr: `${SITE}${path}?lang=fr`,
      "en-GB": `${SITE}${path}?lang=en`,
      "x-default": `${SITE}${path}`,
    },
  },
})

const newsletterRoutes = (dates: string[]) => [
  bilingual("/newsletter/editions", dates[0]),
  ...dates.map((date) => bilingual(editionPath(date), date)),
  { url: `${SITE}/newsletter/privacy` },
]

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const [posts, projects, editions] = await Promise.all([
    getAllPosts(),
    getProjects(),
    listEditionDates(),
  ])

  const newest = (values: string[]) =>
    values.filter(Boolean).sort().at(-1) ?? undefined

  return [
    { url: SITE },
    {
      url: `${SITE}/blog`,
      lastModified: newest(posts.map((post) => post.updated || post.date)),
    },
    {
      url: `${SITE}/projects`,
      lastModified: newest(projects.map((project) => project.pushedAt)),
    },
    ...posts.map((post) => ({
      url: `${SITE}${postPath(post)}`,
      lastModified: post.updated || post.date || undefined,
    })),
    ...projects.map((project) => ({
      url: `${SITE}/projects/${project.slug}`,
      lastModified: project.pushedAt || undefined,
    })),
    ...getListedRecords().map((project) => ({
      url: `${SITE}/projects/${project.slug}`,
    })),
    ...docsRoutes(),
    ...newsletterRoutes(editions),
  ]
}

export default sitemap
