# kud.io project repo conventions

[kud.io/projects](https://kud.io/projects) builds itself automatically from every
repo tagged on GitHub — no hand-maintained list. **The repo is the single source
of truth: kud.io just renders your README and docs, nicely.** You edit the repo,
never the website — bar three small metadata files that have nowhere else to live
(§9).

A project page (`/projects/<slug>`) is a nicer-looking version of your README. If
you want more than that, add a `landing.mdx` to override it. The real, multi-page
documentation lives in `docs/`.

---

## 1. Inclusion & category — GitHub topics

| Topic              | Effect                                                                                                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kud-site`         | **Required.** Includes the repo on kud.io/projects.                                                                                                                                                                                                                                                                  |
| `kud-site-<group>` | Section. One of: `app`, `desktop`, `cli`, `mcp`, `claude`, `lib`, `ui`, `vscode`, `theme`, `webext`, `other`. |
| `kud-site-app`     | A deployed web app — gets the icon launcher tile + an app landing (uses `app.json`, not the README). Set the repo homepage to the deployment, not the kud.io page.                                                                                                                                                                                                                 |
| `kud-site-desktop` | A native desktop app (e.g. Tauri) — shares the launcher tile + app landing with `kud-site-app`. Set `launchLabel`/`launchUrl` (e.g. "Download for macOS") and `ctaSubtitle` in `app.json` so the copy isn't browser-specific. Empty `app.json` → falls back to the README (lets an RFC/vote repo list from day one). |
| `kud-site-webext`  | A Firefox add-on — listed under **Firefox Add-ons**. Add `webext.json` on the website side (§9) to get the AMO listing link and the live daily-users figure in place of stars. |
| `kud-site-readme`  | Flag: the README **is** the product (curated lists) — rendered in full, no docs route.                                                                                                                                                                                                                               |
| `kud-site-tag-*`   | Content tags (e.g. `kud-site-tag-ai`) — surfaced as filterable chips. In use: `ai`, `devtools`, `git`, `media`, `macos`, `terminal`, `productivity`, `cloud`, `theme`. |
| `kud-site-eco-*`   | Product family (e.g. `kud-site-eco-qobuz` unites the lib, the CLI and the MCP server). Orthogonal to the section — a repo keeps its own category and joins at most one family. A family needs **two or more** members to render a tile, and the `lib` member is its face, so tag the headless core too.                                                                                                                                                                                                                                                |

No category topic → it falls into **CLIs & Tools** by default. Once tagged, the
repo appears on kud.io within the hour (and on each push, via the refresh
workflow) — you never touch the website.

> **Raycast extensions** are the one exception to the topic model: they live as
> subdirectories of the `raycast/extensions` monorepo, so there's no kud-owned
> repo to tag. Instead their slugs are curated in `scripts/sync-content.js`
> (`RAYCAST_SLUGS`, the canonical Raycast store slugs) — the analogue of a
> `kud-site` topic. Pages live at `/projects/raycast-<slug>` (namespaced so an
> extension can't collide with a kud repo of the same name). The sync enriches
> each from the Raycast store API and renders its **monorepo README** (tracked on
> `main`) as the landing; there's no docs route. Improve the content by opening a
> PR on `raycast/extensions` — never override it on the website — and it shows on
> both the Raycast Store and kud.io. New extension → add one slug.

## 2. Description — the GitHub repo description

The **repo description** (not the README) is the projects-list blurb and the
landing-page tagline. Make it a benefit-led one-liner under ~110 characters.
Emoji welcome. (The README keeps all its own styling — it's never used as the
description.)

## 3. Logo — `assets/icon.svg`

Commit **`assets/icon.svg`** (preferred) or **`assets/icon.png`**; VS Code
extensions/themes may use their packaging icon at **`images/icon.png`**. No icon
→ a category-coloured letter monogram (a fine default).

- **Square** (1:1), at least **256×256** (or an SVG).
- **Transparent background**, **the mark only** (no product-name text baked in).
- Designed to read on a **dark** surface.

## 4. The landing page is your README

`/projects/<slug>` renders your README. kud.io supplies its own hero (title from
the repo, the description as tagline, GitHub + Documentation buttons), then renders
the README body beneath it.

- The README's **leading GitHub chrome is stripped automatically** for the landing
  — the H1 title, an ASCII-art banner, a `<div align="center">` logo/badges hero,
  and any dangling `---` rule. The site hero replaces them, so don't fight it.
- Wrap anything you want kept **off** the landing (but left on GitHub) in
  `<!-- landing:skip -->` … `<!-- landing:/skip -->` — e.g. a Development section,
  contributor notes.
- **No CSS in the README.** GitHub strips `<style>`/`class`/`style` attributes, so
  CSS only ever works on kud.io. For a styled terminal, use a fenced code block
  (see §5) or `landing.mdx` (§7) — never inline CSS.
- Relative links/images are rewritten to absolute GitHub URLs at sync time.

## 5. README shape — keep it the same everywhere

Every kud-site README follows one shape. Full reference depth lives in the docs;
bespoke visuals live in an optional `landing.mdx`.

1. **Hero** — the logo (if the repo ships one), badges/tags, and a punchy
   one-line intro, plus the nav links: `<a href="https://kud.io/projects/<slug>">Website</a> · <a href="https://kud.io/projects/<slug>/docs">Documentation</a>`.
2. **`## Features`** — a short bullet list of what the project does. Use
   `**Title** — description` bullets. (These render on the landing too, since the
   landing _is_ the README.)
3. **One screenshot** _(optional)_ — placed **immediately after the Features
   list** (the hero pitches, Features explains, then the screenshot pays it off),
   only when there's a GUI worth showing. CLIs should prefer a ` ```console `
   fenced block (command + sample output) over a screenshot: it renders crisply on
   kud.io as a terminal, matches the theme, and is copy-pasteable. Don't bake
   terminal chrome into a screenshot — that's CSS on kud.io's side.
4. **`## Install`** — the install command(s).
5. **`## Usage`** — a short, representative usage example (a ` ```console ` block
   for CLIs).
6. **`## Development`** — clone + run for contributors (a good `landing:skip`
   candidate if you don't want it on the landing).
7. **Footer link to the docs** — `📚 **Full documentation → [<slug>/docs](https://kud.io/projects/<slug>/docs)**` (link text is `<slug>/docs`, not the raw URL).

## 6. Docs — `docs/*.mdx`

`docs/` becomes the multi-page documentation at `/projects/<slug>/docs`.

- `docs/index.mdx` is the docs home; `docs/meta.json` orders the sidebar:
  `{ "pages": ["index", "..."] }`.
- **Every page's frontmatter `title` leads with an emoji** — it's the sidebar
  label, so a bare title looks unfinished next to the others. The index page is
  `title: 👋 Introduction` (the docs label, **not** the repo name — the landing
  already shows the project name). Pick a fitting glyph per page, e.g.
  `⚡ Usage`, `🔐 Authentication`, `📚 Library`, `⌨️ Keybindings`, `⚙️ Configuration`.
- **Use emojis** in headings/intros too — it's the house style and reads warmly.
- **Don't link to "the docs" or the landing from inside the docs** — you're
  already there. Cross-link sibling doc pages, not the page you're on.
- Keep it current: prune instructions for removed flags/commands.
- No `docs/` folder → the README becomes the single docs page (fallback).

> **README-as-landing (`kud-site-readme`):** for repos where the README _is_ the
> product (awesome-lists). kud.io renders the full README and skips the docs route.

## 7. `landing.mdx` (optional) — the upgrade

A `landing.mdx` at the repo root overrides the README landing and uses kud.io's
component kit: `<Hero>`, `<Stats>`, `<Stat>`, `<Section>`, `<Install>`,
`<Terminal>`, `<Features>`, `<Feature>`, `<CTA>`. Use it for flagship projects —
fake terminals showing CLI output, screenshot galleries, a bespoke pitch (see
`shui`). The README stays the source of truth on GitHub; `landing.mdx` is purely
the prettier web face.

## 8. No sensitive data

READMEs, docs, and landings are **published**. Never commit real tokens, secrets,
internal hostnames, or live credentials — even in examples. Use obvious
placeholders (`example.com`, `<your-token>`).

## 9. The three files that live here, not in the repo

Everything above is authored in the source repo and synced. Three small pieces of
metadata are the exception — they are authored **in this repo**, under
`content/projects/<slug>/`, because `scripts/sync-content.js` would overwrite them
on its next run and because none of them means anything to a GitHub visitor.

| File            | For                | What it holds                                                                                                                            |
| --------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `app.json`      | `kud-site-app` / `kud-site-desktop` | The whole app landing: `icon`, `accent`, `tagline`, `why`, `how`, `stack`, `features`, `screenshots`, `launchUrl`, `launchLabel`, `ctaTitle`, `ctaSubtitle`. The README is not used. |
| `webext.json`   | `kud-site-webext`  | `{ "amo": "<addon-slug>" }` — the AMO slug rarely matches the repo name. Unlocks the store link and the live daily-users figure. Omit it until the add-on is actually published. |
| `surfaces.json` | any monorepo       | `{ "ecosystem": "<key>", "surfaces": [...] }` — declares each surface a monorepo ships so the family renders as several cards rather than one lonely one. See `content/projects/foxhop/`. |

App icons are the other website-side asset: a 512×512 PNG at `public/apps/<slug>.png`,
referenced from `app.json` as `/apps/<slug>.png`. The GitHub icon detector never
matches a PWA, so this one is copied in by hand — usually straight from the app's
own `brand/png/icon-512.png`.


---

### Quick checklist for a new project

- [ ] `kud-site` + `kud-site-<group>` topics
- [ ] A sharp, benefit-led repo description
- [ ] `assets/icon.svg` — square, transparent, mark only
- [ ] Standard README — logo · intro + features + badges + links · install · usage · dev · docs link
- [ ] `docs/index.mdx` (+ `docs/meta.json`); **every page `title` leads with an emoji** (index = `👋 Introduction`, not the repo name); no redundant landing/docs links
- [ ] No secrets anywhere
- [ ] _(apps only)_ `content/projects/<slug>/app.json` here + a 512×512 icon at `public/apps/<slug>.png` (§9)
- [ ] _(Firefox add-ons only)_ `content/projects/<slug>/webext.json` once it is live on AMO (§9)
- [ ] _(flagship only)_ a `landing.mdx`
