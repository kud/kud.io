import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { readAllSearchPages } from "./paginate-search.ts"

const page = (items: number[], totalCount: number) =>
  new Response(JSON.stringify({ items, total_count: totalCount }), {
    status: 200,
  })

const range = (from: number, count: number) =>
  Array.from({ length: count }, (_, i) => from + i)

// Serves `total` numbered items `perPage` at a time and records each page asked for.
const catalogue = (total: number, perPage: number, failOn?: number) => {
  const requested: number[] = []
  const fetchPage = async (n: number) => {
    requested.push(n)
    if (n === failOn) return new Response("{}", { status: 502 })
    const from = (n - 1) * perPage
    return page(range(from, Math.max(0, Math.min(perPage, total - from))), total)
  }
  return { fetchPage, requested }
}

describe("readAllSearchPages", () => {
  it("reads a single short page with one request", async () => {
    const { fetchPage, requested } = catalogue(91, 100)
    const items = await readAllSearchPages<number>(fetchPage, 100)
    assert.deepEqual(items, range(0, 91))
    assert.deepEqual(requested, [1])
  })

  it("keeps paging past the hundredth result", async () => {
    const { fetchPage, requested } = catalogue(230, 100)
    const items = await readAllSearchPages<number>(fetchPage, 100)
    assert.deepEqual(items, range(0, 230))
    assert.deepEqual(requested, [1, 2, 3])
  })

  it("stops at total_count when the last page is exactly full", async () => {
    const { fetchPage, requested } = catalogue(200, 100)
    const items = await readAllSearchPages<number>(fetchPage, 100)
    assert.equal(items?.length, 200)
    assert.deepEqual(requested, [1, 2])
  })

  it("returns null rather than a partial list when any page fails", async () => {
    const { fetchPage } = catalogue(230, 100, 2)
    assert.equal(await readAllSearchPages<number>(fetchPage, 100), null)
  })

  it("returns an empty list for an empty search", async () => {
    const { fetchPage } = catalogue(0, 100)
    assert.deepEqual(await readAllSearchPages<number>(fetchPage, 100), [])
  })
})
