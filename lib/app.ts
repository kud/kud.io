import { readFileSync } from "node:fs"
import { join } from "node:path"
import { capitalCase } from "change-case"

export type Feature = { title: string; description: string }

// Curated content for a `kud-site-app` project — the deployed web apps that lead
// the projects list as big liquid-glass launcher tiles and get their own landing.
// Kept in content/projects/<slug>/app.json so it survives sync-content runs (the
// GitHub icon detector never matches these PWAs), and read server-side only.
export type AppMeta = {
  name: string | null
  icon: string | null
  accent: string | null
  tagline: string | null
  why: string | null
  how: string | null
  stack: string[]
  features: Feature[]
  screenshots: string[]
  launchUrl: string | null
  launchLabel: string | null
}

const EMPTY: AppMeta = {
  name: null,
  icon: null,
  accent: null,
  tagline: null,
  why: null,
  how: null,
  stack: [],
  features: [],
  screenshots: [],
  launchUrl: null,
  launchLabel: null,
}

export const getApp = (slug: string): AppMeta => {
  try {
    const raw = readFileSync(
      join(process.cwd(), "content", "projects", slug, "app.json"),
      "utf8",
    )
    const data = JSON.parse(raw) as Partial<AppMeta>
    return {
      name: data.name ?? null,
      icon: data.icon ?? null,
      accent: data.accent ?? null,
      tagline: data.tagline ?? null,
      why: data.why ?? null,
      how: data.how ?? null,
      stack: data.stack ?? [],
      features: data.features ?? [],
      screenshots: data.screenshots ?? [],
      launchUrl: data.launchUrl ?? null,
      launchLabel: data.launchLabel ?? null,
    }
  } catch {
    return EMPTY
  }
}

// Launcher tiles and app landings show a polished product name ("Planning Poker")
// rather than the raw repo slug ("planning-poker"). app.json may override it; the
// default is the slug run through capitalCase.
export const appDisplayName = (slug: string, app: AppMeta): string =>
  app.name ?? capitalCase(slug)
