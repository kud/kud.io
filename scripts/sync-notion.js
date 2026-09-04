// Pulls published blog posts from a Notion database into content/blog/<slug>.md,
// mirroring every Notion-hosted file into public/blog/<slug>/. Notion is the
// single source of truth; this repo holds a committed cache of it. Runs as part
// of the refresh workflow and never fails the build.
//
// Written as .md (not .mdx) on purpose: Notion cannot emit JSX, so an MDX
// compiler would only add the stray-brace failure mode without buying anything.
// Same reasoning as the READMEs in sync-content.js, one step further.
import { createHash } from "node:crypto"
import { mkdir, readdir, rm, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { Client } from "@notionhq/client"
import ora from "ora"

const CONTENT_DIR = "content/blog"
const IMAGE_DIR = "public/blog"

const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_BLOG_DATABASE_ID

// Notion allows ~3 requests/second sustained. Every call goes through pace() so
// a long post's recursive block walk can't trip a 429 mid-sync.
const PACE_MS = 350
let lastCall = 0
const pace = async () => {
  const wait = PACE_MS - (Date.now() - lastCall)
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  lastCall = Date.now()
}

const notion = token ? new Client({ auth: token }) : null

// Every list endpoint caps at 100 and paginates. Forgetting the cursor on
// blocks.children.list truncates a long post at block 101 with a green build and
// no error anywhere, so both call sites go through this.
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

// ---------------------------------------------------------------------------
// Rich text → Markdown
// ---------------------------------------------------------------------------

// Escaped so a literal asterisk, bracket or angle in prose can't become syntax.
// Backslash goes first or it would double-escape everything after it.
//
// `<` and `>` stay in the set even though the output is plain Markdown, not
// MDX. They are not an MDX leftover: remark parses a bare `<Layout/>` in prose
// as raw HTML and remark-rehype drops it, so an unescaped one deletes the text
// silently. Escaped, it round-trips — `\<` is a valid CommonMark escape and
// renders as `<`. Verified against the real pipeline, both ways.
const escapeMarkdown = (text) =>
  text.replace(/([\\`*_[\]<>])/g, "\\$1").replace(/\n/g, "  \n")

// A code span is a literal: nothing inside it is Markdown, so nothing inside it
// CAN be escaped. A backslash there renders as a backslash — which is precisely
// what put `\<Layout/\>` on three published posts. A backtick in the content is
// therefore handled by lengthening the fence, the only mechanism CommonMark
// offers, and the space padding is what stops a leading or trailing backtick
// closing the fence early.
const codeSpan = (content) => {
  const runs = [...content.matchAll(/`+/g)].map((match) => match[0].length)
  const fence = "`".repeat(Math.max(0, ...runs) + 1)
  const pad =
    content.startsWith("`") || content.endsWith("`") || /^\s|\s$/.test(content)
      ? " "
      : ""
  return `${fence}${pad}${content}${pad}${fence}`
}

const decorate = (content, annotations) => {
  if (!content.trim()) return content
  let out = content
  if (annotations.code) return codeSpan(content)
  if (annotations.bold) out = `**${out}**`
  if (annotations.italic) out = `_${out}_`
  if (annotations.strikethrough) out = `~~${out}~~`
  return out
}

const richText = (nodes = []) =>
  nodes
    .map((node) => {
      if (node.type === "equation") return codeSpan(node.equation.expression)
      const raw = node.plain_text ?? ""
      const annotations = node.annotations ?? {}
      const text = decorate(
        annotations.code ? raw : escapeMarkdown(raw),
        annotations,
      )
      const href = node.href ?? node.text?.link?.url
      return href ? `[${text}](${href})` : text
    })
    .join("")

// ---------------------------------------------------------------------------
// Mirrored files
// ---------------------------------------------------------------------------

const EXT_BY_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/ogg": "ogv",
}

