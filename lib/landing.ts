import { readFileSync } from "node:fs"
import { join } from "node:path"

export type Feature = { title: string; description: string }
export type Landing = {
  intro: string | null
  features: Feature[]
  install: string | null
  examples: string[]
}

const EMPTY: Landing = {
  intro: null,
  features: [],
  install: null,
  examples: [],
}

// Structured landing data extracted from the README at sync time. Tolerant of
// older landing.json shapes (missing intro/examples) so a stale file never
// throws during render.
export const getLanding = (slug: string): Landing => {
  try {
    const raw = readFileSync(
      join(process.cwd(), "content", "projects", slug, "landing.json"),
      "utf8",
    )
    const data = JSON.parse(raw) as Partial<Landing>
    return {
      intro: data.intro ?? null,
      features: data.features ?? [],
      install: data.install ?? null,
      examples: data.examples ?? [],
    }
  } catch {
    return EMPTY
  }
}
