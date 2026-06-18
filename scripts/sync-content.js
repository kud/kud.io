// Pulls documentation from every repo tagged `kud-site` into
// content/projects/<slug>/. A repo's docs/*.mdx becomes the proper multi-page
// docs site (/projects/<slug>/docs); the README is the fallback first page when
// a repo hasn't written its own docs/index, and always provides the structured
// landing data (features + install) emitted as landing.json. Runs as part of
// `npm run build` and never fails the build.
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

const OWNER = "kud"
const TOPIC = "kud-site"
const CONTENT_DIR = "content/projects"
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

// Remove a leading <div align="center">…</div> hero (logo/badges/nav links).
const stripLeadingCenteredHero = (markdown) => {
  const trimmed = markdown.replace(/^\s+/, "")
  if (!/^<div\s+align=["']?center/i.test(trimmed)) return markdown
  const tag = /<\/?div\b[^>]*>/gi
  let depth = 0
  let match
  while ((match = tag.exec(trimmed))) {
    depth += match[0].startsWith("</") ? -1 : 1
    if (depth === 0) return trimmed.slice(tag.lastIndex).replace(/^\s+/, "")
  }
  return markdown
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

// --- Structured extraction for the landing page -------------------------------

const stripInline = (text) =>
  text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim()

const splitSections = (markdown) =>
  markdown
    .split(/^##\s+/m)
    .slice(1)
    .map((part) => {
      const nl = part.indexOf("\n")
      return {
        heading: stripInline(part.slice(0, nl === -1 ? undefined : nl)),
        body: nl === -1 ? "" : part.slice(nl + 1),
      }
    })

const parseFeatures = (body) => {
  const features = []
  for (const line of body.split("\n")) {
    const item = line.match(/^\s*[-*]\s+(.+)$/)
    if (!item) continue
    const text = item[1].trim()
    const split = text.match(/^\*\*(.+?)\*\*\s*[—:–-]?\s*(.*)$/)
    if (split) {
      features.push({
        title: stripInline(split[1]),
        description: stripInline(split[2]),
      })
    } else {
      features.push({ title: stripInline(text), description: "" })
    }
    if (features.length >= 9) break
  }
  return features
}

const codeBlocks = (body) => {
  const blocks = []
  const re = /```[\w-]*\n([\s\S]*?)```/g
  let match
  while ((match = re.exec(body)) !== null) blocks.push(match[1].trim())
  return blocks
}

const firstCodeBlock = (body) => codeBlocks(body)[0] ?? null

// The lede: the first real prose paragraph of the preamble (before the first
// heading), skipping separators, leftover badges/images, bare link rows, and
// the feature bullet list. This is the "how powerful it is" pitch.
const extractIntro = (preamble) => {
  for (const para of preamble.split(/\n\s*\n/)) {
    const text = para.trim()
    if (!text) continue
    if (/^(-{3,}|#|<|!\[|\[!\[|>)/.test(text)) continue
    if (/^[-*]\s/.test(text)) continue
    if (/^\[[^\]]+\]\([^)]+\)(\s*·\s*\[[^\]]+\]\([^)]+\))*$/.test(text))
      continue
    const cleaned = stripInline(text.replace(/\n+/g, " "))
    if (cleaned.length >= 40) return cleaned
  }
  return null
}

// Authors can wrap any README region in `<!-- landing:skip -->` … `<!-- landing:/skip -->`
// to keep it off the landing (contributor notes, an FYI block, a section we'd
// otherwise auto-pull) — no guessing on our side. Everything else is extracted.
const stripLandingSkips = (markdown) =>
  markdown.replace(
    /<!--\s*landing:skip\s*-->[\s\S]*?<!--\s*landing:\/skip\s*-->/gi,
    "",
  )

// Build the auto-landing data from a cleaned README. Features come from a
// `## Features` section OR loose bullets in the preamble (some repos list them
// before any heading). Examples are capped so the landing never rivals /docs.
const buildLanding = (rawReadme) => {
  const readme = stripLandingSkips(rawReadme)
  const firstH2 = readme.search(/^##\s+/m)
  const preamble = firstH2 === -1 ? readme : readme.slice(0, firstH2)
  const sections = splitSections(readme)

  const preambleFeatures = parseFeatures(preamble)
  const featuresSection = sections.find((s) => /feature/i.test(s.heading))
  const features =
    preambleFeatures.length >= 2
      ? preambleFeatures
      : featuresSection
        ? parseFeatures(featuresSection.body)
        : preambleFeatures

  const installSection = sections.find((s) =>
    /install|quick.?start|getting.?started/i.test(s.heading),
  )
  const examplesSection = sections.find((s) =>
    /usage|example|recipe/i.test(s.heading),
  )

  return {
    intro: extractIntro(preamble),
    features,
    install: installSection ? firstCodeBlock(installSection.body) : null,
    examples: examplesSection
      ? codeBlocks(examplesSection.body).slice(0, 2)
      : [],
  }
}

// When the README has no install snippet, derive a sensible one from
// package.json so every landing still shows how to get the project running.
const fallbackInstall = (pkgRaw, slug, repoUrl) => {
  try {
    const pkg = JSON.parse(pkgRaw)
    if (pkg.engines?.vscode && pkg.publisher && pkg.name) {
      return `code --install-extension ${pkg.publisher}.${pkg.name}`
    }
    if (pkg.name) {
      return pkg.bin ? `npm install -g ${pkg.name}` : `npm install ${pkg.name}`
    }
  } catch {
    // No/invalid package.json — fall through to the clone instructions.
  }
  return `git clone ${repoUrl}\ncd ${slug}`
}

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
    ? stripLeadingCenteredHero(stripLeadingH1(readme))
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

  // The landing extracts features/install from the README; when no install
  // snippet is present, fall back to a package.json-derived command so every
  // landing always shows how to install the project.
  const landingData = cleaned
    ? buildLanding(cleaned)
    : { intro: null, features: [], install: null, examples: [] }
  if (!landingData.install) {
    const pkgRaw = await rawFile(slug, "package.json")
    landingData.install = fallbackInstall(pkgRaw, slug, repo.html_url)
  }
  await mkdir(join(CONTENT_DIR, slug), { recursive: true })
  await writeFile(
    join(CONTENT_DIR, slug, "landing.json"),
    JSON.stringify(landingData, null, 2),
  )

  // An authored landing.mdx in the repo overrides the auto landing; it uses the
  // website's component kit (<Hero>, <Showcase>…) and evolves with the project
  // on its main branch.
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

export { buildLanding, stripLeadingH1, stripLeadingCenteredHero }

// Only run the sync when executed directly (node scripts/sync-content.js), not
// when imported (e.g. a test exercising buildLanding against fixture READMEs).
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await main()
  } catch (error) {
    console.warn(`[sync] skipped: ${error.message}`)
  }
}