// A signed URL's pathname still ends in the real filename, so it is the fallback
// when the response carries a content-type we don't map. Anchored and length-
// bounded because a URL with no extension at all would otherwise hand back the
// whole final path segment as one.
const extensionOf = (url, contentType, fallback) =>
  EXT_BY_TYPE[contentType?.split(";")[0].trim() ?? ""] ??
  new URL(url).pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() ??
  fallback

// Notion serves files as signed S3 URLs carrying X-Amz-Expires=3600, and the
// signature changes on every fetch. Naming the mirrored file from the URL would
// therefore produce a new file on every run — an hourly commit and an hourly
// deploy, forever. The bytes are the only stable identity.
//
// Writing the signed URL itself into the markdown is the same failure with a
// second edge: the link is dead an hour after the sync that wrote it. Every
// Notion-hosted file goes through here, whatever the block type.
const mirrorFile = async (url, slug, fallbackExt) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} fetching file`)
  const bytes = Buffer.from(await res.arrayBuffer())
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12)
  const ext = extensionOf(url, res.headers.get("content-type"), fallbackExt)
  await mkdir(join(IMAGE_DIR, slug), { recursive: true })
  await writeFile(join(IMAGE_DIR, slug, `${hash}.${ext}`), bytes)
  return `/blog/${slug}/${hash}.${ext}`
}

const fileUrl = (file) =>
  file?.type === "external" ? file.external.url : file?.file?.url

// Only a Notion-hosted file expires and needs mirroring. An external one is
// someone else's URL — a YouTube page, a CDN image — and fetching it would
// mirror whatever that host serves, which for a video page is HTML.
const isNotionHosted = (file) => file?.type === "file"

// ---------------------------------------------------------------------------
// Code fences
// ---------------------------------------------------------------------------

// Notion's code-block language names are not Shiki grammar ids — it offers
// "Plain Text", "ARM assembly" and friends from a dropdown. Anything unmapped
// falls back to `text`, which Shiki treats as "don't highlight" rather than
// throwing. This mapping IS the guard: Shiki never sees a language it lacks.
const SHIKI_LANGUAGE = {
  "plain text": "text",
  bash: "bash",
  shell: "shell",
  javascript: "javascript",
  typescript: "typescript",
  json: "json",
  html: "html",
  css: "css",
  scss: "scss",
  python: "python",
  ruby: "ruby",
  rust: "rust",
  go: "go",
  java: "java",
  "c++": "cpp",
  "c#": "csharp",
  c: "c",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  sql: "sql",
  yaml: "yaml",
  toml: "toml",
  markdown: "markdown",
  diff: "diff",
  docker: "docker",
  graphql: "graphql",
  elixir: "elixir",
  lua: "lua",
  r: "r",
  scala: "scala",
  haskell: "haskell",
  makefile: "makefile",
  nix: "nix",
  vim: "viml",
  powershell: "powershell",
  "objective-c": "objective-c",
  dart: "dart",
  zig: "zig",
}

const shikiLanguage = (notionLanguage) =>
  SHIKI_LANGUAGE[(notionLanguage ?? "").toLowerCase()] ?? "text"

// ---------------------------------------------------------------------------
// Blocks → Markdown
// ---------------------------------------------------------------------------

const indent = (markdown, spaces = 2) =>
  markdown
    .split("\n")
    .map((line) => (line ? " ".repeat(spaces) + line : line))
    .join("\n")

const renderBlock = async (block, context) => {
  const { slug, depth } = context
  const kids = async (spaces = 2) =>
    block.has_children && depth < 5
      ? indent(
          await renderBlocks(block.id, { ...context, depth: depth + 1 }),
          spaces,
        )
      : ""

  switch (block.type) {
    case "paragraph":
      return [richText(block.paragraph.rich_text), await kids(0)]
        .filter(Boolean)
        .join("\n\n")
    case "heading_1":
      return `# ${richText(block.heading_1.rich_text)}`
    case "heading_2":
      return `## ${richText(block.heading_2.rich_text)}`
    case "heading_3":
      return `### ${richText(block.heading_3.rich_text)}`
    case "bulleted_list_item":
      return [`- ${richText(block.bulleted_list_item.rich_text)}`, await kids()]
        .filter(Boolean)
        .join("\n")
    case "numbered_list_item":
      return [
        `1. ${richText(block.numbered_list_item.rich_text)}`,
        await kids(3),
      ]
        .filter(Boolean)
        .join("\n")
    case "to_do":
      return `- [${block.to_do.checked ? "x" : " "}] ${richText(block.to_do.rich_text)}`
    case "quote":
      return `> ${richText(block.quote.rich_text)}`
    // Rendered as a blockquote led by its emoji, so the element map can style
    // callouts distinctly without needing a marker Markdown can't carry.
    case "callout":
      return `> ${block.callout.icon?.emoji ?? ""} ${richText(block.callout.rich_text)}`.trim()
    // Markdown has no disclosure primitive and raw HTML is escaped, so a toggle
    // flattens to a bold lead-in plus its children. Nothing is lost but the fold.
    case "toggle":
      return [`**${richText(block.toggle.rich_text)}**`, await kids(0)]
        .filter(Boolean)
        .join("\n\n")
    case "code":
      return [
        `\`\`\`${shikiLanguage(block.code.language)}`,
        block.code.rich_text.map((node) => node.plain_text).join(""),
        "```",
      ].join("\n")
    case "divider":
      return "---"
    // An external image is mirrored too, deliberately: the fetch returns real
    // image bytes either way, and a hotlink is one more thing that can 404.
    case "image": {
      const url = fileUrl(block.image)
      if (!url) return ""
      const alt = richText(block.image.caption).replace(/[[\]]/g, "")
      return `![${alt}](${await mirrorFile(url, slug, "png")})`
    }
    case "bookmark":
      return `[${block.bookmark.url}](${block.bookmark.url})`
    // Always an author-supplied URL to somebody else's page, never a Notion
    // file — so there is nothing here to expire.
    case "embed":
      return `[${block.embed.url}](${block.embed.url})`
    case "video": {
      const url = fileUrl(block.video)
      if (!url) return ""
      const href = isNotionHosted(block.video)
        ? await mirrorFile(url, slug, "mp4")
        : url
      return `[Video](${href})`
    }
    case "equation":
      return `\`${block.equation.expression}\``
    case "table":
      return await renderTable(block, context)
    case "column_list":
    case "column":
      return await kids(0)
    default:
      return ""
  }
}

