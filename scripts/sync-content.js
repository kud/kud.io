// Pulls documentation from every repo tagged `kud-site` into
// content/projects/<slug>/ and content/readmes/<slug>.md. A repo's docs/*.mdx
// becomes the multi-page docs site (/projects/<slug>/docs); the README is
// rendered as the project's landing page (/projects/<slug>) — a nicer version of
// the README, with the repo as the single source of truth. When a repo ships no
// docs/index, its README also serves as the fallback docs page. Runs as part of
// `npm run build` and never fails the build.
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import ora from "ora"

const OWNER = "kud"
const TOPIC = "kud-site"
const CONTENT_DIR = "content/projects"
const README_DIR = "content/readmes"
const LANDINGS_DIR = "content/landings"

// Raycast extensions don't live in kud-owned repos — they're subdirectories of
// the raycast/extensions monorepo, so there's no GitHub topic to detect them by.
// Instead we curate the slugs here (the analogue of tagging a repo `kud-site`)
// and enrich each from the Raycast store API + the monorepo README. New
// extension → add one slug. Authored only; community contributions are excluded.
const RAYCAST_AUTHOR = "kud"
const RAYCAST_SLUGS = [
  "1loc",
  "nerd-font-picker",
  "whimsical",
  "thermoconvert",
  "vlc",
  "gandi",
  "uk-bank-holidays",
  "localsend",
  "espanso",
  "foxhop",
]
const RAYCAST_REPO = "raycast/extensions"
const RAYCAST_FILE = "content/raycast.json"

const token = process.env.GITHUB_TOKEN
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "kud-website-sync",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
}

const api = async (url) => {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

const rawFile = async (slug, path) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/${OWNER}/${slug}/HEAD/${path}`,
    {
      headers: {
        "Cache-Control": "no-cache",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )
  return res.ok ? res.text() : null
}

const frontmatter = (title, description) =>
  `---\ntitle: ${JSON.stringify(title ?? "")}\ndescription: ${JSON.stringify(
    description ?? "",
  )}\n---\n\n`

const stripLeadingH1 = (markdown) => markdown.replace(/^\s*#\s+.+\n+/, "")

// A README that opens with a fenced code block is using it as an ASCII-art
// banner/logo — GitHub chrome the site hero replaces, so drop it on the landing.
const stripLeadingFence = (markdown) => {
  const trimmed = markdown.replace(/^\s+/, "")
  const match = trimmed.match(/^(```|~~~)[^\n]*\n[\s\S]*?\n\1[^\n]*\n/)
  return match ? trimmed.slice(match[0].length).replace(/^\s+/, "") : markdown
}

// Remove a leading <div|p align="center">…</div> hero (logo/badges/nav links). On
// the landing the site renders its own title + tagline, so the repo's GitHub-flavour
// hero (and its redundant "Website · Documentation" nav links) would only duplicate.
const stripLeadingCenteredHero = (markdown) => {
  const trimmed = markdown.replace(/^\s+/, "")
  if (!/^<(?:div|p)\s+align=["']?center/i.test(trimmed)) return markdown
  const tag = /<\/?(?:div|p)\b[^>]*>/gi
  let depth = 0
  let match
  while ((match = tag.exec(trimmed))) {
    depth += match[0].startsWith("</") ? -1 : 1
    if (depth === 0) return trimmed.slice(tag.lastIndex).replace(/^\s+/, "")
  }
  return markdown
}

// A standalone logo image at the very top is the repo's icon — kud.io shows it
// centred in the site hero instead, so drop the leading one. Guarded to icon/logo
// images (by src or alt) so a leading screenshot is never mistaken for a logo.
const stripLeadingImage = (markdown) => {
  const trimmed = markdown.replace(/^\s+/, "")
  const match = trimmed.match(
    /^(?:<img\b[^>]*\/?>|!\[[^\]]*\]\([^)]*\))\s*(?:\n|$)/i,
  )
  if (!match || !/\b(?:icon|logo)\b/i.test(match[0])) return markdown
  return trimmed.slice(match[0].length).replace(/^\s+/, "")
}

// A leading thematic break (---/***/___) left dangling once the hero above it is
// stripped — drop it so the landing doesn't open with a stray rule.
const stripLeadingRule = (markdown) => {
  const trimmed = markdown.replace(/^\s+/, "")
  return /^(-{3,}|\*{3,}|_{3,})\s*(\n|$)/.test(trimmed)
    ? trimmed.replace(/^(-{3,}|\*{3,}|_{3,})\s*\n?/, "")
    : markdown
}

