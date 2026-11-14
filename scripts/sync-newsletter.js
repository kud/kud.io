// Notion's newsletter database → content/newsletter/<date>/{fr.md,en.md,edition.json}.
//
// Notion is canonical; these files are its committed cache, written only by
// the publication workflow (.github/workflows/newsletter.yml). The format the
// page body must follow is newsletter/FORMAT.md; lib/newsletter/ enforces it.
//
//   node scripts/sync-newsletter.js                     sync every Ready edition
//   node scripts/sync-newsletter.js --date=2026-11-14   one date (Ready, Failed or Published)
//     --dry-run          parse and report, write nothing
//     --report=<file>    JSON per date: { state, previousStatus, issues }
//   node scripts/sync-newsletter.js --validate-only --date=…   exit 1 on any error, writes nothing
//   node scripts/sync-newsletter.js --mark=published --date=…
//   node scripts/sync-newsletter.js --mark=failed --date=… --error="…"
//   node scripts/sync-newsletter.js --mark=failed --date=… --from-report=<file>
//   node scripts/sync-newsletter.js --notify --date=…    mail the teaser, once
//
// Imports TypeScript straight from lib/: Node 22.18+ strips the types itself.

import { execFileSync } from "node:child_process"
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
// The package is CommonJS and Node cannot see `Client` as a named export.
import notionClient from "@notionhq/client"
import { errorsOf, parseEdition } from "../lib/newsletter/parse.ts"
import { deriveFiles } from "../lib/newsletter/derive.ts"
import { redact } from "../lib/newsletter/safety.ts"
import {
  CONTENT_ROOT,
  choosePublishedAt,
  datesToPublish,
  invalidDates,
  issueSummary,
  markDecision,
  notifyDecision,
  reportEntry,
  strayPaths,
} from "../lib/newsletter/publish.ts"
import {
  buildTeaser,
  campaignName,
  isEmailConfigured,
  providerFromEnv,
} from "../lib/newsletter/notify/index.ts"

const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_NEWSLETTER_DATABASE_ID
const { Client } = notionClient
const LANGS = ["fr", "en"]

// --- Arguments --------------------------------------------------------------

const arg = (name) => {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return undefined
  return hit.includes("=") ? hit.slice(hit.indexOf("=") + 1) : true
}

const args = {
  date: arg("date"),
  dryRun: arg("dry-run") === true,
  validateOnly: arg("validate-only") === true,
  report: arg("report"),
  mark: arg("mark"),
  error: arg("error"),
  fromReport: arg("from-report"),
  notify: arg("notify") === true,
}

const fail = (message) => {
  console.error(`newsletter: ${message}`)
  process.exit(1)
}

if (args.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(args.date)))
  fail("--date takes YYYY-MM-DD")
if ((args.validateOnly || args.mark || args.notify) && !args.date)
  fail("--validate-only, --mark and --notify need --date")
if (args.mark && !["published", "failed"].includes(args.mark))
  fail("--mark is published or failed")

// --- Notion -----------------------------------------------------------------

// Same pacing as the blog sync: ~3 requests a second, every call paced.
const PACE_MS = 350
let lastCall = 0
const pace = async () => {
  const wait = PACE_MS - (Date.now() - lastCall)
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  lastCall = Date.now()
}

const notion = () => {
  if (!token || !databaseId)
    fail("NOTION_TOKEN and NOTION_NEWSLETTER_DATABASE_ID must be set")
  return new Client({ auth: token })
}

// Every list endpoint caps at 100; a forgotten cursor truncates silently.
const collectAll = async (fetchPage) => {
  const results = []
  let cursor
  do {
    await pace()
    const page = await fetchPage(cursor)
    results.push(...page.results)
    cursor = page.has_more ? page.next_cursor : undefined
  } while (cursor)
  return results
}

const resolveDataSourceId = async (client) => {
  await pace()
  const database = await client.databases.retrieve({ database_id: databaseId })
  const id = database.data_sources?.[0]?.id
  if (!id) throw new Error("newsletter database exposes no data source")
  return id
}

// Children attached under `children`, as lib/newsletter/parse.ts expects. Item
// bodies nest lists a few levels deep at most; the parser rejects deeper.
const fetchBlocks = async (client, blockId, depth = 0) => {
  const blocks = await collectAll((cursor) =>
    client.blocks.children.list({ block_id: blockId, start_cursor: cursor }),
  )
  if (depth < 4)
    for (const block of blocks)
      if (block.has_children) block.children = await fetchBlocks(client, block.id, depth + 1)
  return blocks
}

const props = (page) => {
  const p = page.properties ?? {}
  return {
    date: p.Date?.date?.start?.slice(0, 10) ?? null,
    status: p.Status?.select?.name ?? null,
    generatedAt: p["Generated at"]?.date?.start ?? null,
  }
}

const queryEditions = async (client, dataSourceId, date) => {
  const filter = date
    ? { property: "Date", date: { equals: date } }
    : { property: "Status", select: { equals: "Ready" } }
  return collectAll((cursor) =>
    client.dataSources.query({ data_source_id: dataSourceId, filter, start_cursor: cursor }),
  )
}

const pageForDate = async (client, date) => {
  const pages = await queryEditions(client, await resolveDataSourceId(client), date)
  if (pages.length > 1) throw new Error(`${pages.length} editions share the date ${date}`)
  return pages[0] ?? null
}

// --- Files ------------------------------------------------------------------

const dirFor = (date) => join(CONTENT_ROOT, date)

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return null
  }
}

const readIfExists = (path) => (existsSync(path) ? readFileSync(path, "utf8") : null)

