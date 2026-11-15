#!/usr/bin/env node
// What the feeds published since the last edition, as JSON, for the
// newsletter editor's morning scan. Read-only: writes nothing anywhere.
//
//   node scripts/newsletter-radar.js --feeds <newsletter-feeds.json> [--since <ISO date>] [--editions <dir>]
//
// --since defaults to the newest edition's generatedAt; --editions to
// content/newsletter. Links any edition already cited are dropped.
// A feed that fails or times out is listed under `failed`, never fatal.

import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join } from "node:path"
import { parseFeed, selectFresh, editionLinks } from "./lib/feed-radar.js"

const arg = (name) => {
  const index = process.argv.indexOf(`--${name}`)
  return index > -1 ? process.argv[index + 1] : undefined
}

const feedsPath = arg("feeds")
if (!feedsPath) {
  process.stderr.write(
    "usage: newsletter-radar.js --feeds <newsletter-feeds.json> [--since <ISO>] [--editions <dir>]\n",
  )
  process.exit(2)
}

const editionsDir = arg("editions") ?? "content/newsletter"
const editions = existsSync(editionsDir)
  ? readdirSync(editionsDir)
      .filter(
        (name) =>
          /^\d{4}-\d{2}-\d{2}$/.test(name) &&
          existsSync(join(editionsDir, name, "edition.json")),
      )
      .sort()
      .map((name) =>
        JSON.parse(
          readFileSync(join(editionsDir, name, "edition.json"), "utf8"),
        ),
      )
  : []

const since = arg("since") ?? editions.at(-1)?.generatedAt ?? null
const seen = new Set(editions.flatMap(editionLinks))

const config = JSON.parse(readFileSync(feedsPath, "utf8"))
const feeds = Object.entries(config.sections ?? {}).flatMap(
  ([section, { title, feeds = [] }]) =>
    feeds.map((feed) => ({ ...feed, section, sectionTitle: title })),
)

const fetchFeed = async (feed) => {
  const response = await fetch(feed.url, {
    signal: AbortSignal.timeout(10_000),
    headers: {
      "user-agent": "kud.io newsletter radar",
      accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml",
    },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return parseFeed(await response.text())
}

const results = await Promise.allSettled(feeds.map(fetchFeed))

const sections = {}
const failed = []
results.forEach((result, index) => {
  const feed = feeds[index]
  if (result.status === "rejected") {
    failed.push({
      name: feed.name,
      url: feed.url,
      error: String(result.reason?.message ?? result.reason),
    })
    return
  }
  const fresh = selectFresh(result.value, { since, seen })
  if (!fresh.length) return
  sections[feed.section] ??= { title: feed.sectionTitle, items: [] }
  sections[feed.section].items.push(
    ...fresh.map((item) => ({ feed: feed.name, ...item })),
  )
})

for (const section of Object.values(sections)) {
  section.items.sort((a, b) =>
    (b.published ?? "").localeCompare(a.published ?? ""),
  )
}

process.stdout.write(
  `${JSON.stringify({ since, editionsCompared: editions.length, feeds: feeds.length, failed, sections }, null, 2)}\n`,
)
