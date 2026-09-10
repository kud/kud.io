// Reports how far each kud/* repo sits from the kud-site contract, and which
// public repos are not on the site at all. REPO-CONVENTIONS.md is the spec;
// scripts/lib/kud-site.js is that spec encoded, shared with the sync.
//
// It reports facts and grades nothing. Every field is a presence boolean, a
// count, a date or an identity string — any field whose name is an adjective is
// a bug, because picking the threshold at which "41 commits" becomes "stale" is
// the judgement this script exists to hand upwards rather than make.
//
//   node scripts/check-repos.js              human-readable report
//   node scripts/check-repos.js --json       the same report, complete, as JSON
//   node scripts/check-repos.js --payload <slug>
//                                            assemble a docs-vs-source bundle
//                                            for a model to read (see PAYLOAD)
//
// Exit code is 0 when the probe succeeded, whether or not it found anything —
// this is a report, not a gate. A non-zero exit means repos could not be probed
// and the findings are therefore incomplete.
import { readFile, readdir, access } from "node:fs/promises"
import { join } from "node:path"
import {
  OWNER,
  TOPIC,
  GROUPS,
  REQUIRED_HEADINGS,
  SITE_SIDE_FILES,
  MIN_ECOSYSTEM_MEMBERS,
  classifyTopics,
  findIcon,
  readmeHeadings,
} from "./lib/kud-site.js"

const CONTENT_DIR = "content/projects"
const PUBLIC_APPS_DIR = "public/apps"
const IGNORE_FILE = "scripts/kud-site-ignore.txt"
const BATCH_SIZE = 10

// Paths whose changes can plausibly contradict a usage doc. An internal
// refactor cannot, so excluding it is not a shortcut — it is what keeps the
// payload small enough to be read in full rather than truncated.
const SURFACE_PATHS =
  /^(src\/(index|cli|commands|api|options)|bin\/|types?\/|.*\.d\.ts$|package\.json$|schema)/

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.error(
    "GITHUB_TOKEN is required (the GraphQL API rejects anonymous calls).",
  )
  process.exit(2)
}

const graphql = async (query, variables = {}) => {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "kud-site-check",
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const body = await res.json()
  if (body.errors) throw new Error(body.errors.map((e) => e.message).join("; "))
  return body.data
}

