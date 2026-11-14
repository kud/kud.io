import { ghHeaders } from "@/lib/projects"
import { getPackageFact } from "@/lib/repo-facts"

const OWNER = "kud"

// What a repo's own package.json says about it, for the infobox on a README
// landing. Only fields the file states; nothing here is typed by hand.
export type PackageFacts = {
  name: string
  // The commands `npm install -g` puts on the PATH.
  commands: string[]
  // The Node range from `engines.node`, e.g. ">=22".
  node: string | null
  // What a library expects the host project to bring (peerDependencies).
  peers: string[]
  // Runtime dependencies, for the framework chips and the sibling links.
  dependencies: string[]
}

type PackageJson = {
  name?: string
  private?: boolean
  bin?: string | Record<string, string>
  engines?: { node?: string }
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// A string `bin` installs one command named after the unscoped package.
const commandsOf = (pkg: PackageJson & { name: string }): string[] =>
  typeof pkg.bin === "string"
    ? [pkg.name.replace(/^@[^/]+\//, "")]
    : Object.keys(pkg.bin ?? {})

// Same file as the release lookup, from the synced repo facts or, failing
// that, the same URL and cache window, so Next serves both from one fetch. A
// repo without a package.json (themes, Raycast, Swift) gets null.
export const getPackageFacts = async (
  slug: string,
): Promise<PackageFacts | null> => {
  // Synced by scripts/sync-content.js; the live read below is for a repo the
  // sync has not seen yet.
  const fact = getPackageFact(slug)
  if (fact !== undefined) {
    if (!fact?.name || fact.private) return null
    return {
      name: fact.name,
      commands: commandsOf({ name: fact.name, bin: fact.bin ?? undefined }),
      node: fact.node,
      peers: fact.peers,
      dependencies: fact.dependencies,
    }
  }
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${slug}/contents/package.json`,
      {
        headers: { ...ghHeaders(), Accept: "application/vnd.github.raw+json" },
        next: { revalidate: false },
      },
    )
    if (!res.ok) return null
    const pkg = (await res.json()) as PackageJson
    if (!pkg.name || pkg.private) return null
    return {
      name: pkg.name,
      commands: commandsOf({ ...pkg, name: pkg.name }),
      node: pkg.engines?.node ?? null,
      peers: Object.keys(pkg.peerDependencies ?? {}),
      dependencies: Object.keys(pkg.dependencies ?? {}),
    }
  } catch {
    return null
  }
}

// The frameworks worth naming on a chip, keyed by package. A dependency not
// listed here is plumbing and stays off the card.
const FRAMEWORKS: Record<string, string> = {
  "@modelcontextprotocol/sdk": "MCP SDK",
  ink: "Ink",
  react: "React",
  commander: "Commander",
  zod: "Zod",
  next: "Next.js",
  hono: "Hono",
  express: "Express",
  "@tauri-apps/api": "Tauri",
  vscode: "VS Code API",
}

export const frameworksOf = (facts: PackageFacts): string[] => [
  ...new Set(
    [...facts.dependencies, ...facts.peers]
      .map((dep) => FRAMEWORKS[dep])
      .filter((name): name is string => Boolean(name)),
  ),
]

// ">=22" reads as "22 or later"; any other range is shown as written.
export const formatNode = (range: string): string => {
  const floor = /^>=\s*v?(\d+)(?:\.0)*(?:\.0)?$/.exec(range.trim())
  return floor ? `${floor[1]} or later` : range
}
