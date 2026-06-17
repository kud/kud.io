# kud.io project repo conventions

[kud.io/projects](https://kud.io/projects) builds itself automatically from every
repo tagged on GitHub — no hand-maintained list. This is the contract a repo
follows to appear, and to look good doing it.

The website is the presentation layer; each repo is the content layer. Keep the
repo minimal and let kud.io render it.

---

## 1. Inclusion & category — GitHub topics

| Topic              | Effect                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `kud-site`         | **Required.** Includes the repo on kud.io/projects.                                       |
| `kud-site-<group>` | Places it in a section. One of: `cli`, `mcp`, `claude`, `ui`, `vscode`, `theme`, `other`. |
| `kud-site-readme`  | Flag: render the README as the landing page, no docs (see §4).                            |

No category topic → it falls into **CLIs & Tools** by default.

## 2. Description — the GitHub repo description

The **repo description** (not the README) is shown on the projects list and as
the landing-page tagline. Make it a benefit-led one-liner; keep it under ~110
characters. Emoji are welcome here. (READMEs keep all their emoji and styling —
they're never shown as the description.)

## 3. Logo — `assets/icon.svg`

A repo opts into a logo by committing **`assets/icon.svg`** (preferred) or
**`assets/icon.png`**. VS Code extensions/themes may instead use their packaging
icon at **`images/icon.png`** (read automatically). No icon → kud.io renders a
category-coloured letter monogram, which is a perfectly good default.

Requirements for the logo to compose well on kud.io's dark tiles:

- **Square** (1:1), at least **256×256** (or an SVG).
- **Transparent background** — no baked-in coloured backdrop.
- **The mark only** — no product name text inside the image.
- Designed to read on a **dark** surface.

> ⚠️ A full "app icon" (opaque background + the product name baked in, e.g. a
> marketplace tile) does **not** conform — it looks like a sticker on the row.
> Provide a clean transparent glyph instead.

## 4. Docs — `docs/*.mdx`

`docs/` becomes the multi-page documentation at
`kud.io/projects/<slug>/docs`.

- `docs/index.mdx` is the landing page of the docs.
- `docs/meta.json` controls sidebar order: `{ "pages": ["index", "..."] }`.
- Relative links/images are rewritten to absolute GitHub URLs at sync time.
- No `docs/` folder → the README becomes the single docs page (fallback).

> **README-as-landing (`kud-site-readme`):** add this topic when the README
> _is_ the product (e.g. an awesome-list). kud.io renders the full README on the
> landing page and skips the docs route entirely — no `docs/` needed. It's a
> behaviour flag independent of the category, so any project can opt in.

## 5. Landing (optional) — `landing.mdx`

A `landing.mdx` at the repo root overrides the auto-generated landing page and
uses the website's component kit (`<Hero>`, `<Stats>`, `<Section>`,
`<Features>`, `<Terminal>`, `<CTA>`…). Use it for flagship projects that deserve
a bespoke pitch (see `shui`). Without it, kud.io builds a landing from the
README (hero + features + install).

## 6. Install — an `## Install` / `## Quick start` section

The landing's "Quick start" terminal uses the first code block under an
`Install`, `Quick start`, `Getting started`, or `Usage` heading in the README.
If none exists, kud.io derives a command from `package.json`
(`npm install -g …`, `npx …`, or `code --install-extension …`). Writing your own
install snippet is always better than the fallback.

## 7. README — keep it minimal

Branding, install, a short dev section, and a link to the kud.io docs. Everything
else (features, the full landing, the multi-page docs) lives on kud.io. Emoji and
personality encouraged — the README is yours.

---

### Quick checklist for a new project

- [ ] `kud-site` + `kud-site-<group>` topics
- [ ] A sharp, benefit-led repo description
- [ ] `assets/icon.svg` — square, transparent, mark only
- [ ] `docs/index.mdx` (+ `docs/meta.json`) for real docs
- [ ] An `## Install` section in the README
- [ ] _(flagship only)_ a `landing.mdx`
