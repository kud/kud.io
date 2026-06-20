// Pulls documentation from every repo tagged `kud-site` into
// content/projects/<slug>/ and content/readmes/<slug>.md. A repo's docs/*.mdx
// becomes the multi-page docs site (/projects/<slug>/docs); the README is
// rendered as the project's landing page (/projects/<slug>) — a nicer version of
// the README, with the repo as the single source of truth. When a repo ships no
// docs/index, its README also serves as the fallback docs page. Runs as part of
// `npm run build` and never fails the build.
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

const OWNER = "kud"
const TOPIC = "kud-site"
const CONTENT_DIR = "content/projects"
const README_DIR = "content/readmes"
const LANDINGS_DIR = "content/landings"

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
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
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

const rewriteLinks = (markdown, slug, srcDir) => {
  const rawBase = `https://raw.githubusercontent.com/${OWNER}/${slug}/HEAD/${srcDir}`
  const blobBase = `https://github.com/${OWNER}/${slug}/blob/HEAD/${srcDir}`
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
  for (const file of docFiles) {
    const text = await rawFile(slug, file.path)
    if (!text) continue
    const rel = file.path.replace(/^docs\//, "")
    if (/^index\.mdx?$/i.test(rel)) hasIndex = true
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
  if (cleaned && !hasDocsIndex) {
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

const main = async () => {
  const search = await api(
    `https://api.github.com/search/repositories?q=user:${OWNER}+topic:${TOPIC}&per_page=100`,
  )
  const repos = search.items ?? []

  if (repos.length === 0) {
    console.warn(
      `[sync] no repos tagged "${TOPIC}" yet — leaving existing content untouched.`,
    )
    return
  }

  const synced = []
  const icons = {}
  for (const repo of repos) {
    const { slug, icon } = await syncRepo(repo)
    synced.push(slug)
    if (icon) icons[slug] = icon
  }
  await writeFile(
    join(CONTENT_DIR, "icons.json"),
    JSON.stringify(icons, null, 2),
  )
  console.log(`[sync] synced ${synced.length} project(s): ${synced.join(", ")}`)
  console.log(`[sync] ${Object.keys(icons).length} project(s) with a logo`)
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
    console.warn(`[sync] skipped: ${error.message}`)
  }
}