const rest = async (path) => {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "kud-site-check",
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`)
  return res.json()
}

const exists = async (path) =>
  access(path).then(
    () => true,
    () => false,
  )

const readIgnoreList = async () => {
  const raw = await readFile(IGNORE_FILE, "utf8").catch(() => "")
  return raw
    .split("\n")
    .map((line) => line.replace(/^\s+|\s+$/g, ""))
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [slug, ...reason] = line.split("#")
      return { slug: slug.trim(), reason: reason.join("#").trim() }
    })
}

// Phase 1 — one paginated enumeration. Tagged and untagged then come from the
// same list, so the two halves of the report cannot disagree about what exists.
const enumerateRepos = async () => {
  const repos = []
  let cursor = null
  for (;;) {
    const data = await graphql(
      `query ($cursor: String) {
        user(login: "${OWNER}") {
          repositories(first: 100, after: $cursor, privacy: PUBLIC, isFork: false, ownerAffiliations: OWNER) {
            pageInfo { hasNextPage endCursor }
            nodes {
              name description homepageUrl isArchived pushedAt
              stargazerCount
              repositoryTopics(first: 30) { nodes { topic { name } } }
            }
          }
        }
      }`,
      { cursor },
    )
    const page = data.user.repositories
    repos.push(
      ...page.nodes.map((node) => ({
        slug: node.name,
        description: node.description ?? "",
        homepageUrl: node.homepageUrl ?? null,
        isArchived: node.isArchived,
        pushedAt: node.pushedAt,
        stars: node.stargazerCount,
        topics: node.repositoryTopics.nodes.map((t) => t.topic.name),
      })),
    )
    if (!page.pageInfo.hasNextPage) break
    cursor = page.pageInfo.endCursor
  }
  return repos
}

const treeEntries = (object) =>
  object?.entries
    ?.filter((entry) => entry.type === "blob")
    .map((entry) => entry.name) ?? []

// Phase 2 — aliased batches over the tagged set. Three tree fetches beat eight
// individual path probes and hand back the icon-filename ladder for free.
const probeBatch = async (slugs) => {
  const fragments = slugs
    .map(
      (slug, index) => `
    r${index}: repository(owner: "${OWNER}", name: "${slug}") {
      root:   object(expression: "HEAD:")       { ...on Tree { entries { name type } } }
      docs:   object(expression: "HEAD:docs")   { ...on Tree { entries { name type } } }
      assets: object(expression: "HEAD:assets") { ...on Tree { entries { name type } } }
      images: object(expression: "HEAD:images") { ...on Tree { entries { name type } } }
      readme: object(expression: "HEAD:README.md") { ...on Blob { text } }
      defaultBranchRef {
        name
        target { ...on Commit {
          oid
          committedDate
          docsHistory: history(path: "docs", first: 1) { nodes { oid committedDate } }
        } }
      }
    }`,
    )
    .join("\n")

  const data = await graphql(`{ ${fragments} }`)
  return slugs.map((slug, index) => ({ slug, node: data[`r${index}`] }))
}

// Phase 3 — how far source has moved since docs last changed. Needs the date
// from phase 2, so it cannot be folded in. Only runs for repos that have docs.
const commitsSinceBatch = async (entries) => {
  const fragments = entries
    .map(
      ({ slug, since }, index) => `
    c${index}: repository(owner: "${OWNER}", name: "${slug}") {
      defaultBranchRef { target { ...on Commit {
        history(since: "${since}") { totalCount }
      } } }
    }`,
    )
    .join("\n")

  const data = await graphql(`{ ${fragments} }`)
  return entries.map(({ slug }, index) => ({
    slug,
    // -1 because the docs commit itself falls inside the `since` window.
    count: Math.max(
      0,
      (data[`c${index}`]?.defaultBranchRef?.target?.history?.totalCount ?? 1) -
        1,
    ),
  }))
}

const batched = (items, size) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  )

// Docs frontmatter is read off disk rather than fetched: sync-content.js has
// already written every page locally, hourly, so this costs nothing AND reflects
// exactly what the site is serving rather than what the repo currently holds.
const localDocs = async (slug) => {
  const dir = join(CONTENT_DIR, slug, "docs")
  const files = await readdir(dir).catch(() => [])
  // .mdx only: index.md is the sync's README fallback, written by the website
  // for repos that ship no docs/, so §6's emoji-title rule does not reach it.
  const pages = files.filter((name) => /\.mdx$/.test(name))
  const withoutEmojiTitle = []
  let indexTitle = null

  for (const page of pages) {
    const text = await readFile(join(dir, page), "utf8").catch(() => "")
    const title = text
      .match(/^---[\s\S]*?^title:\s*(.+?)\s*$/m)?.[1]
      ?.replace(/^["']|["']$/g, "")
    if (!title) continue
    if (page.replace(/\.mdx?$/, "") === "index") indexTitle = title
    // §6: every page title leads with an emoji. Extended_Pictographic covers the
    // glyphs in use; a leading letter or digit is the failing case.
    if (!/^\p{Extended_Pictographic}/u.test(title)) withoutEmojiTitle.push(page)
  }

  return { pages: pages.length, indexTitle, withoutEmojiTitle }
}

const siteSideFacts = async (slug, group) => {
  const required = SITE_SIDE_FILES[group] ?? []
  const facts = {}
  for (const file of required) {
    facts[file] = (await exists(join(CONTENT_DIR, slug, file))) ? file : null
  }
  if (group === "app" || group === "desktop") {
    facts["public/apps/<slug>.png"] = (await exists(
      join(PUBLIC_APPS_DIR, `${slug}.png`),
    ))
      ? `${PUBLIC_APPS_DIR}/${slug}.png`
      : null
  }
  return facts
}

const buildReport = async () => {
  const [all, ignored] = await Promise.all([enumerateRepos(), readIgnoreList()])
  const ignoredSlugs = new Set(ignored.map((entry) => entry.slug))

  const tagged = all.filter((repo) => repo.topics.includes(TOPIC))
  const untagged = all
    .filter(
      (repo) =>
        !repo.topics.includes(TOPIC) &&
        !repo.isArchived &&
        !ignoredSlugs.has(repo.slug),
    )
    .map(({ slug, pushedAt, description, stars }) => ({
      slug,
      pushedAt,
      description,
      stars,
    }))

  const repos = []
  let failed = 0

  for (const batch of batched(tagged, BATCH_SIZE)) {
    const slugs = batch.map((repo) => repo.slug)
    const probed = await probeBatch(slugs).catch(() => null)

    for (const repo of batch) {
      const node = probed?.find((entry) => entry.slug === repo.slug)?.node
      if (!node) {
        failed += 1
        repos.push({
          slug: repo.slug,
          probe: "error",
          error: "batch probe failed",
        })
        continue
      }

      const topics = classifyTopics(repo.topics)
      const paths = [
        ...treeEntries(node.root),
        ...treeEntries(node.docs).map((name) => `docs/${name}`),
        ...treeEntries(node.assets).map((name) => `assets/${name}`),
        ...treeEntries(node.images).map((name) => `images/${name}`),
      ]
      const readme = node.readme?.text ?? null
      const headings = readme ? readmeHeadings(readme) : []
      const docsCommit =
        node.defaultBranchRef?.target?.docsHistory?.nodes?.[0] ?? null

      repos.push({
        slug: repo.slug,
        probe: "ok",
        topics,
        meta: {
          description: repo.description,
          descriptionLength: repo.description.length,
          homepageUrl: repo.homepageUrl,
          isArchived: repo.isArchived,
          pushedAt: repo.pushedAt,
          stars: repo.stars,
        },
        files: {
          readme: paths.includes("README.md"),
          licence: paths.some((path) => /^LICEN[CS]E/i.test(path)),
          icon: findIcon(paths),
          docsIndex: paths.includes("docs/index.mdx"),
          docsMeta: paths.includes("docs/meta.json"),
        },
        readme: readme
          ? {
              lines: readme.split("\n").length,
              headings,
              hasNavWebsite: readme.includes(`kud.io/projects/${repo.slug}"`),
              hasNavDocs: readme.includes(`kud.io/projects/${repo.slug}/docs`),
            }
          : null,
        docs: await localDocs(repo.slug),
        freshness: {
          docsLastCommit: docsCommit?.committedDate ?? null,
          docsLastCommitSha: docsCommit?.oid ?? null,
          headSha: node.defaultBranchRef?.target?.oid ?? null,
          commitsSinceDocs: null,
        },
        siteSide: await siteSideFacts(repo.slug, topics.group),
      })
    }
  }

  const needFreshness = repos
    .filter((repo) => repo.probe === "ok" && repo.freshness?.docsLastCommit)
    .map((repo) => ({ slug: repo.slug, since: repo.freshness.docsLastCommit }))

  for (const batch of batched(needFreshness, BATCH_SIZE)) {
    const counts = await commitsSinceBatch(batch).catch(() => [])
    for (const { slug, count } of counts) {
      const repo = repos.find((entry) => entry.slug === slug)
      if (repo) repo.freshness.commitsSinceDocs = count
    }
  }

  const ecosystems = {}
  for (const repo of repos) {
    const eco = repo.topics?.eco
    if (eco) (ecosystems[eco] ??= []).push(repo.slug)
  }

  const knownSlugs = new Set(all.map((repo) => repo.slug))

  return {
    generatedAt: new Date().toISOString(),
    spec: {
      source: "REPO-CONVENTIONS.md",
      requiredHeadings: REQUIRED_HEADINGS,
      groupTopics: GROUPS,
      minEcosystemMembers: MIN_ECOSYSTEM_MEMBERS,
      siteSideFiles: SITE_SIDE_FILES,
    },
    probe: {
      enumerated: all.length,
      tagged: tagged.length,
      probed: tagged.length - failed,
      failed,
      ignored: ignored.length,
    },
    ignored: ignored.map((entry) => ({
      ...entry,
      stillExists: knownSlugs.has(entry.slug),
    })),
    untagged,
    taggedAndArchived: tagged
      .filter((repo) => repo.isArchived)
      .map((repo) => repo.slug),
    ecosystems,
    repos,
  }
}

