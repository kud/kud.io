import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/blog"
import { getProjects } from "@/lib/projects"
import { source } from "@/lib/source"

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

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const [posts, projects] = await Promise.all([getAllPosts(), getProjects()])

  const newest = (values: string[]) =>
    values.filter(Boolean).sort().at(-1) ?? undefined

  return [
    { url: SITE },
    {
      url: `${SITE}/blog`,
      lastModified: newest(posts.map((post) => post.updated ?? post.date)),
    },
    {
      url: `${SITE}/projects`,
      lastModified: newest(projects.map((project) => project.pushedAt)),
    },
    ...posts.map((post) => ({
      url: `${SITE}/blog/${post.slug}`,
      lastModified: post.updated || post.date || undefined,
    })),
    ...projects.map((project) => ({
      url: `${SITE}/projects/${project.slug}`,
      lastModified: project.pushedAt || undefined,
    })),
    ...docsRoutes(),
  ]
}

export default sitemap
