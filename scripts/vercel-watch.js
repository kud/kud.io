// vercel-watch: reports failed Vercel deployments as Todoist Comms threads in
// ops-alerts, and closes a thread once the same project and branch deploys
// again. Run every ten minutes by .github/workflows/vercel-watch.yml.
//
// There is no store: the channel itself is the state. Each alert's title is a
// stable key ("▲ <project> · <branch> failed to deploy"), so an open thread
// with that title means the failure is already reported.
//
// The two Comms calls copy kud/.github's comms-thread action (lib/comms.js and
// lib/id.js at 54f1bfdaf851d49faabd11d8f42c2c23ee087651) rather than invoking
// its post.js: one run opens or closes any number of threads and must also list
// them, so a sparse checkout plus one process per post would cost more than
// the forty lines kept here.
//
// Env: VERCEL_READ_TOKEN, TODOIST_MOCHI_BOT_TOKEN, optional VERCEL_TEAM_ID
// (otherwise every team the token sees), WINDOW_MINUTES (default 30), DRY_RUN.

import { randomBytes } from "node:crypto"
import { fileURLToPath } from "node:url"

export const ALERTS_CHANNEL = "ChJXTt3RDFYYZr9oTkUJu"
export const MAX_NEW_THREADS = 10
const VERCEL = "https://api.vercel.com"
const COMMS = "https://comms.todoist.com/api/v1.0"

// ── Decision logic (pure) ────────────────────────────────────────────────────

const FINISHED = new Set(["READY", "ERROR"])

export const stateOf = (deployment) => deployment.readyState ?? deployment.state

export const branchOf = (deployment) => {
  const meta = deployment.meta ?? {}
  return (
    meta.githubCommitRef ||
    meta.gitlabCommitRef ||
    meta.bitbucketCommitRef ||
    deployment.target ||
    "preview"
  )
}

export const keyOf = (deployment) => `${deployment.name} · ${branchOf(deployment)}`

export const titleFor = (key) => `▲ ${key} failed to deploy`

const TITLE = /^▲ (.+) failed to deploy$/

export const keyFromTitle = (title) => TITLE.exec(title ?? "")?.[1] ?? null

// The newest finished deployment per project and branch. CANCELED means a newer
// push superseded it, and building ones have not finished, so neither counts.
export const newestPerKey = (deployments) => {
  const newest = new Map()
  for (const deployment of deployments) {
    if (!FINISHED.has(stateOf(deployment))) continue
    const key = keyOf(deployment)
    const seen = newest.get(key)
    if (!seen || deployment.created > seen.created) newest.set(key, deployment)
  }
  return newest
}

// Comms timestamps may be seconds or milliseconds; compare in milliseconds.
const ms = (ts) => (ts < 1e12 ? ts * 1000 : ts)

// What to do for each key: open a thread for a failure nobody reported yet,
// close the open thread of a key that deployed again, and nothing otherwise.
// A failure already reported in a thread that was since closed by hand is not
// reopened, unless the failing deployment is newer than that thread.
export const plan = (deployments, threads, max = MAX_NEW_THREADS) => {
  const open = new Map()
  const closed = new Map()
  for (const thread of threads) {
    const key = keyFromTitle(thread.title)
    if (!key) continue
    const bucket = thread.closed ? closed : open
    if (!bucket.has(key) || bucket.get(key).posted_ts < thread.posted_ts) bucket.set(key, thread)
  }

  const actions = []
  let opened = 0
  for (const [key, deployment] of newestPerKey(deployments)) {
    const thread = open.get(key)
    if (stateOf(deployment) === "READY") {
      if (thread) actions.push({ type: "close", key, thread, deployment })
      continue
    }
    if (thread) continue
    const done = closed.get(key)
    if (done && ms(done.posted_ts) >= deployment.created) continue
    if (opened >= max) {
      actions.push({ type: "skip", key, deployment })
      continue
    }
    opened++
    actions.push({ type: "open", key, deployment })
  }
  return actions
}

// Mirrors Vercel's own Slack alert: commit, branch, target, author, inspect link.
export const bodyFor = (deployment) => {
  const meta = deployment.meta ?? {}
  const message = (
    meta.githubCommitMessage ||
    meta.gitlabCommitMessage ||
    meta.bitbucketCommitMessage ||
    ""
  ).split("\n")[0]
  const sha = (meta.githubCommitSha || meta.gitlabCommitSha || meta.bitbucketCommitSha || "").slice(0, 7)
  const author =
    meta.githubCommitAuthorLogin ||
    meta.githubCommitAuthorName ||
    meta.gitlabCommitAuthorName ||
    meta.bitbucketCommitAuthorName ||
    deployment.creator?.username ||
    ""
  const lines = [
    message && sha ? `${message} (\`${sha}\`)` : message || (sha && `\`${sha}\``),
    `Branch: ${branchOf(deployment)}`,
    `Target: ${deployment.target || "preview"}`,
    author && `Author: ${author}`,
    deployment.inspectorUrl && `[Inspect](${deployment.inspectorUrl})`,
  ]
  return lines.filter(Boolean).join("\n")
}

export const closingFor = (key) => `✓ ${key} deployed again`

// ── Comms ids (copied from kud/.github comms-thread lib/id.js) ───────────────

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

const encodeBase58 = (bytes) => {
  let zeros = 0
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++
  let n = 0n
  for (const b of bytes) n = (n << 8n) | BigInt(b)
  let out = ""
  while (n > 0n) {
    out = ALPHABET[Number(n % 58n)] + out
    n /= 58n
  }
  return "1".repeat(zeros) + out
}