// Strip the README's leading GitHub chrome (title, ASCII banner, centered hero,
// dangling rule) in whatever order it appears, so the landing starts at the first
// real content.
const stripLeadingChrome = (markdown) => {
  let out = markdown
  for (let i = 0; i < 6; i += 1) {
    const next = stripLeadingRule(
      stripLeadingImage(
        stripLeadingCenteredHero(stripLeadingFence(stripLeadingH1(out))),
      ),
    )
    if (next === out) break
    out = next
  }
  return out
}

// The README's trailing "Full documentation → kud.io/<slug>/docs" footer is handy
// on GitHub but redundant on kud.io — the landing already links to the docs, and
// in the README-as-docs fallback it points at the very page you're reading. Pop
// trailing blank lines, rules, and any docs-link line off the end.
const stripTrailingDocsLink = (markdown, slug) => {
  const docsLink = new RegExp(
    `full documentation|(?:kud\\.io)?/projects/${slug}/docs`,
    "i",
  )
  const lines = markdown.replace(/\s+$/, "").split("\n")
  while (lines.length) {
    const last = lines[lines.length - 1].trim()
    if (
      last === "" ||
      /^(-{3,}|\*{3,}|_{3,})$/.test(last) ||
      docsLink.test(last)
    ) {
      lines.pop()
    } else break
  }
  return `${lines.join("\n")}\n`
}

const RELATIVE = /^(?!https?:|\/\/|\/|#|mailto:|tel:|data:)/i

// Absolutise a README's relative links/images against explicit raw (images,
// src=) and blob (links, href=) bases. The kud-repo and Raycast-monorepo syncs
// share this core, differing only in which bases they pass.
const rewriteLinksAgainst = (markdown, rawBase, blobBase) => {
  const absolute = (rel, base) => {
    try {
      return new URL(rel, base).href
    } catch {
      return rel
    }
  }
  return markdown
    .replace(/(!\[[^\]]*\]\()([^)\s]+)(\))/g, (m, pre, url, post) =>
      RELATIVE.test(url) ? `${pre}${absolute(url, rawBase)}${post}` : m,
    )
    .replace(/(?<!!)(\[[^\]]*\]\()([^)\s]+)(\))/g, (m, pre, url, post) =>
      RELATIVE.test(url) ? `${pre}${absolute(url, blobBase)}${post}` : m,
    )
    .replace(/(\ssrc=")([^"]+)(")/g, (m, pre, url, post) =>
      RELATIVE.test(url) ? `${pre}${absolute(url, rawBase)}${post}` : m,
    )
    .replace(/(\shref=")([^"]+)(")/g, (m, pre, url, post) =>
      RELATIVE.test(url) ? `${pre}${absolute(url, blobBase)}${post}` : m,
    )
}

// A kud repo's relative links resolve against raw/blob URLs for kud/<slug>.
const rewriteLinks = (markdown, slug, srcDir) =>
  rewriteLinksAgainst(
    markdown,
    `https://raw.githubusercontent.com/${OWNER}/${slug}/HEAD/${srcDir}`,
    `https://github.com/${OWNER}/${slug}/blob/HEAD/${srcDir}`,
  )

// Authors can wrap any README region in `<!-- landing:skip -->` … `<!-- landing:/skip -->`
// to keep it off the kud.io landing (e.g. a Development section, contributor notes)
// while leaving it intact on GitHub.
const stripLandingSkips = (markdown) =>
  markdown.replace(
    /<!--\s*landing:skip\s*-->[\s\S]*?<!--\s*landing:\/skip\s*-->/gi,
    "",
  )

// -----------------------------------------------------------------------------

const writeDoc = async (slug, relPath, body) => {
  const file = join(CONTENT_DIR, slug, "docs", relPath)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, body)
}

// One recursive tree fetch per repo, reused for docs + icon detection.
const getTree = async (slug) => {
  try {
    const tree = await api(
      `https://api.github.com/repos/${OWNER}/${slug}/git/trees/HEAD?recursive=1`,
    )
    return tree.tree ?? []
  } catch {
    return []
  }
}

// Convention (see REPO-CONVENTIONS.md): a repo opts into a logo with
// icon.svg/icon.png at the repo root, under assets/, or under images/ (the
// standard VS Code packaging path). Detected straight from the tree — no extra
// API call. `logo.*` and other names are intentionally NOT matched: a single
// canonical filename keeps logos consistent. When both formats exist, prefer
// the .svg.
const ICON = /^(assets\/|images\/)?icon\.(svg|png)$/i

const iconRank = (path) => (/\.svg$/i.test(path) ? 0 : 1)

