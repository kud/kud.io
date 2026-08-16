---
title: "webext-ui"
description: "A design system for Firefox WebExtension popups and options pages — vendored CSS, not a dependency."
---

## Features

- **Two CSS files, nothing else** — `tokens.css` (colour, spacing, type, radii, motion, focus as custom properties) and `webext-ui.css` (reset + class-based primitives). No JS, no build step, no runtime dependency.
- **Vendored, not imported** — a CLI copies the files straight into your repo instead of adding a dependency, because `web-ext build` strips `node_modules` from the packaged extension and a `<link>` into it would ship broken.
- **Idempotent sync** — re-run the CLI any time; it overwrites the vendored copies with the same bytes for a given version, so it's always safe.
- **Version-stamped output** — every shipped file carries its version in a header comment, so checking whether a consumer repo is stale is a `grep`, not a diff.
- **Purpose-built for extension popups and options pages** — sized and themed for the small, constrained surfaces WebExtensions actually render.

## Install

There's nothing to `npm install`. Run the CLI to vendor the CSS into your extension's repo:

```sh
npx @kud/webext-ui@latest sync src/vendor/
```

This creates `src/vendor/` if it doesn't already exist, and overwrites `tokens.css` and `webext-ui.css` if it does — running it again later (to pick up a new version) is always safe.

> [!IMPORTANT]
> Don't add `@kud/webext-ui` as a `dependency` and don't link to it from inside `node_modules`. `web-ext build` — the standard tool for packaging Firefox extensions — excludes `node_modules` from the built `.xpi` entirely. A stylesheet pointing there resolves fine in dev and then silently vanishes from the shipped package. Vendoring the files into your own tree is the only model that survives packaging, not a workaround for one.

Link the vendored files from your popup or options HTML:

```html
<link rel="stylesheet" href="https://github.com/kud/webext-ui/blob/HEAD/vendor/tokens.css" />
<link rel="stylesheet" href="https://github.com/kud/webext-ui/blob/HEAD/vendor/webext-ui.css" />
<link rel="stylesheet" href="https://github.com/kud/webext-ui/blob/HEAD/popup.css" />
```

Your own stylesheet comes last and should hold only what is specific to your
extension — in most cases that is just its accent:

```css
:root {
  --accent: #1a73e8;
  --accent-fg: #ffffff; /* must reach 4.5:1 on --accent */
}

@media (prefers-color-scheme: dark) {
  :root {
    --accent: #8ab4f8;
    --accent-fg: #1c1b22;
  }
}
```

> [!WARNING]
> `--accent-fg` is a paired value that flips with `--accent` — check it, don't
> guess it. White on a mid orange measures 3.48:1 and fails AA; ink on the same
> orange is 4.92:1. And never put the accent in _text_: an accent-toned status
> label is a filled `.badge`, not coloured type.

## Usage

```console
$ npx @kud/webext-ui@latest sync src/vendor/
Synced tokens.css, webext-ui.css to src/vendor/
```

Each vendored file opens with a stamped header comment giving its version:

```css
/* @kud/webext-ui — tokens.css v0.1.0 */
```

That stamp is the whole point of shipping a version at all — with several consumer repos each holding their own copy, "is repo X still on the latest tokens.css?" is answerable with one `grep` against the first line of the vendored file, rather than diffing bytes against this repo every time.

## CLI Reference

| Command                       | Description                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `webext-ui sync <target-dir>` | Copies `tokens.css` and `webext-ui.css` into `<target-dir>`, creating it (and any missing parent directories) if needed. Safe to re-run. |

## Development

```sh
git clone https://github.com/kud/webext-ui.git
cd webext-ui
npm install
npm run build
npm test
```

`src/css/tokens.css` and `src/css/webext-ui.css` are the actual source of truth for styling — extend the design system there, not in `dist/`. `npm run build` runs `tsup` on the CLI entry, then a stamp-css step that copies both source files into `dist/` with the `@VERSION@` placeholder in their header comments replaced by the current `package.json` version. `npm test` builds and then runs Vitest, so the tests always exercise a freshly stamped `dist/` — the build is chained into the `test` script rather than left to a `pretest` hook, because a global `ignore-scripts=true` in npm config silently suppresses lifecycle hooks and would otherwise test a stale `dist/`.

`demo/index.html` is a catalogue of every primitive in both themes. Open it directly from disk after a build — it loads `dist/`, and appending `#f-btn`, `#f-input`, `#f-toggle` or `#f-reveal` forces that control into a focus state so the ring can be reviewed.
