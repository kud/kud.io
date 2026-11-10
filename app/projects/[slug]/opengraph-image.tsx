import { getProject, getProjects } from "@/lib/projects"
import { getIcons } from "@/lib/icons"
import { ART } from "@/lib/art"
import { projectShare } from "@/lib/project-share"
import { CARD_SIZE, kindInk, loadImage, renderCard } from "@/lib/og/card"

// Prerender one card per project at build time (mirrors the page's own
// generateStaticParams) so crawlers fetch a static PNG instead of triggering a
// GitHub API round-trip on demand.
export const generateStaticParams = async () =>
  (await getProjects()).map((project) => ({ slug: project.slug }))

// Per-project share card: what it is, its icon, its name and the same summary
// as the page's meta description, on the Dusk ground its page opens on. A
// project with delivered art shows the drawing beside the copy, as its hero does.
export const alt = "Project on kud.io"
export const size = CARD_SIZE
export const contentType = "image/png"

const Image = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const project = await getProject(slug)
  const share = project ? projectShare(project) : null
  const iconSrc =
    share?.appIcon ?? (await getIcons())[slug] ?? project?.icon ?? null
  const [icon, art] = await Promise.all([
    loadImage(iconSrc),
    loadImage(ART[slug], { width: 1084 }),
  ])

  return renderCard({
    kicker: share?.kindLabel ?? "Project",
    kickerInk: kindInk(share?.kind ?? ""),
    name: share?.name ?? slug,
    description: share?.summary,
    icon,
    iconBleed: Boolean(iconSrc && !iconSrc.endsWith(".svg")),
    art,
    path: `/projects/${slug}`,
  })
}

export default Image
