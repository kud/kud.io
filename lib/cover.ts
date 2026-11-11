import { readFileSync } from "node:fs"
import { join } from "node:path"
import { ART } from "@/lib/art"

// A README that opens on a wide banner (the same test the sync applies: a
// leading image that is not an icon or logo) has its hero in that image.
const LEADING_IMAGE = /^(?:<img\b[^>]*\/?>|!\[[^\]]*\]\([^)]*\))\s*(?:\n|$)/i
const SRC = /<img\b[^>]*\bsrc=["']([^"']+)["']|!\[[^\]]*\]\(([^)\s]+)/i

export const readmeHero = (slug: string): string | null => {
  let raw: string
  try {
    raw = readFileSync(
      join(process.cwd(), "content", "readmes", `${slug}.md`),
      "utf8",
    )
  } catch {
    return null
  }
  const body = raw.replace(/^---\n[\s\S]*?\n---\n/, "").replace(/^\s+/, "")
  const lead = LEADING_IMAGE.exec(body)?.[0]
  if (!lead || /\b(?:icon|logo)\b/i.test(lead)) return null
  const match = SRC.exec(lead)
  return match?.[1] ?? match?.[2] ?? null
}

// A project's cover: its own drawing when it has one, else the hero image its
// README opens on. The README's banner never also shows in the body
// (lib/remark-readme.ts strips it), so a project has one hero, not two.
export const coverOf = (project: {
  slug: string
  readmeSlug?: string
}): string | null =>
  ART[project.slug] ?? readmeHero(project.readmeSlug ?? project.slug)