const gitPorcelain = () => {
  try {
    return execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], {
      encoding: "utf8",
    })
  } catch {
    return null
  }
}

// --- Commands ---------------------------------------------------------------

const syncOne = async (client, page, write) => {
  const { date, status, generatedAt } = props(page)
  if (!date) return { date: null, entry: null }
  const blocks = await fetchBlocks(client, page.id)
  const { edition, issues } = parseEdition(blocks, { date, generatedAt })
  if (!edition) return { date, entry: reportEntry({ previousStatus: status, issues, changed: false }) }

  const dir = dirFor(date)
  const existing = readJson(join(dir, "edition.json"))
  const files = deriveFiles(edition, choosePublishedAt(existing?.publishedAt, new Date()))
  const changed = Object.entries(files).some(
    ([name, content]) => readIfExists(join(dir, name)) !== content,
  )
  if (changed && write) {
    mkdirSync(dir, { recursive: true })
    for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content)
  }
  return { date, entry: reportEntry({ previousStatus: status, issues, changed }) }
}

const printIssues = (date, issues) => {
  for (const issue of issues)
    console.log(`  ${issue.severity === "error" ? "✗" : "!"} ${date} ${issue.message}`)
}

const sync = async () => {
  const client = notion()
  const write = !args.dryRun && !args.validateOnly
  const before = write ? gitPorcelain() : null

  const dataSourceId = await resolveDataSourceId(client)
  let pages = await queryEditions(client, dataSourceId, args.date)
  if (args.date) {
    if (pages.length > 1) fail(`${pages.length} editions share the date ${args.date}`)
    // An explicit date may re-sync a published edition or retry a failed one;
    // a draft is never published, asked for or not.
    if (!args.validateOnly)
      pages = pages.filter((page) => props(page).status !== "Draft")
    if (pages.length === 0) fail(`no publishable edition dated ${args.date}`)
  }

  const report = {}
  for (const page of pages) {
    const { date, entry } = await syncOne(client, page, write)
    if (!date) {
      console.log("  ✗ an edition has no Date; skipped")
      continue
    }
    if (report[date]) fail(`two editions share the date ${date}`)
    report[date] = entry
    console.log(`newsletter ${date}: ${entry.state} (was ${entry.previousStatus ?? "?"})`)
    printIssues(date, entry.issues)
  }

  if (write && before !== null) {
    const after = gitPorcelain()
    const stray = after === null ? [] : strayPaths(before, after)
    if (stray.length) fail(`the sync touched files outside ${CONTENT_ROOT}: ${stray.join(", ")}`)
  }
  if (args.report) writeFileSync(args.report, JSON.stringify(report, null, 2) + "\n")
  // In Actions, hand the workflow its plan: which dates to carry to Published
  // and which to mark failed.
  if (process.env.GITHUB_OUTPUT && write)
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `publish=${datesToPublish(report).join(" ")}\ninvalid=${invalidDates(report).join(" ")}\n`,
    )
  if (args.validateOnly && Object.values(report).some((e) => errorsOf(e.issues).length))
    process.exit(1)
}

const nowIso = () => new Date().toISOString()

const failureMessage = () => {
  if (args.fromReport) {
    const entry = readJson(args.fromReport)?.[args.date]
    return entry ? issueSummary(entry.issues) : "publication failed"
  }
  return args.error === true || !args.error ? "publication failed" : String(args.error)
}

const mark = async () => {
  const client = notion()
  const page = await pageForDate(client, args.date)
  const current = page ? props(page).status : null
  const decision = markDecision(current, args.mark)
  if (!decision.apply) {
    console.log(`newsletter ${args.date}: not marked ${args.mark} (${decision.reason})`)
    if (!page) process.exit(1)
    return
  }
  const text = (content) => ({ rich_text: content ? [{ text: { content } }] : [] })
  const properties =
    args.mark === "published"
      ? {
          Status: { select: { name: "Published" } },
          "Published at": { date: { start: nowIso() } },
          Error: text(""),
        }
      : {
          Status: { select: { name: "Failed" } },
          Error: text(redact(failureMessage(), 300)),
        }
  if (process.env.GITHUB_RUN_ID) properties.Run = text(String(process.env.GITHUB_RUN_ID))
  await pace()
  await client.pages.update({ page_id: page.id, properties })
  console.log(`newsletter ${args.date}: marked ${args.mark}`)
}

const notify = async () => {
  if (!isEmailConfigured()) {
    console.log("newsletter: email not configured; nothing sent")
    return
  }
  const client = notion()
  const page = await pageForDate(client, args.date)
  const status = page ? props(page).status : null
  const edition = readJson(join(dirFor(args.date), "edition.json"))
  if (!edition) fail(`no edition.json for ${args.date}`)
  const provider = providerFromEnv()
  for (const lang of LANGS) {
    const name = campaignName(args.date, lang)
    // Only ask the provider once the cheap checks pass.
    const pre = notifyDecision({ status, configured: true, alreadySent: false, lang })
    const decision = pre.send
      ? notifyDecision({ status, configured: true, alreadySent: await provider.hasCampaign(name), lang })
      : pre
    if (!decision.send) {
      console.log(`newsletter ${args.date} ${lang}: not sent (${decision.reason})`)
      continue
    }
    await provider.sendCampaign(name, lang, buildTeaser(edition, lang, provider.unsubscribePlaceholder))
    console.log(`newsletter ${args.date} ${lang}: sent as ${name}`)
  }
}

const main = async () => {
  if (args.mark) return mark()
  if (args.notify) return notify()
  return sync()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await main()
  } catch (error) {
    fail(redact(error?.message ?? String(error), 300))
  }
}
