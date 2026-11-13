---
title: "webext-notionish"
description: "Firefox extension that makes Google Docs and Sheets read like Notion"
hasDocs: true
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
