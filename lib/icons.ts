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

// Whether an icon carries its own tile: a ground that fills the whole canvas,
// as the shared cream `<rect width="512" height="512">` of the repo icons does.
// A tiled icon bleeds to the edge of the plate it sits on, so the plate's
// rounded corners clip it into one shape; a bare glyph keeps the plate's
// padding and ground around it. Rasters are full app-icon art and count as
// tiled; a URL with no extension (a Raycast store icon) is unknown, so it
// keeps the plate. Unreadable or unreachable icons keep the plate: the safe look.
const SVG_NOISE =
  /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<(title|desc|defs|metadata|style)\b[\s\S]*?<\/\1>/gi

const attr = (tag: string, name: string): string | null =>
  new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(tag)?.[1] ?? null

const num = (value: string | null): number | null => {
  if (value === null) return null
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : null
}

export const svgHasTile = (svg: string): boolean => {
  const body = svg.replace(SVG_NOISE, "")
  const root = /<svg\b[^>]*>/i.exec(body)
  if (!root) return false
  const box = attr(root[0], "viewBox")?.trim().split(/[\s,]+/).map(Number)
  const width = box?.[2] ?? num(attr(root[0], "width"))
  const height = box?.[3] ?? num(attr(root[0], "height"))
  if (!width || !height) return false
  // The first drawn element, wherever it sits: a ground is drawn first.
  const first = /<(rect|path)\b[^>]*>/i.exec(
    body.slice(root.index + root[0].length),
  )
  if (!first) return false
  const [tag, kind] = first
  const fill = attr(tag, "fill")
  if (fill === "none" || fill === "transparent") return false
  const close = (value: number | null, target: number) =>
    value !== null && Math.abs(value - target) <= target * 0.01
  if (kind.toLowerCase() === "rect") {
    const full = (value: string | null, target: number) =>
      value === "100%" || close(num(value), target)
    return (
      (num(attr(tag, "x")) ?? 0) === 0 &&
      (num(attr(tag, "y")) ?? 0) === 0 &&
      full(attr(tag, "width"), width) &&
      full(attr(tag, "height"), height)
    )
  }
  // A path ground: the canvas traced as `M0 0H w V h H0 Z`.
  const d = attr(tag, "d")?.replace(/[\s,]+/g, " ").trim() ?? ""
  const trace = /^M ?0 0 ?H ?([\d.]+) ?V ?([\d.]+) ?H ?0 ?Z$/i.exec(d)
  return Boolean(
    trace && close(num(trace[1]), width) && close(num(trace[2]), height),
  )
}

const tileCache = new Map<string, Promise<boolean>>()

const readIcon = async (src: string): Promise<string> => {
  if (src.startsWith("/")) {
    return readFile(join(process.cwd(), "public", src), "utf8")
  }
  const res = await fetch(src, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`${res.status} ${src}`)
  return res.text()
}

const RASTER = /\.(?:png|jpe?g|webp|avif)(?:$|[?#])/i

export const isTiledIcon = (
  src: string | null | undefined,
): Promise<boolean> => {
  if (!src) return Promise.resolve(false)
  if (RASTER.test(src)) return Promise.resolve(true)
  if (!/\.svg(?:$|[?#])/i.test(src)) return Promise.resolve(false)
  let pending = tileCache.get(src)
  if (!pending) {
    pending = readIcon(src).then(svgHasTile, () => false)
    tileCache.set(src, pending)
  }
  return pending
}
