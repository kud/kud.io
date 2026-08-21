---
title: "webext-notionish"
description: "Firefox extension that makes Google Docs and Sheets read like Notion"
---

> [!NOTE]
> **Prototype — not on addons.mozilla.org yet.** v1 is deliberately cosmetic and
> narrow, and it has never been submitted for review, so there is no one-click
> install. Load it as a temporary add-on from source (see Development below).
> Google ships Docs and Sheets markup that changes without notice, so expect the
> selectors in `SELECTORS.md` to need chasing.

Google Docs and Sheets are visually loud: a dense Material toolbar, two rulers, a left rail carrying the outline and tab strip, and a grey backdrop with a paper drop-shadow around every page. Notion's appeal is the opposite — the page is nearly the only thing on screen. Notionish borrows that restraint for Docs and Sheets.

v1 is deliberately cosmetic and narrow: it hides the furniture around the document. It does not touch the document itself.

## 🌟 Features

- 🙈 **Hides the furniture** — removes Docs' menu row, toolbar, both rulers (there is a vertical one), and the left rail holding the outline and tab strip. The thin title band stays: a Notion page carries one strip of context too.
- 📊 **Sheets, decluttered** — hides the menu row and toolbar while leaving the grid untouched.
- 🔍 **Docs text at a readable size** — the one thing chrome removal cannot reach. Body text is painted to a canvas, so no stylesheet sets its size; browser zoom changes the resolution Docs renders against, so the canvas is repainted larger rather than scaled up and the text stays sharp. Applied while focus mode is on and reverted the moment it is off. It is Firefox's site zoom for `docs.google.com` — per-tab zoom exists in the API but only in a mode where the browser stops applying it and the extension is expected to scale the page itself, which for a canvas is the soft-text outcome this avoids.
- 🎨 **Warm surface treatment** — swaps Google's grey backdrop and paper drop-shadow for a continuous, Notion-ish page.
- ✍️ **Notion-ish chrome typography** — restyles the UI that survives (comment cards, dialogs, context menus) to match, and sets it in the bundled Inter under a private family name so the chrome gets Notion's face while the document's canvas is untouched.
- 🔘 **Quieted title bar** — the header band painted flat white, the Material icon buttons reduced to hairline circles, and Share given a white fill with a grey outline instead of its blue pill. The row aligns on middles rather than baselines, so it stays put when the typeface changes.
- ⌨️ **One-key toggle** — `Alt+Shift+N`, or the popup button, brings the full Google UI back instantly without disabling the extension.
- 🎚 **Per-surface control** — enable or disable Docs and Sheets independently from the popup or options page, synced via `browser.storage.sync`.
- 🛡 **Fails safe** — if a selector stops matching after a Google redesign, the affected element simply stays visible; the page is never left broken.

## Install

### From Firefox Add-ons (remote)

[Notionish on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/notionish/)

The listing goes live once the add-on clears AMO review — until then, install from source below.

### From source (local)

```sh
git clone https://github.com/kud/webext-notionish.git
cd webext-notionish
npm install
npm run build
```

