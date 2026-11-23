// The /projects filters, as they live in the query string: one place decides
// how the URL reads (e.g. /projects?q=ink&tag=cli&sort=stars), so a filtered
// view can be reloaded, shared, bookmarked and returned to.
//
// Defaults never reach the URL: the bare /projects is the unfiltered page.

export type ProjectsSort = "updated" | "stars" | "name"

export type ProjectsQuery = {
  q: string
  sort: ProjectsSort
  type: string | null
  lang: string | null
  eco: string | null
  tags: string[]
}

export const DEFAULT_PROJECTS_QUERY: ProjectsQuery = {
  q: "",
  sort: "updated",
  type: null,
  lang: null,
  eco: null,
  tags: [],
}

// The URL names a sort by what a reader calls it, not by the field it reads.
const SORT_TO_PARAM: Record<ProjectsSort, string> = {
  updated: "recent",
  stars: "stars",
  name: "name",
}
const PARAM_TO_SORT = Object.fromEntries(
  Object.entries(SORT_TO_PARAM).map(([key, param]) => [param, key]),
) as Record<string, ProjectsSort>

const single = (params: URLSearchParams, name: string) => {
  const value = params.get(name)?.trim()
  return value ? value : null
}

// Reads any query string (with or without its "?"). Unknown or empty values
// fall back to their default rather than failing.
export const parseProjectsQuery = (
  search: string | URLSearchParams,
): ProjectsQuery => {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search
  const tags = [
    ...new Set(
      params
        .getAll("tag")
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ]
  return {
    q: params.get("q") ?? "",
    sort: PARAM_TO_SORT[params.get("sort") ?? ""] ?? "updated",
    type: single(params, "type"),
    lang: single(params, "lang"),
    eco: single(params, "eco"),
    tags,
  }
}

// The query string for a state, "" when every value is its default, else
// "?…" in a fixed order so the same view always has the same address.
export const serialiseProjectsQuery = (query: ProjectsQuery): string => {
  const params = new URLSearchParams()
  if (query.q.trim()) params.set("q", query.q.trim())
  if (query.type) params.set("type", query.type)
  if (query.eco) params.set("eco", query.eco)
  if (query.lang) params.set("lang", query.lang)
  for (const tag of query.tags) params.append("tag", tag)
  if (query.sort !== DEFAULT_PROJECTS_QUERY.sort)
    params.set("sort", SORT_TO_PARAM[query.sort])
  const search = params.toString()
  return search ? `?${search}` : ""
}

// Drops the values the page does not offer (a renamed tag, a language no
// project uses any more), so an old link degrades to a wider view instead of
// an empty one.
export const sanitiseProjectsQuery = (
  query: ProjectsQuery,
  known: {
    types: readonly string[]
    langs: readonly string[]
    ecos: readonly string[]
    tags: readonly string[]
  },
): ProjectsQuery => ({
  ...query,
  type: query.type && known.types.includes(query.type) ? query.type : null,
  lang: query.lang && known.langs.includes(query.lang) ? query.lang : null,
  eco: query.eco && known.ecos.includes(query.eco) ? query.eco : null,
  tags: query.tags.filter((tag) => known.tags.includes(tag)),
})