const findIcon = (slug, tree) => {
  const icons = tree
    .filter((node) => node.type === "blob" && ICON.test(node.path))
    .sort((a, b) => iconRank(a.path) - iconRank(b.path))
  if (icons.length === 0) return null
  return `https://raw.githubusercontent.com/${OWNER}/${slug}/HEAD/${icons[0].path}`
}

// Pull a repo's docs/ folder; returns true if it provides its own docs index.
const syncRepoDocs = async (slug, tree) => {
  let hasIndex = false
  const docFiles = tree.filter(
    (node) => node.type === "blob" && /^docs\/.+\.(mdx?|json)$/.test(node.path),
  )
  // Prefer .mdx over a legacy .md sibling (GitHub Pages leftovers): drop any
  // docs/<name>.md that has a docs/<name>.mdx alongside it, so the stale Pages
  // index can't shadow the authored docs or collide on the same route.
  const mdxStems = new Set(
    docFiles
      .filter((file) => file.path.endsWith(".mdx"))
      .map((file) => file.path.slice(0, -".mdx".length)),
  )
  const liveDocFiles = docFiles.filter(
    (file) =>
      !(
        file.path.endsWith(".md") &&
        mdxStems.has(file.path.slice(0, -".md".length))
      ),
  )
  for (const file of liveDocFiles) {
    const rel = file.path.replace(/^docs\//, "")
    if (/^index\.mdx?$/i.test(rel)) hasIndex = true
    const text = await rawFile(slug, file.path)
    if (!text) continue
    await writeDoc(
      slug,
      rel,
      rewriteLinks(text, slug, `${dirname(file.path)}/`),
    )
  }
  return hasIndex
}

const syncRepo = async (repo) => {
  const slug = repo.name

  const tree = await getTree(slug)
  const hasDocsIndex = await syncRepoDocs(slug, tree)
  const icon = findIcon(slug, tree)

  const readme = await rawFile(slug, "README.md")
  const cleaned = readme
    ? stripTrailingDocsLink(stripLeadingChrome(readme), slug)
    : null

  // README is the docs first page only when the repo ships no docs/index.
  // If a real docs/index now exists, remove any stale README-fallback index.md.
  if (hasDocsIndex) {
    const stale = join(CONTENT_DIR, slug, "docs", "index.md")
    await unlink(stale).catch(() => {})
  } else if (cleaned) {
    await writeDoc(
      slug,
      "index.md",
      frontmatter(repo.name, repo.description) +
        rewriteLinks(cleaned, slug, ""),
    )
  }

  // The README rendered as the project's landing page. `landing:skip` regions are
  // dropped and relative links/images are absolutised to the repo. Written as .md
  // (not .mdx) so a stray brace in any of 30+ READMEs can't fail the static build.
  if (cleaned) {
    await mkdir(README_DIR, { recursive: true })
    await writeFile(
      join(README_DIR, `${slug}.md`),
      frontmatter(repo.name, repo.description) +
        rewriteLinks(stripLandingSkips(cleaned), slug, ""),
    )
  }

  // An authored landing.mdx in the repo overrides the README landing; it uses the
  // website's component kit (<Hero>, <Showcase>…) and evolves with the project on
  // its main branch.
  const landing = await rawFile(slug, "landing.mdx")
  if (landing) {
    await mkdir(LANDINGS_DIR, { recursive: true })
    await writeFile(join(LANDINGS_DIR, `${slug}.mdx`), landing)
  }

  return { slug, icon }
}

const readJson = async (path) => {
  try {
    return JSON.parse(await readFile(path, "utf8"))
  } catch {
    return {}
  }
}

// One Raycast extension: pull its store metadata, render the monorepo README at
// the published commit as the landing, and return a compact record for
// content/raycast.json (read at render time by lib/raycast.ts). Returns null if
// the store API doesn't know the slug.
const syncRaycastExtension = async (slug) => {
  let meta
  try {
    meta = await api(
      `https://backend.raycast.com/api/v1/extensions/${RAYCAST_AUTHOR}/${slug}`,
    )
  } catch (error) {
    console.warn(`[sync] raycast ${slug} skipped: ${error.message}`)
    return null
  }

  // The monorepo folder isn't always the store slug (e.g. thermoconvert lives in
  // extensions/thermo-convert), so trust the API's relative_path. Fetch the README
  // from the monorepo's main branch (not the pinned published SHA), so a merged
  // README PR shows on kud.io within the hour without waiting for a republish.
  const dir = (meta.relative_path ?? `extensions/${slug}`).replace(/\/+$/, "")
  // Route slug is namespaced so an extension can never collide with a kud repo of
  // the same name in the shared /projects/<slug> space. The bare store slug stays
  // the canonical Raycast identifier (API, store URL, install deep link).
  const routeSlug = `raycast-${slug}`
  const readme = await fetch(
    `https://raw.githubusercontent.com/${RAYCAST_REPO}/HEAD/${dir}/README.md`,
  ).then((res) => (res.ok ? res.text() : null))

  if (readme) {
    await mkdir(README_DIR, { recursive: true })
    await writeFile(
      join(README_DIR, `${routeSlug}.md`),
      frontmatter(meta.title, meta.description) +
        rewriteLinksAgainst(
          stripLandingSkips(stripLeadingChrome(readme)),
          `https://raw.githubusercontent.com/${RAYCAST_REPO}/HEAD/${dir}/`,
          `https://github.com/${RAYCAST_REPO}/blob/HEAD/${dir}/`,
        ),
    )
  }

  const icon = meta.icons?.dark || meta.icons?.light || null
  const storeUrl =
    meta.store_url ?? `https://www.raycast.com/${RAYCAST_AUTHOR}/${slug}`
  // The Raycast deep link the store's "Install Extension" button uses — opens
  // the extension straight in the Raycast app (raycast://extensions/<handle>/<name>).
  const installUrl = `${storeUrl.replace(
    "https://www.raycast.com/",
    "raycast://extensions/",
  )}?source=webstore`

  return {
    icon,
    record: {
      slug: routeSlug,
      name: meta.title ?? slug,
      description: meta.description ?? null,
      icon,
      tags: (meta.categories ?? []).map((category) =>
        category.toLowerCase().replace(/\s+/g, "-"),
      ),
      repoUrl: `https://github.com/${RAYCAST_REPO}/tree/main/${dir}`,
      storeUrl,
      installUrl,
      downloads: meta.download_count ?? 0,
      updatedAt: meta.updated_at
        ? new Date(meta.updated_at * 1000).toISOString()
        : new Date(0).toISOString(),
    },
  }
}

// Sync every curated Raycast extension; writes content/raycast.json and returns
// a slug → icon-URL map to fold into icons.json.
const syncRaycast = async (spinner) => {
  const records = []
  const icons = {}
  for (const slug of RAYCAST_SLUGS) {
    spinner.text = `raycast-${slug}`
    const result = await syncRaycastExtension(slug)
    if (!result) continue
    records.push(result.record)
    if (result.icon) icons[result.record.slug] = result.icon
  }
  if (records.length > 0) {
    await writeFile(RAYCAST_FILE, `${JSON.stringify(records, null, 2)}\n`)
  }
  return icons
}

const main = async () => {
  const start = Date.now()
  const spinner = ora("fetching repos…").start()

  const search = await api(
    `https://api.github.com/search/repositories?q=user:${OWNER}+topic:${TOPIC}&per_page=100`,
  ).catch((error) => {
    spinner.warn(`github topic search failed: ${error.message}`)
    return { items: [] }
  })
  const repos = search.items ?? []

  // Start from the existing map so a transient GitHub or Raycast API failure
  // can't wipe icons synced on an earlier run; this run's results overlay it.
  const icons = await readJson(join(CONTENT_DIR, "icons.json"))
  const synced = []
  for (const repo of repos) {
    spinner.text = repo.name
    const { slug, icon } = await syncRepo(repo)
    synced.push(slug)
    if (icon) icons[slug] = icon
  }

  const raycastIcons = await syncRaycast(spinner)
  Object.assign(icons, raycastIcons)

  // Sorted keys keep icons.json diffs stable across runs (the GitHub search
  // returns repos in a non-deterministic order otherwise).
  const sorted = Object.fromEntries(
    Object.keys(icons)
      .sort()
      .map((key) => [key, icons[key]]),
  )
  await writeFile(
    join(CONTENT_DIR, "icons.json"),
    `${JSON.stringify(sorted, null, 2)}\n`,
  )

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  spinner.succeed(
    `synced ${synced.length} repos, ${Object.keys(raycastIcons).length} extensions, ${Object.keys(sorted).length} icons in ${elapsed}s`,
  )
}

export {
  stripLeadingH1,
  stripLeadingFence,
  stripLeadingCenteredHero,
  stripLeadingImage,
  stripLeadingChrome,
  stripTrailingDocsLink,
  stripLandingSkips,
  rewriteLinks,
}

// Only run the sync when executed directly (node scripts/sync-content.js), not
// when imported (e.g. a test exercising the helpers against fixture READMEs).
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await main()
  } catch (error) {
    ora().fail(`sync failed: ${error.message}`)
  }
}