// A UUIDv7 in base58: 48 bits of Unix milliseconds, then random bits with the
// version (7) and RFC 9562 variant set.
export const newId = (now = Date.now(), random = randomBytes(10)) => {
  const bytes = new Uint8Array(16)
  let t = BigInt(now)
  for (let i = 5; i >= 0; i--) {
    bytes[i] = Number(t & 0xffn)
    t >>= 8n
  }
  bytes.set(random, 6)
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return encodeBase58(bytes)
}

// ── HTTP ─────────────────────────────────────────────────────────────────────

export class AuthError extends Error {}

const call = async (url, token, init = {}) => {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  })
  const text = await response.text()
  const where = new URL(url).host + new URL(url).pathname
  if (response.status === 401 || response.status === 403) {
    throw new AuthError(`${where} answered ${response.status}: ${text.slice(0, 300)}`)
  }
  if (!response.ok) throw new Error(`${where} answered ${response.status}: ${text.slice(0, 300)}`)
  return JSON.parse(text)
}

const vercel = (path, params, token) =>
  call(`${VERCEL}${path}?${new URLSearchParams(params)}`, token)

const teamIds = async (token) => {
  if (process.env.VERCEL_TEAM_ID) return [process.env.VERCEL_TEAM_ID]
  const { teams = [] } = await vercel("/v2/teams", { limit: "100" }, token)
  return teams.map((team) => team.id)
}

const deploymentsOf = async (teamId, since, token) => {
  const all = []
  let until
  for (let page = 0; page < 5; page++) {
    const params = { limit: "100", since: String(since), teamId }
    if (until) params.until = String(until)
    const { deployments = [], pagination } = await vercel("/v7/deployments", params, token)
    all.push(...deployments)
    if (!pagination?.next) break
    until = pagination.next
  }
  return all
}

const threadsOf = async (token) => {
  const list = (params) =>
    call(`${COMMS}/threads/get?${new URLSearchParams({ channel_id: ALERTS_CHANNEL, ...params })}`, token)
  const [open, closed] = await Promise.all([
    list({ is_closed: "false", limit: "500" }),
    list({ is_closed: "true", limit: "100" }),
  ])
  return [...open.map((t) => ({ ...t, closed: false })), ...closed.map((t) => ({ ...t, closed: true }))]
}

const post = (path, body, token) =>
  call(`${COMMS}/${path}`, token, { method: "POST", body: JSON.stringify(body) })

// ── Run ──────────────────────────────────────────────────────────────────────

const main = async () => {
  const env = process.env
  const dryRun = env.DRY_RUN === "true" || process.argv.includes("--dry-run")
  const windowMinutes = Number(env.WINDOW_MINUTES || 30)
  const since = Date.now() - windowMinutes * 60_000
  const vercelToken = env.VERCEL_READ_TOKEN
  const commsToken = env.TODOIST_MOCHI_BOT_TOKEN
  if (!vercelToken || !commsToken) {
    console.log("::notice::VERCEL_READ_TOKEN or TODOIST_MOCHI_BOT_TOKEN is not set, nothing to watch.")
    return
  }

  // Any refusal of a token fails the run, so a bad token shows; anything else
  // is logged and the run ends clean, to try again in ten minutes.
  const soft = async (what, work) => {
    try {
      return await work()
    } catch (error) {
      if (error instanceof AuthError) throw error
      console.log(`::warning::${what}: ${error.message}`)
      return null
    }
  }

  const teams = await soft("Listing Vercel teams", () => teamIds(vercelToken))
  if (!teams) return
  const deployments = []
  for (const teamId of teams) {
    try {
      deployments.push(...(await deploymentsOf(teamId, since, vercelToken)))
    } catch (error) {
      if (error instanceof AuthError) throw error
      console.log(`::warning::Deployments of team ${teamId}: ${error.message}`)
    }
  }
  // Without the open threads, any decision could duplicate or miss an alert.
  const threads = await soft("Listing Comms threads", () => threadsOf(commsToken))
  if (!threads) return
  const actions = plan(deployments, threads)
  console.log(
    `${deployments.length} deployments in the last ${windowMinutes} min, ` +
      `${threads.filter((t) => !t.closed).length} open alert threads, ${actions.length} actions.`,
  )

  for (const action of actions) {
    try {
      if (action.type === "skip") {
        console.log(`::warning::Not opening ${action.key}: already ${MAX_NEW_THREADS} new threads this run.`)
      } else if (action.type === "open") {
        const body = {
          id: newId(),
          channel_id: ALERTS_CHANNEL,
          title: titleFor(action.key),
          content: bodyFor(action.deployment),
          groups: ["EVERYONE"],
        }
        if (dryRun) console.log(`[dry run] open ${JSON.stringify(body)}`)
        else console.log(`Opened ${action.key}: ${(await post("threads/add", body, commsToken)).id}`)
      } else if (action.type === "close") {
        const body = {
          id: newId(),
          thread_id: action.thread.id,
          content: closingFor(action.key),
          thread_action: "close",
          recipients: [],
          groups: [],
        }
        if (dryRun) console.log(`[dry run] close ${JSON.stringify(body)}`)
        else {
          await post("comments/add", body, commsToken)
          console.log(`Closed ${action.key}: ${action.thread.id}`)
        }
      }
    } catch (error) {
      if (error instanceof AuthError) throw error
      console.log(`::warning::${action.type} ${action.key}: ${error.message}`)
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.log(`::error::${error.message}`)
    process.exit(1)
  })
}