// --- rendering ------------------------------------------------------------
// A pure function of the report, so the terminal cannot show anything the JSON
// omits, and cannot hide anything the JSON carries.

const relative = (iso) => {
  if (!iso) return "—"
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000)
  if (days < 1) return "today"
  if (days < 31) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

const pad = (text, width) => {
  const value = String(text)
  return value.length >= width ? `${value.slice(0, width - 2)}… ` : value.padEnd(width)
}

const render = (report) => {
  const lines = []
  const { probe } = report

  lines.push(`kud-site conformance · ${report.spec.source}`)
  lines.push(
    `${probe.enumerated} enumerated · ${probe.tagged} tagged · ${probe.ignored} ignored · probe: ${probe.probed}/${probe.tagged} ok`,
  )
  lines.push("")

  if (probe.failed > 0) {
    lines.push(
      `⚠ ${probe.failed} repos could not be probed — findings below are incomplete`,
    )
    lines.push("")
  }

  if (report.untagged.length > 0) {
    lines.push(
      `○ ${report.untagged.length} public repos untagged and not on the ignore list`,
    )
    for (const repo of report.untagged) {
      lines.push(`    ${pad(repo.slug, 24)} pushed ${relative(repo.pushedAt)}`)
    }
    lines.push("")
  }

  const rows = []
  for (const repo of report.repos) {
    if (repo.probe !== "ok") continue
    const isReadmeProduct = repo.topics.flags.includes("readme")
    const absentHeadings = REQUIRED_HEADINGS.filter(
      (heading) => !repo.readme?.headings.some((found) => found === heading),
    )
    const siteSideAbsent = Object.entries(repo.siteSide)
      .filter(([, value]) => value === null)
      .map(([key]) => key)

    const findings = {
      group: repo.topics.group ?? "—",
      desc: repo.meta.descriptionLength > 0,
      icon: Boolean(repo.files.icon),
      // A kud-site-readme repo is the product; no docs route is correct there.
      docs: isReadmeProduct ? null : repo.files.docsIndex,
      headings: absentHeadings,
      siteSide: siteSideAbsent,
      commits: repo.freshness.commitsSinceDocs,
    }

    const hasFinding =
      !findings.desc ||
      !findings.icon ||
      findings.docs === false ||
      findings.headings.length > 0 ||
      findings.siteSide.length > 0 ||
      !repo.topics.group ||
      repo.docs.withoutEmojiTitle.length > 0

    if (hasFinding) rows.push({ slug: repo.slug, ...findings, repo })
  }

  const mark = (value) => (value === null ? "—" : value ? "✓" : "✗")

  if (rows.length > 0) {
    lines.push(`○ ${rows.length} tagged repos with at least one absent fact`)
    lines.push("")
    lines.push(
      `  ${pad("slug", 24)}${pad("group", 9)}${pad("desc", 6)}${pad("icon", 6)}${pad("docs", 6)}${pad("headings absent", 26)}src↔docs`,
    )
    lines.push(`  ${"─".repeat(93)}`)
    for (const row of rows) {
      const commits =
        row.commits === null
          ? "—"
          : row.commits === 0
            ? "in step"
            : `${row.commits} commits`
      lines.push(
        `  ${pad(row.slug, 24)}${pad(row.group, 9)}${pad(mark(row.desc), 6)}${pad(mark(row.icon), 6)}${pad(mark(row.docs), 6)}${pad(row.headings.join(", ") || "—", 26)}${commits}`,
      )
      for (const file of row.siteSide)
        lines.push(`  ${" ".repeat(24)}↳ ${file} absent (§9)`)
      if (row.repo.docs.withoutEmojiTitle.length > 0) {
        lines.push(
          `  ${" ".repeat(24)}↳ docs titles without a leading emoji: ${row.repo.docs.withoutEmojiTitle.join(", ")}`,
        )
      }
    }
    lines.push("")
  }

  for (const slug of report.taggedAndArchived) {
    lines.push(
      `⚠ ${slug} is tagged ${TOPIC} and archived — still rendering as live`,
    )
  }

  for (const [name, members] of Object.entries(report.ecosystems)) {
    if (members.length < report.spec.minEcosystemMembers) {
      lines.push(
        `⚠ ecosystem "${name}" has ${members.length} member (${members.join(", ")}) — needs ${report.spec.minEcosystemMembers}+ to render a tile`,
      )
    }
  }

  for (const entry of report.ignored) {
    if (!entry.stillExists)
      lines.push(`⚠ ignore list names ${entry.slug}, which no longer exists`)
  }

  const stale = report.repos
    .filter(
      (repo) =>
        repo.probe === "ok" && (repo.freshness?.commitsSinceDocs ?? 0) > 0,
    )
    .sort((a, b) => b.freshness.commitsSinceDocs - a.freshness.commitsSinceDocs)
    .slice(0, 5)

  if (stale.length > 0) {
    lines.push("")
    lines.push("  source moved most since docs last changed")
    for (const repo of stale) {
      lines.push(
        `    ${pad(repo.slug, 24)}${pad(`${repo.freshness.commitsSinceDocs} commits`, 14)}docs last touched ${relative(repo.freshness.docsLastCommit)}`,
      )
    }
    lines.push("")
    lines.push(
      "  --payload <slug> assembles the docs-vs-source bundle for review",
    )
  }

  if (rows.length === 0 && report.untagged.length === 0 && probe.failed === 0) {
    lines.push(
      "✓ every tagged repo conforms, and no untagged repo is waiting on a decision",
    )
  }

  lines.push("")
  lines.push("  --json for the full report, conformant repos included")
  return lines.join("\n")
}

