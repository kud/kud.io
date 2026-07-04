import { getRaycastProjects } from "@/lib/raycast"
import { enrichWebextProjects } from "@/lib/webext"
import { getApp } from "@/lib/app"

const OWNER = "kud"
const TOPIC = "kud-site"

export type Project = {
  slug: string
  name: string
  description: string | null
  category: string
  // Cross-cutting product family (`kud-site-eco-<name>`) — orthogonal to
  // category. A project belongs to at most one ecosystem (e.g. "qobuz" unites
  // the qobuz lib, CLI, and MCP server); null for standalone projects.
  ecosystem: string | null
  readmeLanding: boolean
  tags: string[]
  icon?: string | null
  // Decorative accent (hex) for the app-launcher tiles, overlaid from app.json
  // for `kud-site-app` projects. Absent for every other category.
  accent?: string | null
  topics: string[]
  repoUrl: string
  homepage: string | null
  stars: number
  language: string | null
  license: string | null
  pushedAt: string
  // Raycast extensions only: links to the Raycast store + the raycast:// install
  // deep link, and a download count shown in place of stars (they have no GitHub
  // repo of their own).
  storeUrl?: string | null
  installUrl?: string | null
  downloads?: number | null
  // Firefox add-ons (`kud-site-webext`) only: the live "average daily users"
  // figure from AMO, shown in place of stars/installs.
  users?: number | null
}

// Reserved `kud-site-*` topics that are NOT categories: behaviour flags and the
// `kud-site-tag-*` content tags. The category detector must skip these.
const README_TOPIC = `${TOPIC}-readme`
const TAG_PREFIX = `${TOPIC}-tag-`
const ECO_PREFIX = `${TOPIC}-eco-`
const isCategoryTopic = (topic: string) =>
  topic.startsWith(`${TOPIC}-`) &&
  topic !== README_TOPIC &&
  !topic.startsWith(TAG_PREFIX) &&
  !topic.startsWith(ECO_PREFIX)

// Content tags come from `kud-site-tag-<tag>` topics — what a project is FOR
// (ai, productivity…), orthogonal to its language.
const tagsFromTopics = (topics: string[]): string[] =>
  topics
    .filter((topic) => topic.startsWith(TAG_PREFIX))
    .map((topic) => topic.slice(TAG_PREFIX.length))

// The product family from a `kud-site-eco-<name>` topic. Orthogonal to category:
// a repo keeps its own category (CLI, MCP…) and optionally joins one ecosystem.
const ecoFromTopics = (topics: string[]): string | null => {
  const topic = topics.find((item) => item.startsWith(ECO_PREFIX))
  return topic ? topic.slice(ECO_PREFIX.length) : null
}

type Repo = {
  name: string
  description: string | null
  topics?: string[]
  html_url: string
  homepage: string | null
  stargazers_count: number
  language: string | null
  license: { spdx_id: string | null } | null
  pushed_at: string
}

export const ghHeaders = (): HeadersInit => {
  const token = process.env.GITHUB_TOKEN
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// The category lives on the repo as a `kud-site-<category>` topic, so the
// showcase grouping is driven entirely from GitHub — no slug rules to maintain.
const categoryFromTopics = (topics: string[]): string => {
  const tag = topics.find(isCategoryTopic)
  return tag ? tag.slice(TOPIC.length + 1) : "cli"
}

// Repo descriptions often lead with an emoji — charming on GitHub, noisy in the
// project grid. Strip a leading emoji cluster so the cards read cleanly; the repo
// keeps its emoji untouched.
const stripLeadingEmoji = (text: string | null): string | null =>
  text?.replace(
    /^\p{Extended_Pictographic}[\p{Extended_Pictographic}\p{Emoji_Component}]*\s*/u,
    "",
  ) ?? null

const toProject = (repo: Repo): Project => ({
  slug: repo.name,
  // Display name defaults to the repo slug; any project may override it with a
  // `name` in content/projects/<slug>/app.json (e.g. "foxhop" → "Fox Hop").
  name: getApp(repo.name).name ?? repo.name,
  description: stripLeadingEmoji(repo.description),
  category: categoryFromTopics(repo.topics ?? []),
  ecosystem: ecoFromTopics(repo.topics ?? []),
  // `kud-site-readme`: the README is the whole product (curated lists) — render
  // it on the landing and skip the docs route.
  readmeLanding: (repo.topics ?? []).includes(README_TOPIC),
  tags: tagsFromTopics(repo.topics ?? []),
  topics: (repo.topics ?? []).filter(
    (topic) => topic !== TOPIC && !topic.startsWith(`${TOPIC}-`),
  ),
  repoUrl: repo.html_url,
  homepage: repo.homepage,
  stars: repo.stargazers_count,
  language: repo.language,
  license:
    repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION"
      ? repo.license.spdx_id
      : null,
  pushedAt: repo.pushed_at,
})

export const getProjects = async (): Promise<Project[]> => {
  const res = await fetch(
    `https://api.github.com/search/repositories?q=user:${OWNER}+topic:${TOPIC}&sort=updated&per_page=100`,
    { headers: ghHeaders(), next: { revalidate: 3600 } },
  )
  // Raycast extensions come from content/raycast.json (no GitHub repo to tag), so
  // they're appended regardless — even when the topic search fails or is empty.
  const raycast = getRaycastProjects()
  if (!res.ok) return raycast
  const data = (await res.json()) as { items?: Repo[] }
  // Firefox add-ons need a live AMO lookup (listing URL + user count) layered on
  // top of their GitHub metadata; every other category passes through untouched.
  const items = await enrichWebextProjects((data.items ?? []).map(toProject))
  return [...items, ...raycast]
}

export const getProject = async (slug: string): Promise<Project | null> => {
  // Reuse the cached topic search so 32 landings don't each hit the API.
  const found = (await getProjects()).find((project) => project.slug === slug)
  if (found) return found

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${slug}`, {
    headers: ghHeaders(),
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  return toProject((await res.json()) as Repo)
}
