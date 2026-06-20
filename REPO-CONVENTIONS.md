# kud.io project repo conventions

[kud.io/projects](https://kud.io/projects) builds itself automatically from every
repo tagged on GitHub — no hand-maintained list. **The repo is the single source
of truth: kud.io just renders your README and docs, nicely.** You edit the repo,
never the website.

A project page (`/projects/<slug>`) is a nicer-looking version of your README. If
you want more than that, add a `landing.mdx` to override it. The real, multi-page
documentation lives in `docs/`.

---

## 1. Inclusion & category — GitHub topics

| Topic              | Effect                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `kud-site`         | **Required.** Includes the repo on kud.io/projects.                                                  |
| `kud-site-<group>` | Section. One of: `app`, `cli`, `mcp`, `claude`, `ui`, `vscode`, `theme`, `other`.                    |
| `kud-site-app`     | A deployed web app — gets the icon launcher tile + an app landing (uses `app.json`, not the README). |
| `kud-site-readme`  | Flag: the README **is** the product (curated lists) — rendered in full, no docs route.               |
| `kud-site-tag-*`   | Content tags (e.g. `kud-site-tag-ai`) — surfaced as filterable chips.                                |

No category topic → it falls into **CLIs & Tools** by default. Once tagged, the
repo appears on kud.io within the hour (and on each push, via the refresh
workflow) — you never touch the website.

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
3. **One screenshot** _(optional)_ — only when there's a GUI worth showing. CLIs
   should prefer a ` ```console ` fenced block (command + sample output) over a
   screenshot: it renders crisply on kud.io as a terminal, matches the theme, and
   is copy-pasteable. Don't bake terminal chrome into a screenshot — that's CSS on
   kud.io's side.
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
- **Use emojis** in headings/intros — it's the house style and it reads warmly.
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

---

### Quick checklist for a new project

- [ ] `kud-site` + `kud-site-<group>` topics
- [ ] A sharp, benefit-led repo description
- [ ] `assets/icon.svg` — square, transparent, mark only
- [ ] Standard README — logo · intro + features + badges + links · install · usage · dev · docs link
- [ ] `docs/index.mdx` (+ `docs/meta.json`), emojis, no redundant landing/docs links
- [ ] No secrets anywhere
- [ ] _(flagship only)_ a `landing.mdx`