// --- PAYLOAD --------------------------------------------------------------
// Assembles what a model reads, and nothing more. The script picks the commit
// range so the bundle is reproducible and the bottom layer stays deterministic;
// a model choosing its own range would make both untrue.
//
// The cumulative diff docsLastCommit..HEAD is used rather than the individual
// commits, so intermediate churn cancels: the question is what the code looks
// like NOW versus when the doc was last touched.
//
// Over the cap it REFUSES rather than truncates. The model reads absence from
// the diff as evidence that nothing contradicts the doc, so a clipped diff
// manufactures confident false negatives — the exact failure being designed out.
const PAYLOAD_CAP_CHARS = 160_000

const buildPayload = async (slug) => {
  const report = await buildReport()
  const repo = report.repos.find((entry) => entry.slug === slug)
  if (!repo) throw new Error(`${slug} is not a tagged kud-site repo`)
  if (!repo.freshness.docsLastCommitSha)
    throw new Error(`${slug} has no docs/ history to compare`)

  const compare = await rest(
    `repos/${OWNER}/${slug}/compare/${repo.freshness.docsLastCommitSha}...${repo.freshness.headSha}`,
  )

  const surface = (compare.files ?? [])
    .filter((file) => SURFACE_PATHS.test(file.filename))
    .map((file) => ({
      path: file.filename,
      status: file.status,
      patch: file.patch ?? null,
    }))

  const docsDir = join(CONTENT_DIR, slug, "docs")
  const docFiles = (await readdir(docsDir).catch(() => [])).filter((name) =>
    /\.mdx?$/.test(name),
  )
  const docs = []
  for (const name of docFiles) {
    docs.push({
      path: `docs/${name}`,
      text: await readFile(join(docsDir, name), "utf8"),
    })
  }

  const size = JSON.stringify({ docs, surface }).length
  if (size > PAYLOAD_CAP_CHARS) {
    return {
      slug,
      payload: "oversized",
      sizeChars: size,
      capChars: PAYLOAD_CAP_CHARS,
      note: "Refused rather than truncated: a clipped diff makes absence of contradiction unreliable.",
    }
  }

  return {
    slug,
    payload: "ok",
    question:
      "Does anything in `surface` contradict a claim in `docs`? Emit a finding only with doc path and line, the quoted claim, the commit sha and the hunk that contradicts it, and a kind from the closed set: removed-flag, renamed-flag, changed-default, removed-command, changed-signature, moved-path. No citation, no finding. Do not propose fixes. Return { findings: [], checked: [...] } when nothing contradicts.",
    range: {
      from: repo.freshness.docsLastCommitSha,
      to: repo.freshness.headSha,
      docsLastCommit: repo.freshness.docsLastCommit,
      commitsSinceDocs: repo.freshness.commitsSinceDocs,
    },
    docs,
    surface,
  }
}

const main = async () => {
  const args = process.argv.slice(2)
  const payloadIndex = args.indexOf("--payload")

  if (payloadIndex !== -1) {
    const slug = args[payloadIndex + 1]
    if (!slug) throw new Error("--payload needs a slug")
    console.log(JSON.stringify(await buildPayload(slug), null, 2))
    return
  }

  const report = await buildReport()
  console.log(
    args.includes("--json") ? JSON.stringify(report, null, 2) : render(report),
  )
  if (report.probe.failed > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(`check failed: ${error.message}`)
  process.exit(2)
})
