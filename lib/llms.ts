import { getAllPosts, postPath } from "@/lib/blog"
import { getProjects, type Project } from "@/lib/projects"
import { getApp, appDisplayName } from "@/lib/app"
import { groupByCategory, isAppCategory } from "@/lib/categories"
import { source } from "@/lib/source"

// The llms.txt proposal (https://llmstxt.org): an H1, a blockquote summary, a
// little prose, then H2 sections of `- [name](url): notes` link lists, with
// `## Optional` last for the links an agent may skip. Every list is derived from
// the same catalogue, blog and docs sources the pages render, so it cannot drift.

const SITE = "https://kud.io"
const APPS_HOME = "https://beansontoast.app"

export type LlmsLink = { name: string; url: string; notes?: string | null }
export type LlmsSection = { title: string; links: LlmsLink[] }

export type LlmsDocument = {
  title: string
  summary: string
  details: string[]
  sections: LlmsSection[]
  optional: LlmsLink[]
}

// Link text is markdown, so a bracket in a name would close the link early.
const escapeLinkText = (text: string) => text.replace(/([[\]\\])/g, "\\$1")

// Notes run to the end of the line; a stray newline would start a new list item.
const singleLine = (text: string) => text.replace(/\s+/g, " ").trim()

const renderLink = ({ name, url, notes }: LlmsLink) =>
  notes
    ? `- [${escapeLinkText(name)}](${url}): ${singleLine(notes)}`
    : `- [${escapeLinkText(name)}](${url})`

export const renderLlmsTxt = (doc: LlmsDocument): string => {
  const sections = doc.optional.length
    ? [...doc.sections, { title: "Optional", links: doc.optional }]
    : doc.sections

  return (
    [
      `# ${doc.title}`,
      `> ${singleLine(doc.summary)}`,
      ...doc.details,
      ...sections
        .filter((section) => section.links.length > 0)
        .map((section) =>
          [`## ${section.title}`, ...section.links.map(renderLink)].join("\n"),
        ),
    ].join("\n\n") + "\n"
  )
}

// Docs titles lead with an emoji by house style (it is the sidebar label); in a
// plain-text list it is noise.
const stripLeadingEmoji = (text: string) =>
  text.replace(
    /^\p{Extended_Pictographic}[\p{Extended_Pictographic}\p{Emoji_Component}]*\s*/u,
    "",
  )

const projectPage = (project: Project) => `${SITE}/projects/${project.slug}`

// Apps are linked to where they run, not to their kud.io write-up: the same
// launchUrl ?? homepage fallback the app landing uses for its Launch button.
const toAppLink = (project: Project): LlmsLink => {
  const app = getApp(project.slug)
  return {
    name: appDisplayName(project.slug, app),
    url: app.launchUrl ?? project.homepage ?? projectPage(project),
    notes: app.tagline ?? project.description,
  }
}

const toProjectLink = (project: Project): LlmsLink => ({
  name: project.name,
  url: projectPage(project),
  notes: project.description,
})

// Authored .mdx only, the test the sitemap uses: a project without docs/ gets a
// generated page that repeats its README, already covered by the project link.
const docsLinks = (): LlmsLink[] =>
  source
    .getPages()
    .filter((page) => page.path.endsWith(".mdx"))
    .map((page) => ({
      name: `${page.slugs[0]}: ${stripLeadingEmoji(page.data.title ?? page.slugs.at(-1) ?? "")}`,
      url: `${SITE}${page.url}`,
      notes: page.data.description,
    }))
    .sort((a, b) => a.url.localeCompare(b.url))

export const buildLlmsDocument = async (): Promise<LlmsDocument> => {
  const [projects, posts] = await Promise.all([getProjects(), getAllPosts()])
  const groups = groupByCategory(projects)

  const apps = groups
    .filter((group) => isAppCategory(group.key))
    .map((group) => ({
      title: group.name,
      links: group.items.map(toAppLink),
    }))

  const catalogue = groups
    .filter((group) => !isAppCategory(group.key))
    .map((group) => ({
      title: group.name,
      links: group.items.map(toProjectLink),
    }))

  const writing = {
    title: "Writing",
    links: posts.map((post) => ({
      name: post.title,
      url: `${SITE}${postPath(post)}`,
      notes: [post.date.slice(0, 10), post.description]
        .filter(Boolean)
        .join(" — "),
    })),
  }

  return {
    title: "kud.io",
    summary:
      "Personal site of Erwann Mest (kud), a systems designer and lead software engineer in London: his writing and the catalogue of open-source software he builds — web apps, CLIs, MCP servers, Claude Code tools, libraries, editor and browser extensions.",
    details: [
      `[beansontoast.app](${APPS_HOME}) is the umbrella for Erwann's web apps; some still run on older addresses, so the Apps section links each one to wherever it runs today. Every other project links to its page on kud.io, which renders the repository's README and, where the project has them, multi-page docs under \`/projects/<slug>/docs\`. Source code lives on GitHub under [kud](https://github.com/kud).`,
      "Project pages and docs are synced from each repository, so the repository is the source of truth when the two disagree.",
    ],
    sections: [
      ...apps,
      {
        title: "Site",
        links: [
          {
            name: "Home",
            url: SITE,
            notes: "Who Erwann is, his experience and focus.",
          },
          {
            name: "Projects",
            url: `${SITE}/projects`,
            notes: "The full catalogue, grouped by kind.",
          },
          {
            name: "Writing",
            url: `${SITE}/blog`,
            notes: "Notes on systems, tooling, and the trade-offs behind them.",
          },
        ],
      },
      writing,
      ...catalogue,
    ],
    optional: [
      { name: "CV (PDF)", url: `${SITE}/cv.pdf` },
      { name: "Writing feed (RSS)", url: `${SITE}/blog/feed.xml` },
      ...docsLinks(),
    ],
  }
}
