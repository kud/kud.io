import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

// slug → icon URL. Synced icons are raw URLs of each repo's assets/icon.{svg,png}
// (content/projects/icons.json). A project with no repo to carry one (a
// synthesised monorepo surface such as foxhop-cli) keeps it in this repo instead,
// as public/icons/<slug>.svg and/or .png; a local icon wins over a synced one.
let cache: Record<string, string> | null = null

const LOCAL_DIR = "public/icons"
const LOCAL_ICON = /^(.+)\.(svg|png)$/i

const readSynced = async (): Promise<Record<string, string>> => {
  try {
    const raw = await readFile(
      join(process.cwd(), "content/projects/icons.json"),
      "utf8",
    )
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

// SVG first, PNG as the fallback: the same ladder the sync applies to repos.
export const localIcons = (files: string[]): Record<string, string> => {
  const icons: Record<string, string> = {}
  for (const file of [...files].sort()) {
    const match = LOCAL_ICON.exec(file)
    if (!match) continue
    const [, slug, ext] = match
    if (icons[slug] && ext.toLowerCase() !== "svg") continue
    icons[slug] = `/icons/${file}`
  }
  return icons
}

const readLocal = async (): Promise<Record<string, string>> => {
  try {
    return localIcons(await readdir(join(process.cwd(), LOCAL_DIR)))
  } catch {
    return {}
  }
}

export const getIcons = async (): Promise<Record<string, string>> => {
  if (cache) return cache
  const [synced, local] = await Promise.all([readSynced(), readLocal()])
  cache = { ...synced, ...local }
  return cache
}
