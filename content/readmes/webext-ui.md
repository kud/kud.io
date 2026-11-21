---
title: "webext-ui"
description: "A design system for Firefox WebExtension popups and options pages — vendored CSS, not a dependency."
hasDocs: true
---

## Features

- **Two CSS files, nothing else** — `tokens.css` (colour, spacing, type, radii, motion, focus as custom properties) and `webext-ui.css` (reset + class-based primitives). No JS, no build step, no runtime dependency.
- **Vendored, not imported** — a CLI copies the files straight into your repo instead of adding a dependency, because `web-ext build` strips `node_modules` from the packaged extension and a `<link>` into it would ship broken. Bundled extensions can import them by subpath instead.
- **Idempotent sync** — re-run the CLI any time; it overwrites the vendored copies with the same bytes for a given version, so it's always safe.
- **Version-stamped output** — every shipped file carries its version in a header comment, so checking whether a consumer repo is stale is a `grep`, not a diff.
- **Purpose-built for extension popups and options pages** — sized and themed for the small, constrained surfaces WebExtensions actually render.

## Install

For a plain, unbundled extension there's nothing to `npm install`. Run the CLI to vendor the CSS into your extension's repo:

```sh
npx @kud/webext-ui@latest sync src/vendor/
```

This creates `src/vendor/` if it doesn't already exist, and overwrites `tokens.css` and `webext-ui.css` if it does — running it again later (to pick up a new version) is always safe.

> [!IMPORTANT]
> Without a bundler, don't link to `@kud/webext-ui` from inside `node_modules`. `web-ext build` — the standard tool for packaging Firefox extensions — excludes `node_modules` from the built `.xpi` entirely. A stylesheet pointing there resolves fine in dev and then silently vanishes from the shipped package. For a plain, unbundled extension, vendoring the files into your own tree is the only model that survives packaging.

Link the vendored files, then your extension's `src/theme.css`, from **every** page — popup and options alike:

```html
<link rel="stylesheet" href="https://github.com/kud/webext-ui/blob/HEAD/vendor/tokens.css" />
<link rel="stylesheet" href="https://github.com/kud/webext-ui/blob/HEAD/vendor/webext-ui.css" />
<link rel="stylesheet" href="https://github.com/kud/webext-ui/blob/HEAD/theme.css" />
<link rel="stylesheet" href="https://github.com/kud/webext-ui/blob/HEAD/popup.css" />
```

`theme.css` holds the extension's identity and nothing else — in most cases just its accent. It lives in its own file, not in `popup.css`, because a page that links the vendored pair without it silently falls back to the default orange. That happens the day an extension grows an options page:

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
> label is a filled `.badge-accent`, not coloured type.

### With a bundler

An extension built with a bundler (WXT, Vite) copies imported CSS into its own output, so `node_modules` never has to ship. Install the package pinned to an exact version and import the stylesheets by subpath, tokens first:

```sh
npm install --save-exact @kud/webext-ui
```

```js
import "@kud/webext-ui/tokens.css"
import "@kud/webext-ui/webext-ui.css"
import "./theme.css"
```

The package exports exactly `./tokens.css`, `./webext-ui.css` and `./package.json`. `theme.css` still belongs to the extension, as above.

> [!NOTE]
> The stylesheets use `color-mix()` and relative colour syntax, so consumers need Firefox 128 or later. If your extension declares `data_collection_permissions` (Firefox 140), set `"strict_min_version": "142.0"` under `browser_specific_settings.gecko` and the floor is stated in the manifest.

## Usage

```console
$ npx @kud/webext-ui@latest sync src/vendor/
Synced tokens.css, webext-ui.css to src/vendor/
```

Each vendored file opens with a stamped header comment giving the package version it came from:

```css
/* @kud/webext-ui — tokens.css vX.Y.Z
```

That stamp is the whole point of shipping a version at all — with several consumer repos each holding their own copy, "is repo X still on the latest tokens.css?" is answerable with one `grep` against the first line of the vendored file, rather than diffing bytes against this repo every time.
