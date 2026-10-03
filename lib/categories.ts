// App-like categories share the rich AppLanding template and launcher-tile grid:
// `app` is deployed web apps/PWAs, `desktop` is native desktop apps (e.g. Tauri).
// Kept in its own dependency-free module so the client ProjectList can import it
// without pulling server-only code from lib/projects.
export const APP_CATEGORIES = new Set(["app", "desktop"])

export const isAppCategory = (category: string): boolean =>
  APP_CATEGORIES.has(category)

// Label and an orienting one-liner for each `kud-site-<key>` topic. Section
// order follows the declaration order below — to reorder or insert a group,
// just move or add it here; there's nothing to renumber. Membership is driven
// entirely by the repo topics on GitHub.
export const CATEGORY_META: Record<string, { name: string; blurb: string }> = {
  app: {
    name: "Apps",
    blurb:
      "Web apps I design and ship end to end — open them straight from here, or read the story behind each one.",
  },
  desktop: {
    name: "Desktop Apps",
    blurb:
      "Native desktop remotes and tools — the same cores as the CLIs, wrapped in a clickable app, no terminal required.",
  },
  cli: {
    name: "CLIs & Tools",
    blurb:
      "Command-line tools I reach for daily, for files, git, cloud APIs, and the macOS desktop.",
  },
  mcp: {
    name: "MCP Servers",
    blurb:
      "Model Context Protocol servers that connect Claude and other AI assistants to the tools you already use.",
  },
  claude: {
    name: "Claude Code",
    blurb:
      "Companions for Claude Code: session managers, live dashboards, and curated plugin collections.",
  },
  lib: {
    name: "Libraries",
    blurb:
      "Reusable packages that other projects build on — protocol implementations, API clients, and framework-agnostic cores, published to npm.",
  },
  ui: {
    name: "UI & Design Systems",
    blurb:
      "Design systems and component libraries for building polished, consistent terminal interfaces.",
  },
  vscode: {
    name: "VS Code Extensions",
    blurb:
      "Extensions that bring code review and AI workflows directly into VS Code.",
  },
  theme: {
    name: "VS Code Themes",
    blurb: "Colour schemes for VS Code, tuned for long sessions in the dark.",
  },
  raycast: {
    name: "Raycast Extensions",
    blurb:
      "Extensions for Raycast that bring file sharing, domains, fonts, and more into the launcher — published to the Raycast Store.",
  },
  webext: {
    name: "Firefox Add-ons",
    blurb:
      "Browser extensions I build for Firefox — small, focused add-ons that smooth over the rough edges of the sites I use every day, published on addons.mozilla.org.",
  },
  other: {
    name: "Lists & Resources",
    blurb:
      "Curated lists and references for people who love a beautiful terminal.",
  },
}

// Section order is simply the declaration order above; unknown keys sort last.
const CATEGORY_ORDER = Object.keys(CATEGORY_META)
const orderOf = (key: string) => {
  const index = CATEGORY_ORDER.indexOf(key)
  return index === -1 ? CATEGORY_ORDER.length : index
}

export const labelFor = (key: string) =>
  CATEGORY_META[key]?.name ?? key.charAt(0).toUpperCase() + key.slice(1)

export const groupByCategory = <T extends { category: string }>(
  projects: T[],
) => {
  const keys = [...new Set(projects.map((project) => project.category))]
  return keys
    .map((key) => ({
      key,
      name: labelFor(key),
      blurb: CATEGORY_META[key]?.blurb ?? null,
      items: projects.filter((project) => project.category === key),
    }))
    .sort((a, b) => orderOf(a.key) - orderOf(b.key))
}
