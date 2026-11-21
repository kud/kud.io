import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { pickMore } from "./blog-picks.ts"

const post = (slug: string, date: string, tags: string[]) => ({
  slug,
  date,
  tags,
})

// Newest first, as getAllPosts returns them.
const posts = [
  post("e", "2026-11-01", ["design"]),
  post("d", "2026-10-01", ["engineering"]),
  post("c", "2026-09-01", ["engineering", "design"]),
  post("b", "2026-08-01", []),
  post("a", "2026-01-01", ["engineering"]),
]

describe("pickMore", () => {
  it("leads with the newest other post, then the most tags shared", () => {
    assert.deepEqual(
      pickMore(posts, "a").map((entry) => entry.slug),
      ["e", "c", "d"],
    )
  })

  it("breaks a tie on shared tags by nearness in date", () => {
    assert.deepEqual(
      pickMore(posts, "d").map((entry) => entry.slug),
      ["e", "c", "a"],
    )
  })

  it("never picks the post itself, and is the same on every call", () => {
    const first = pickMore(posts, "e").map((entry) => entry.slug)
    assert.deepEqual(first, ["d", "c", "b"])
    assert.deepEqual(
      pickMore(posts, "e").map((entry) => entry.slug),
      first,
    )
  })

  it("returns what there is when there are few posts", () => {
    assert.deepEqual(pickMore([posts[0]], "e"), [])
    assert.deepEqual(
      pickMore(posts.slice(0, 2), "e").map((entry) => entry.slug),
      ["d"],
    )
  })
})
