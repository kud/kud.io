import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  DEFAULT_PROJECTS_QUERY,
  parseProjectsQuery,
  sanitiseProjectsQuery,
  serialiseProjectsQuery,
} from "./projects-query.ts"

describe("projects query string", () => {
  it("reads the bare page as the defaults", () => {
    assert.deepEqual(parseProjectsQuery(""), DEFAULT_PROJECTS_QUERY)
    assert.deepEqual(parseProjectsQuery("?"), DEFAULT_PROJECTS_QUERY)
  })

  it("writes the defaults as no query string at all", () => {
    assert.equal(serialiseProjectsQuery(DEFAULT_PROJECTS_QUERY), "")
    assert.equal(
      serialiseProjectsQuery({ ...DEFAULT_PROJECTS_QUERY, q: "   " }),
      "",
    )
  })

  it("reads every filter", () => {
    assert.deepEqual(
      parseProjectsQuery(
        "?q=ink&type=cli&eco=qobuz&lang=TypeScript&tag=mcp&tag=music&sort=stars",
      ),
      {
        q: "ink",
        sort: "stars",
        type: "cli",
        lang: "TypeScript",
        eco: "qobuz",
        tags: ["mcp", "music"],
      },
    )
  })

  it("names the sorts as a reader would", () => {
    assert.equal(parseProjectsQuery("?sort=recent").sort, "updated")
    assert.equal(parseProjectsQuery("?sort=name").sort, "name")
    assert.equal(
      serialiseProjectsQuery({ ...DEFAULT_PROJECTS_QUERY, sort: "name" }),
      "?sort=name",
    )
  })

  it("falls back to the default on an unknown sort", () => {
    assert.equal(parseProjectsQuery("?sort=chaos").sort, "updated")
  })

  it("accepts tags repeated or comma-separated, without duplicates", () => {
    assert.deepEqual(parseProjectsQuery("?tag=a,b&tag=b&tag=").tags, ["a", "b"])
  })

  it("round-trips a state through the URL", () => {
    const state = {
      q: "c++ tools",
      sort: "name" as const,
      type: "library",
      lang: "C++",
      eco: null,
      tags: ["cli", "ai & ml"],
    }
    const search = serialiseProjectsQuery(state)
    assert.equal(
      search,
      "?q=c%2B%2B+tools&type=library&lang=C%2B%2B&tag=cli&tag=ai+%26+ml&sort=name",
    )
    assert.deepEqual(parseProjectsQuery(search), state)
  })

  it("keeps the same address for the same view", () => {
    const a = parseProjectsQuery("?sort=stars&tag=cli&q=ink")
    const b = parseProjectsQuery("?q=ink&tag=cli&sort=stars")
    assert.equal(serialiseProjectsQuery(a), serialiseProjectsQuery(b))
  })

  it("drops values the page no longer offers", () => {
    const query = parseProjectsQuery(
      "?type=gone&lang=Go&eco=old&tag=cli&tag=retired",
    )
    assert.deepEqual(
      sanitiseProjectsQuery(query, {
        types: ["cli"],
        langs: ["Go"],
        ecos: ["qobuz"],
        tags: ["cli"],
      }),
      { ...DEFAULT_PROJECTS_QUERY, lang: "Go", tags: ["cli"] },
    )
  })
})
