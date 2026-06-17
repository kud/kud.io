const OWNER = "kud"
const TOPIC = "kud-site"

export type Project = {
  slug: string
  name: string
  description: string | null
  category: string
  topics: string[]
  repoUrl: string
  homepage: string | null
  stars: number
  language: string | null
  license: string | null
  pushedAt: string
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

const ghHeaders = (): HeadersInit => {
  const token = process.env.GITHUB_TOKEN
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// The category lives on the repo as a `kud-site-<category>` topic, so the
// showcase grouping is driven entirely from GitHub — no slug rules to maintain.
const categoryFromTopics = (topics: string[]): string => {
  const tag = topics.find((topic) => topic.startsWith(`${TOPIC}-`))
  return tag ? tag.slice(TOPIC.length + 1) : "cli"
}

const toProject = (repo: Repo): Project => ({
  slug: repo.name,
  name: repo.name,
  description: repo.description,
  category: categoryFromTopics(repo.topics ?? []),
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
  if (!res.ok) return []
  const data = (await res.json()) as { items?: Repo[] }
  return (data.items ?? []).map(toProject)
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