const renderTable = async (block, context) => {
  await pace()
  const rows = await collectAll((cursor) =>
    notion.blocks.children.list({ block_id: block.id, start_cursor: cursor }),
  )
  const cells = rows
    .filter((row) => row.type === "table_row")
    .map((row) => row.table_row.cells.map((cell) => richText(cell)))
  if (!cells.length) return ""
  const [head, ...body] = block.table.has_column_header
    ? cells
    : [cells[0].map(() => ""), ...cells]
  return [
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n")
}

const renderBlocks = async (blockId, context) => {
  const blocks = await collectAll((cursor) =>
    notion.blocks.children.list({ block_id: blockId, start_cursor: cursor }),
  )
  const rendered = []
  for (const block of blocks) rendered.push(await renderBlock(block, context))
  return rendered.filter(Boolean).join("\n\n")
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

const plain = (property) =>
  (property?.title ?? property?.rich_text ?? [])
    .map((node) => node.plain_text)
    .join("")
    .trim()

const slugify = (title) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)

const frontmatter = (fields) =>
  [
    "---",
    ...Object.entries(fields)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`),
    "---",
    "",
    "",
  ].join("\n")

// A slug derived from the title silently 404s the old URL the day a post is
// renamed. Writing it back the first time a post publishes pins the permalink in
// Notion, where it is visible and editable, rather than leaving it implicit.
const writeBackSlug = async (page, slug) => {
  await pace()
  await notion.pages.update({
    page_id: page.id,
    properties: { Slug: { rich_text: [{ text: { content: slug } }] } },
  })
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

// The 2025-09-03 API replaced databases.query with dataSources.query. Resolving
// the data source per run rather than hardcoding its id means a Notion-side
// change can't break the build silently.
const resolveDataSourceId = async () => {
  await pace()
  const database = await notion.databases.retrieve({ database_id: databaseId })
  const id = database.data_sources?.[0]?.id
  if (!id) throw new Error("database exposes no data source")
  return id
}

const syncPost = async (page) => {
  const title = plain(page.properties.Name) || "Untitled"
  const existing = plain(page.properties.Slug)
  const slug = existing || slugify(title)
  const body = await renderBlocks(page.id, { slug, depth: 0 })

  await mkdir(CONTENT_DIR, { recursive: true })
  await writeFile(
    join(CONTENT_DIR, `${slug}.md`),
    frontmatter({
      title,
      description: plain(page.properties.Summary),
      date: page.properties.Published?.date?.start ?? "",
      slug,
      tags: (page.properties.Tags?.multi_select ?? []).map((tag) => tag.name),
      cover: fileUrl(page.cover)
        ? await mirrorFile(fileUrl(page.cover), slug, "png")
        : undefined,
      updated: page.last_edited_time,
    }) + body,
  )

  if (!existing) await writeBackSlug(page, slug)
  return slug
}

// Only prunes when at least one post synced successfully, so a transient Notion
// failure can't empty the blog.
//
// Both halves of a post are pruned. A rename or an unpublish leaves a stale .md
// AND a stale mirror directory, and nothing but this function ever looks at
// public/blog — so pruning only the markdown orphans the images permanently, at
// a few hundred KB a post.
const pruneStale = async (kept) => {
  if (!kept.size) return 0
  let removed = 0

  const files = await readdir(CONTENT_DIR).catch(() => [])
  for (const file of files) {
    if (!file.endsWith(".md")) continue
    if (kept.has(file.replace(/\.md$/, ""))) continue
    await unlink(join(CONTENT_DIR, file)).catch(() => {})
    removed += 1
  }

  const mirrors = await readdir(IMAGE_DIR, { withFileTypes: true }).catch(
    () => [],
  )
  for (const entry of mirrors) {
    if (!entry.isDirectory() || kept.has(entry.name)) continue
    await rm(join(IMAGE_DIR, entry.name), { recursive: true, force: true })
    removed += 1
  }

  return removed
}

const main = async () => {
  if (!notion || !databaseId) {
    ora().warn(
      "[blog] NOTION_TOKEN or NOTION_BLOG_DATABASE_ID unset — skipping blog sync",
    )
    return
  }

  const spinner = ora("notion: resolving data source…").start()
  const dataSourceId = await resolveDataSourceId()

  const pages = await collectAll((cursor) =>
    notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      filter: { property: "Status", select: { equals: "Published" } },
      sorts: [{ property: "Published", direction: "descending" }],
    }),
  )

  const kept = new Set()
  let skipped = 0

  // Per-post isolation: one malformed post is skipped and logged, never allowed
  // to take down the build for every other post.
  for (const page of pages) {
    const label = plain(page.properties.Name) || page.id
    spinner.text = `notion: ${label}`
    try {
      kept.add(await syncPost(page))
    } catch (error) {
      skipped += 1
      console.warn(`[blog] ${label} skipped: ${error.message}`)
    }
  }

  const removed = await pruneStale(kept)
  spinner.succeed(
    `blog: ${kept.size} post(s)${skipped ? `, ${skipped} skipped` : ""}${
      removed ? `, ${removed} pruned` : ""
    }`,
  )
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await main()
  } catch (error) {
    ora().fail(`blog sync failed: ${error.message}`)
  }
}
