// The kud-site contract, encoded once. REPO-CONVENTIONS.md is the prose version
// and stays authoritative for humans; this module is what sync-content.js and
// check-repos.js both read, so a convention change lands in one place instead of
// drifting between the sync (which applies the rules) and the checker (which
// reports on them). Nothing here does I/O — it is constants and pure functions,
// so either caller can keep its own transport.

export const OWNER = "kud"
export const TOPIC = "kud-site"

// §1. Section topics. No category topic → the site files the repo under CLIs &
// Tools, silently; that default is a finding worth reporting, not an error.
export const GROUPS = [
  "app",
  "desktop",
  "cli",
  "mcp",
  "claude",
  "lib",
  "ui",
  "vscode",
  "theme",
  "webext",
  "other",
]

// §1. Behaviour topics that are not sections: the README *is* the product, so
// the docs route is skipped and a missing docs/ folder is correct rather than thin.
export const FLAGS = ["readme"]

// §5. The prescribed headings. This is a conformance list, not a claim about
// what a README ought to contain — a repo can document installation perfectly
// under `## Installation` and still not match, which is why the checker's field
// is named hasInstallHeading and never hasInstallInstructions.
export const REQUIRED_HEADINGS = ["Features", "Install", "Usage"]

// §3. A repo opts into a logo with icon.svg/icon.png at the root, under assets/,
// or under images/ (the VS Code packaging path). `logo.*` and other names are
// deliberately not matched: one canonical filename keeps the grid consistent.
export const ICON = /^(assets\/|images\/)?icon\.(svg|png)$/i

// §9. Authored on the website side because the sync would overwrite them.
// Keyed by the group topic that makes each one load-bearing.
export const SITE_SIDE_FILES = {
  app: ["app.json"],
  desktop: ["app.json"],
  webext: ["webext.json"],
}

// §1. A family needs two or more members to render a tile, so a lone member is
// invisible on the site rather than merely unstyled.
export const MIN_ECOSYSTEM_MEMBERS = 2

const iconRank = (path) => (/\.svg$/i.test(path) ? 0 : 1)

// Prefers .svg when both formats are present. Takes plain paths so it works
// against a REST tree, a GraphQL tree, or a local listing alike.
export const findIcon = (paths) =>
  paths
    .filter((path) => ICON.test(path))
    .sort((a, b) => iconRank(a) - iconRank(b))[0] ?? null

// Splits a repo's topics into the four orthogonal axes of §1. An unrecognised
// `kud-site-*` topic lands in `unknown` rather than being dropped: a typo'd
// section topic is indistinguishable from an absent one on the site, and silently
// discarding it here would hide exactly that.
export const classifyTopics = (topics = []) => {
  const result = {
    kudSite: topics.includes(TOPIC),
    group: null,
    flags: [],
    tags: [],
    eco: null,
    unknown: [],
  }

  for (const topic of topics) {
    if (topic === TOPIC || !topic.startsWith(`${TOPIC}-`)) continue
    const rest = topic.slice(TOPIC.length + 1)

    if (rest.startsWith("tag-")) result.tags.push(rest.slice(4))
    else if (rest.startsWith("eco-")) result.eco = rest.slice(4)
    else if (GROUPS.includes(rest)) result.group = rest
    else if (FLAGS.includes(rest)) result.flags.push(rest)
    else result.unknown.push(topic)
  }

  return result
}

// §5 headings, read off a README. Fenced blocks are stripped first: a ```markdown
// example containing `## Install` would otherwise match, and a check that counts
// documentation *about* a heading as the heading is worse than no check.
// HTML headings inside the §5.1 hero (<h2>Install</h2>) are NOT matched and
// cannot be — a conformant hero can therefore under-report here.
export const readmeHeadings = (markdown) => {
  const withoutFences = markdown.replace(/^```[\s\S]*?^```/gm, "")
  return [...withoutFences.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map(([, text]) =>
    text.replace(/[*_`]/g, "").trim(),
  )
}
