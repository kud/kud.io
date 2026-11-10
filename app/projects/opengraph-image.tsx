import { getProjects } from "@/lib/projects"
import { getApp } from "@/lib/app"
import { isAppCategory } from "@/lib/categories"
import { PROJECTS_COPY } from "@/lib/section-copy"
import { CARD_SIZE, loadImage, renderCard } from "@/lib/og/card"

// The /projects share card: the catalogue's count, its own name and blurb, and
// the app icons that lead the page, on the Dusk ground the page opens on.
export const alt = "Projects by Erwann Mest on kud.io"
export const size = CARD_SIZE
export const contentType = "image/png"

const Image = async () => {
  const projects = await getProjects()
  const appIcons = projects
    .filter((project) => isAppCategory(project.category))
    .map((project) => getApp(project.slug).icon)
    .filter((icon): icon is string => Boolean(icon))
    .slice(0, 4)
  const strip = (await Promise.all(appIcons.map((icon) => loadImage(icon))))
    .filter((icon): icon is string => icon !== null)

  return renderCard({
    kicker: `${projects.length} projects`,
    name: PROJECTS_COPY.title,
    description: PROJECTS_COPY.description,
    strip,
    path: "/projects",
  })
}

export default Image