Load it in Firefox: `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → select `manifest.json` (or the built package in `web-ext-artifacts/`). Temporary add-ons are dropped on restart and must be reloaded after every change.

## 🚀 Quick Start

Once installed, Notionish is on by default for both Docs and Sheets — open any document or spreadsheet and the chrome is already gone.

- Press `Alt+Shift+N` (or click the toolbar icon, then **Toggle focus mode**) to bring the full Google UI back on the current tab, without disabling the extension.
- Open the popup to see whether the current tab is enabled, and to flip it for that surface.
- Open the options page (via the popup's **Open options** link) to enable or disable Docs and Sheets independently — the choice is persisted in `browser.storage.sync`.

## 🧭 How it works

Notionish is CSS-first by design. `src/content.js` runs at `document_start`, resolves which surface the tab is on from the URL, and — once `browser.storage.sync` confirms that surface is enabled — tags `<html>` with `data-notionish-surface` and `data-notionish-focus` attributes. Every hiding and restyling rule lives in `src/content/{shared,docs,sheets}.css`, gated behind those attributes. No JavaScript touches the document itself.

That split is deliberate: **if the JS never runs, or a selector stops matching after a Google redesign, the corresponding attribute is simply never set and the rule stays inert.** The failure mode is always "you see Google's normal interface" — never a hidden or broken page.

Two things sit outside that split, both because canvas is unreachable from a stylesheet: the optional `@font-face` injection, and the page zoom the background script applies via `tabs.setZoom`. Neither touches the document — zoom is a property of your view of the tab, which is exactly why it is usable where Docs' own pageless mode was not.

Surface detection is URL-based rather than host-based: `docs.google.com` hosts both Docs (`/document/*`) and Docs-embedded Sheets (`/spreadsheets/*`), while `sheets.google.com` is a separate host that redirects into the same app — so the host alone can't say which surface a tab is on. Slides and Drive itself are left untouched.

Every selector the stylesheets rely on is tracked in [`SELECTORS.md`](https://github.com/kud/webext-notionish/blob/HEAD/SELECTORS.md), tiered by evidence rather than by confidence: CONFIRMED (matched on a live document), CONFIRMED ABSENT (matched nothing, do not reinstate), or UNVERIFIED. The first pass through a running Doc and Sheet moved most entries, and not in the direction anyone expected — two selectors carried as high-confidence matched zero nodes.

## 🚫 Out of scope

These are informed exclusions, not gaps:

- **The document's typeface.** Canvas resolves font families through the same machinery as the DOM, so an `@font-face` injected at author origin does change what Docs paints. It is not usable: Docs positions each formatting run at a coordinate derived from the original font's measurements, so any visually different substitute makes adjacent runs overlap. Ships as an option, off by default, documented as an experiment. (Text *size* is a different question and is solved — see the zoom feature above. Measure and line layout stay out of reach outright.)
- **Page geometry.** Docs' own pageless mode is the only real fix for the page-shaped page, and it is a document setting stored server-side — turning it on changes the document for everyone who opens it. Not viable on a shared doc.
- **A Notion-style Drive navigation sidebar.** Injecting one is a v2 project of its own; it needs Drive API OAuth.
- **Google Slides.**
- **Chrome / Chromium.** Firefox only — the manifest targets `browser_specific_settings.gecko` and ships no Chromium build.

## ⚠️ Known limitations

- **Google will move these selectors eventually.** They're confirmed against a live Doc and Sheet, not guaranteed against next quarter's redesign. When a piece of furniture reappears, that's the signal — run `tools/selector-probe.js` and re-tier [`SELECTORS.md`](https://github.com/kud/webext-notionish/blob/HEAD/SELECTORS.md) from what it reports rather than guessing at a new class name.
- **The Sheets formula bar is still showing.** Both guessed selectors for it matched nothing on a live spreadsheet, and its real one is not yet known.

## 🔧 Development

```sh
git clone https://github.com/kud/webext-notionish.git
cd webext-notionish
npm install
npm run dev
```

`npm run dev` launches Firefox Nightly with the extension already loaded and live-reloaded on file changes, against a persistent profile at `~/.cache/notionish-dev-profile`. **Sign into Google there once** — the profile is kept between runs, so every later run opens on a real signed-in session. That matters more than it sounds: there is nothing to test this extension against without one, and a throwaway profile is why the keyboard shortcut went two build cycles without anyone actually pressing it. Use `npm run dev:clean` for a fresh temporary profile when you want to see a first-install experience.

The dev profile is deliberately its own, not a copy of your daily one: your real profile is never opened by tooling, and the 800MB copy that copying it would cost on every launch never happens.

For a one-off manual load instead, use `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → `manifest.json`. Temporary add-ons do **not** hot-reload — `about:debugging` needs an explicit **Reload** after every change, which `npm run dev` handles for you.

```
src/
├── background.js          # MV2 background script — keyboard command relay
├── content.js              # runs at document_start, resolves surface, tags <html>
├── content/
│   ├── shared.css          # rules shared by Docs and Sheets
│   ├── docs.css             # Docs-specific hiding/restyling
│   └── sheets.css           # Sheets-specific hiding/restyling
├── icons/icon.svg           # the extension mark, single SVG at every size
├── lib/storage.js           # browser.storage.sync helpers (popup/options only)
├── options/                 # options page
└── popup/                   # toolbar popup
```

| Script            | What it does                                                                  |
| ----------------- | ----------------------------------------------------------------------------- |
| `npm run dev`       | Launches Firefox Nightly on the persistent dev profile, extension loaded and watched |
| `npm run dev:clean` | Same, but on a fresh throwaway profile — no Google session                          |
| `npm run lint`    | Runs `web-ext lint`                                                           |
| `npm run build`   | Builds a signable package into `web-ext-artifacts/`                           |
| `npm run version` | Syncs `manifest.json`'s version from `package.json` (used by release tooling) |
| `npm run publish` | Builds and opens the AMO Developer Hub for a first manual submission          |

`tools/` holds three page-console probes, none of which ship in the package:

| Command | Probe | Answers |
| ------- | ----- | ------- |
| `npm run probe:selectors` | `selector-probe.js` | which elements are there, and which are visible despite a rule |
| `npm run probe:spacing` | `spacing-probe.js` | which element owns each gap, and the page's box geometry |
| `npm run probe:model` | `model-probe.js` | what Docs' own document model contains, straight from the page HTML |

Each copies itself to the clipboard, because the step after "which probe do I want" is always "get it into the console" — paste into the page console on a real Doc (`Cmd+Opt+K`, not the Browser Console) and read the output per [`SELECTORS.md`](https://github.com/kud/webext-notionish/blob/HEAD/SELECTORS.md). macOS only, being `pbcopy`; `cat` the file anywhere else.

Both `src/background.js` and `src/content.js` load as classic (non-module) scripts under Manifest V2, so they duplicate `DEFAULT_PREFS` from `src/lib/storage.js` rather than importing it — `storage.js` itself is only imported by the popup and options page, which do run as ES modules.

Releases are signed and uploaded to AMO automatically by [`.github/workflows/release.yml`](https://github.com/kud/webext-notionish/blob/HEAD/.github/workflows/release.yml) on every `v*` tag push. The very first submission of a new add-on can't go through that pipeline — AMO requires it manually via the Developer Hub — so `npm run publish` builds the package and opens the Hub for that one-off step.

## 🏗 Tech Stack

| Component    | Choice                                                       |
| ------------ | ------------------------------------------------------------ |
| Platform     | WebExtensions, Manifest V2                                   |
| Browser      | Firefox only (`browser_specific_settings.gecko`)             |
| Language     | Vanilla JavaScript — ES modules where the manifest allows it |
| Styling      | Hand-written CSS, gated by `data-notionish-*` attributes     |
| Storage      | `browser.storage.sync`                                       |
| Tooling      | `web-ext` 10.6.0 — pinned exact, drives lint/run/build/sign  |
| CI / Release | GitHub Actions — signs and uploads to AMO on `v*` tag push   |

---

MIT © [kud](https://github.com/kud) — Made with ❤️
