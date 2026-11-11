import { getApp, isProduct, productHost, productUrl } from "@/lib/app"
import { isAppCategory, typeFor } from "@/lib/categories"
import { coverOf } from "@/lib/cover"
import type { Project } from "@/lib/projects"

// Preview only: the few facts a project peek shows, all of them already on
// the project's own page. Built on the server for /projects so the overlay
// opens with nothing to fetch.
export type Peek = {
  slug: string
  name: string
  type: string
  description: string | null
  icon: string | null
  cover: string | null
  shots: string[]
  primary: { label: string; href: string; external: boolean } | null
}

type Listed = Project & { icon?: string | null }

// /projects moves a beansontoast product into its own "product" section.
const isAppLike = (category: string) =>
  category === "product" || isAppCategory(category)

const primaryOf = (project: Listed): Peek["primary"] => {
  if (isAppLike(project.category)) {
    const app = getApp(project.slug)
    if (isProduct(app)) {
      const href = productUrl(app)
      return href
        ? { label: `Open ${productHost(app)}`, href, external: true }
        : null
    }
    const href = app.launchUrl ?? project.homepage
    return href
      ? { label: app.launchLabel ?? "Launch app", href, external: true }
      : null
  }
  if (project.category === "raycast" && project.installUrl)
    return {
      label: "Install extension",
      href: project.installUrl,
      external: false,
    }
  if (project.category === "webext" && project.storeUrl)
    return { label: "Install add-on", href: project.storeUrl, external: true }
  return { label: "GitHub", href: project.repoUrl, external: true }
}

export const peekOf = (project: Listed): Peek => {
  const app = isAppLike(project.category) ? getApp(project.slug) : null
  return {
    slug: project.slug,
    name: project.name,
    type: app && isProduct(app) ? "Product" : typeFor(project.category),
    description: project.description,
    icon: project.icon ?? null,
    cover: coverOf(project),
    shots: (app?.screenshots ?? []).slice(0, 2),
    primary: primaryOf(project),
  }
}
