import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page"
import { createRelativeLink } from "fumadocs-ui/mdx"
import { source } from "@/lib/source"
import { getProject } from "@/lib/projects"
import { docsPageTitle, projectShare } from "@/lib/project-share"
import { getMDXComponents } from "@/components/mdx"

type Params = { slug: string; path?: string[] }

const resolvePage = (slug: string, path?: string[]) =>
  source.getPage([slug, "docs", ...(path ?? [])])

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { slug, path } = await params
  // README-as-landing projects (kud-site-readme) have no separate docs.
  const project = await getProject(slug)
  if (project?.readmeLanding) redirect(`/projects/${slug}`)
  const page = resolvePage(slug, path)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    // Keyed by path so each page mounts afresh and its entrance replays.
    <DocsPage
      key={(path ?? []).join("/")}
      toc={page.data.toc}
      full={page.data.full}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  )
}

export default Page

export const generateStaticParams = () =>
  source.getPages().map((page) => {
    const [slug, , ...rest] = page.slugs
    return { slug, path: rest }
  })

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> => {
  const { slug, path } = await params
  const page = resolvePage(slug, path)
  if (!page) notFound()

  const project = await getProject(slug)
  const share = project ? projectShare(project) : null
  const name = share?.name ?? slug
  const own = docsPageTitle(page.data.title, name)
  const title = own ? `${own} — ${name} docs` : `${name} docs — Erwann Mest`
  const description = page.data.description ?? share?.summary ?? undefined
  const rest = path?.length ? `/${path.join("/")}` : ""
  const url = `https://kud.io/projects/${slug}/docs${rest}`
  // Listed explicitly: this page's own openGraph replaces the project card it
  // would otherwise inherit. The card is a static route (app/og/docs), like
  // the blog's, so it renders per docs page rather than per project.
  const images = [`/og/docs/${slug}${rest}`]

  return {
    title,
    description,
    openGraph: { type: "article", url, title, description, images },
    twitter: { title, description, images },
  }
}
