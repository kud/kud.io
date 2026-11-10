import type { Project } from "@/lib/projects"
import { getApp, appDisplayName, isProduct } from "@/lib/app"
import { isAppCategory, typeFor } from "@/lib/categories"

// What a shared link to a project says about it: the page's <title>, its meta
// description and its share card all read from here, so the card can never
// print an older line than the one the unfurl shows beside it.
export const projectShare = (project: Project) => {
  const app = isAppCategory(project.category) ? getApp(project.slug) : null
  const product = app !== null && isProduct(app)
  return {
    name: app ? appDisplayName(project.slug, app) : project.name,
    summary: (product ? app.summary : null) ?? project.description ?? null,
    kind: product ? "product" : project.category,
    kindLabel: product ? typeFor("product") : typeFor(project.category),
    appIcon: app?.icon ?? null,
  }
}

// Link unfurlers render a title's emoji as text: Slack shows `🖼️ image-view`
// as `:frame_with_picture: image-view`. The page keeps its emoji; the shared
// title drops a leading one.
export const withoutLeadingEmoji = (title: string) =>
  title.replace(/^(?:\p{Extended_Pictographic}|\uFE0F|\u200D|\s)+/u, "")

// A docs page's own heading, or null when it only repeats the project's name
// (a docs index usually does), so the title never reads "x — x docs".
export const docsPageTitle = (title: string, projectName: string) => {
  const own = withoutLeadingEmoji(title).trim()
  const same = (a: string) => a.toLowerCase().replace(/[^a-z0-9]/g, "")
  return same(own) === same(projectName) ? null : own
}
