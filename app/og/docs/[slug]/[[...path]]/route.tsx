import { source } from "@/lib/source"
import { getProject } from "@/lib/projects"
import { getIcons } from "@/lib/icons"
import { docsPageTitle, projectShare } from "@/lib/project-share"
import { kindInk, loadImage, renderCard } from "@/lib/og/card"

// Share card for a docs page: the page's own heading as the name, the project
// it belongs to above it, on the Dusk ground the docs open on. An index page
// whose heading only repeats the project's name shows the project instead.
export const dynamic = "force-static"
export const dynamicParams = false

type Params = { slug: string; path?: string[] }

export const generateStaticParams = () =>
  source.getPages().map((page) => {
    const [slug, , ...rest] = page.slugs
    return { slug, path: rest }
  })

export const GET = async (
  _request: Request,
  { params }: { params: Promise<Params> },
) => {
  const { slug, path } = await params
  const page = source.getPage([slug, "docs", ...(path ?? [])])
  if (!page) return new Response("Not found", { status: 404 })

  const project = await getProject(slug)
  const share = project ? projectShare(project) : null
  const name = share?.name ?? slug
  const own = docsPageTitle(page.data.title, name)
  const iconSrc =
    share?.appIcon ?? (await getIcons())[slug] ?? project?.icon ?? null
  const rest = path?.length ? `/${path.join("/")}` : ""

  return renderCard({
    kicker: `Docs · ${share?.kindLabel ?? "Project"}`,
    kickerInk: kindInk(share?.kind ?? ""),
    eyebrow: own ? name : null,
    name: own ?? name,
    description: page.data.description ?? share?.summary,
    icon: await loadImage(iconSrc),
    iconBleed: Boolean(iconSrc && !iconSrc.endsWith(".svg")),
    path: `/projects/${slug}/docs${rest}`,
  })
}
