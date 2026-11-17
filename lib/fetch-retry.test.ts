import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { fetchWithRetry, isRetryable, requestedDelay } from "./fetch-retry.ts"

const response = (status: number, headers: Record<string, string> = {}) =>
  new Response(status === 204 ? null : "{}", { status, headers })

// A fake fetch that answers from a script and counts the calls.
const scripted = (steps: (Response | Error)[]) => {
  let calls = 0
  const fetchImpl = (async () => {
    const step = steps[Math.min(calls, steps.length - 1)]
    calls++
    if (step instanceof Error) throw step
    return step
  }) as typeof fetch
  return { fetchImpl, calls: () => calls }
}

const recordSleeps = () => {
  const slept: number[] = []
  return { slept, sleep: async (ms: number) => void slept.push(ms) }
}

describe("isRetryable", () => {
  it("retries server errors and rate limits only", () => {
    assert.equal(isRetryable(response(502)), true)
    assert.equal(isRetryable(response(429)), true)
    assert.equal(isRetryable(response(403, { "x-ratelimit-remaining": "0" })), true)
    assert.equal(isRetryable(response(403, { "retry-after": "5" })), true)
    assert.equal(isRetryable(response(403)), false)
    assert.equal(isRetryable(response(404)), false)
    assert.equal(isRetryable(response(200)), false)
  })
})

describe("requestedDelay", () => {
  it("reads retry-after seconds, then the rate limit reset", () => {
    assert.equal(requestedDelay(response(429, { "retry-after": "3" }), 0), 3000)
    assert.equal(
      requestedDelay(response(403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "100" }), 90_000),
      10_000,
    )
    assert.equal(requestedDelay(response(503), 0), null)
  })
})

describe("fetchWithRetry", () => {
  it("returns a success at once", async () => {
    const { fetchImpl, calls } = scripted([response(200)])
    const res = await fetchWithRetry("https://x", undefined, { fetchImpl })
    assert.equal(res.status, 200)
    assert.equal(calls(), 1)
  })

  it("never retries a 404", async () => {
    const { fetchImpl, calls } = scripted([response(404), response(200)])
    const res = await fetchWithRetry("https://x", undefined, { fetchImpl })
    assert.equal(res.status, 404)
    assert.equal(calls(), 1)
  })

  it("backs off through a passing 5xx", async () => {
    const { fetchImpl, calls } = scripted([response(502), response(503), response(200)])
    const { slept, sleep } = recordSleeps()
    const res = await fetchWithRetry("https://x", undefined, { fetchImpl, sleep, baseDelayMs: 100 })
    assert.equal(res.status, 200)
    assert.equal(calls(), 3)
    assert.deepEqual(slept, [100, 200])
  })

  it("gives up after the last attempt and returns the failure", async () => {
    const { fetchImpl, calls } = scripted([response(500)])
    const { slept, sleep } = recordSleeps()
    const res = await fetchWithRetry("https://x", undefined, { fetchImpl, sleep, attempts: 3 })
    assert.equal(res.status, 500)
    assert.equal(calls(), 3)
    assert.equal(slept.length, 2)
  })

  it("waits as long as a short rate limit asks", async () => {
    const { fetchImpl } = scripted([response(429, { "retry-after": "2" }), response(200)])
    const { slept, sleep } = recordSleeps()
    const res = await fetchWithRetry("https://x", undefined, { fetchImpl, sleep })
    assert.equal(res.status, 200)
    assert.deepEqual(slept, [2000])
  })

  it("hands back a long rate limit without waiting", async () => {
    const limited = response(403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "3600" })
    const { fetchImpl, calls } = scripted([limited, response(200)])
    const { slept, sleep } = recordSleeps()
    const res = await fetchWithRetry("https://x", undefined, { fetchImpl, sleep, now: () => 0 })
    assert.equal(res.status, 403)
    assert.equal(calls(), 1)
    assert.deepEqual(slept, [])
  })

  it("returns an exhausted primary limit with no reset at once", async () => {
    const { fetchImpl, calls } = scripted([response(403, { "x-ratelimit-remaining": "0" }), response(200)])
    const { slept, sleep } = recordSleeps()
    const res = await fetchWithRetry("https://x", undefined, { fetchImpl, sleep })
    assert.equal(res.status, 403)
    assert.equal(calls(), 1)
    assert.deepEqual(slept, [])
  })

  it("returns a 429 that gives no timing at once", async () => {
    const { fetchImpl, calls } = scripted([response(429), response(200)])
    const { slept, sleep } = recordSleeps()
    const res = await fetchWithRetry("https://x", undefined, { fetchImpl, sleep })
    assert.equal(res.status, 429)
    assert.equal(calls(), 1)
    assert.deepEqual(slept, [])
  })

  it("waits for a primary limit that resets within the cap", async () => {
    const soon = response(403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "5" })
    const { fetchImpl, calls } = scripted([soon, response(200)])
    const { slept, sleep } = recordSleeps()
    const res = await fetchWithRetry("https://x", undefined, { fetchImpl, sleep, now: () => 0 })
    assert.equal(res.status, 200)
    assert.equal(calls(), 2)
    assert.deepEqual(slept, [5000])
  })

  it("never spends a backoff on a run of exhausted limits", async () => {
    const limited = () => response(403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "3600" })
    const { slept, sleep } = recordSleeps()
    await Promise.all(
      Array.from({ length: 50 }, () =>
        fetchWithRetry("https://x", undefined, {
          fetchImpl: scripted([limited()]).fetchImpl,
          sleep,
          now: () => 0,
        }),
      ),
    )
    assert.deepEqual(slept, [])
  })

  it("retries a network error, then rethrows the last one", async () => {
    const { fetchImpl, calls } = scripted([new TypeError("fetch failed")])
    const { sleep } = recordSleeps()
    await assert.rejects(
      fetchWithRetry("https://x", undefined, { fetchImpl, sleep, attempts: 2 }),
      TypeError,
    )
    assert.equal(calls(), 2)
  })
})
