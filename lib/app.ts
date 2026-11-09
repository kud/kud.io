import { readFileSync } from "node:fs"
import { join } from "node:path"
import { capitalCase } from "change-case"

export type Feature = { title: string; description: string }

// A product record's infobox row, and one step of its "How it works" chain.
export type Fact = { label: string; value: string }
export type FlowStep = { label: string; note?: string }

// Curated content for a `kud-site-app` project — the deployed web apps that lead
// the projects list as big liquid-glass launcher tiles and get their own page.
// Kept in content/projects/<slug>/app.json so it survives sync-content runs (the
// GitHub icon detector never matches these PWAs), and read server-side only.
//
// Two shapes share the file:
// - A beansontoast product sets `beansontoast` (its subdomain). The product's
//   pitch lives at <subdomain>.beansontoast.app; kud.io keeps an engineering
//   record only: `summary`, `stack`, `decisions`, `writing`. It never carries a
//   tagline, a feature list or screenshots, which would make it a second landing.
// - Any other app keeps the landing fields (`tagline`, `why`, `how`, `features`,
//   `screenshots`, `launchUrl`, the CTA copy).
export type AppMeta = {
  name: string | null
  icon: string | null
  accent: string | null
  beansontoast: string | null
  summary: string | null
  decisions: string[]
  writing: string[]
  what: string | null
  who: string | null
  facts: Fact[]
  flow: FlowStep[]
  flowNote: string | null
  tagline: string | null
  why: string | null
  how: string | null
  stack: string[]
  features: Feature[]
  screenshots: string[]
  launchUrl: string | null
  launchLabel: string | null
  ctaTitle: string | null
  ctaSubtitle: string | null
}

const EMPTY: AppMeta = {
  name: null,
  icon: null,
  accent: null,
  beansontoast: null,
  summary: null,
  decisions: [],
  writing: [],
  what: null,
  who: null,
  facts: [],
  flow: [],
  flowNote: null,
  tagline: null,
  why: null,
  how: null,
  stack: [],
  features: [],
  screenshots: [],
  launchUrl: null,
  launchLabel: null,
  ctaTitle: null,
  ctaSubtitle: null,
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
      beansontoast: data.beansontoast ?? null,
      summary: data.summary ?? null,
      decisions: data.decisions ?? [],
      writing: data.writing ?? [],
      what: data.what ?? null,
      who: data.who ?? null,
      facts: data.facts ?? [],
      flow: data.flow ?? [],
      flowNote: data.flowNote ?? null,
      tagline: data.tagline ?? null,
      why: data.why ?? null,
      how: data.how ?? null,
      stack: data.stack ?? [],
      features: data.features ?? [],
      screenshots: data.screenshots ?? [],
      launchUrl: data.launchUrl ?? null,
      launchLabel: data.launchLabel ?? null,
      ctaTitle: data.ctaTitle ?? null,
      ctaSubtitle: data.ctaSubtitle ?? null,
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

// Products made under the beansontoast label: they live at their own subdomain,
// and kud.io holds only how they were built.
export const isProduct = (app: AppMeta): boolean => app.beansontoast !== null

export const productUrl = (app: AppMeta): string | null =>
  app.beansontoast ? `https://${app.beansontoast}.beansontoast.app` : null

export const productHost = (app: AppMeta): string | null =>
  app.beansontoast ? `${app.beansontoast}.beansontoast.app` : null
