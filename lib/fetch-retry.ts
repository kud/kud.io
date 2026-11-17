// A fetch that rides out a passing GitHub or registry hiccup without stalling
// a build that has no token.
//
// - A network error or a 5xx is retried a bounded number of times, waiting
//   longer each time (or as long as a retry-after asks, within `maxWaitMs`).
// - A rate limit (a 429, or a 403 that says so) is retried only when the server
//   says it lifts within `maxWaitMs`, through retry-after or x-ratelimit-reset.
//   An exhausted primary limit, whose reset is far off or not given, comes back
//   at once with no backoff. A tokenless preview build makes hundreds of
//   lookups against 60 requests an hour, and backing off on every one of them
//   once pushed a page past Next's 60 second limit (2026-11-17).
// - Anything else (200, 404, a plain 403) is returned on the first try.
//
// No imports beyond the platform, so `node --test` can load it directly.

export type RetryOptions = {
  attempts?: number
  baseDelayMs?: number
  maxWaitMs?: number
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  fetchImpl?: typeof fetch
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const isRateLimited = (res: Response) =>
  res.status === 429 ||
  (res.status === 403 &&
    (res.headers.get("x-ratelimit-remaining") === "0" || res.headers.has("retry-after")))

export const isRetryable = (res: Response) => res.status >= 500 || isRateLimited(res)

// How long the server asks us to wait, in ms, or null when it does not say.
export const requestedDelay = (res: Response, now: number): number | null => {
  const retryAfter = res.headers.get("retry-after")
  if (retryAfter !== null) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
    const at = Date.parse(retryAfter)
    if (!Number.isNaN(at)) return Math.max(0, at - now)
  }
  const reset = res.headers.get("x-ratelimit-reset")
  if (res.headers.get("x-ratelimit-remaining") === "0" && reset !== null) {
    const at = Number(reset) * 1000
    if (Number.isFinite(at)) return Math.max(0, at - now)
  }
  return null
}

export const fetchWithRetry = async (
  input: string | URL,
  init?: RequestInit,
  options: RetryOptions = {},
): Promise<Response> => {
  const {
    attempts = 4,
    baseDelayMs = 1000,
    maxWaitMs = 30_000,
    sleep = wait,
    now = Date.now,
    fetchImpl = fetch,
  } = options

  let attempt = 0
  while (true) {
    attempt++
    const last = attempt >= attempts
    let res: Response
    try {
      res = await fetchImpl(input, init)
    } catch (error) {
      if (last) throw error
      await sleep(baseDelayMs * 2 ** (attempt - 1))
      continue
    }
    if (!isRetryable(res) || last) return res

    const asked = requestedDelay(res, now())
    // A rate limit is only worth waiting for when the server says it ends soon.
    if (isRateLimited(res) && asked === null) return res
    const delay = asked ?? baseDelayMs * 2 ** (attempt - 1)
    // Waiting out an hour-long limit helps nobody: hand the response back.
    if (delay > maxWaitMs) return res
    // Free the socket before trying again.
    await res.body?.cancel()
    await sleep(delay)
  }
}
