---
title: "webext-gmeet-unmirror"
description: "Hides the Google Meet presentation tile so full-screen sharing doesn't produce an infinite hall of mirrors."
---

## Features

- **Hall-of-mirrors fix** — when you share your whole screen on a Meet call, the presentation tile is hidden so it stops feeding back into itself
- **One-click toggle** — a floating button on the Meet page hides or reveals the presentation tile on demand
- **`Alt+Shift+H` shortcut** — toggle without reaching for the mouse; it stays inert while typing in chat or any input field
- **Auto-hide on share** — detects when a shared screen is dominating the call and hides the tile itself, no click needed
- **Manual override wins** — bring the tile back and it stays visible for the rest of that presentation, even with auto-hide on
- **Nothing else touched** — the participant grid and your own self-view thumbnail are never hidden, only the mirrored copy of your own screen

## Install

Two ways in — pick whichever suits you:

### From Firefox Add-ons (remote)

**[gmeet-unmirror on addons.mozilla.org](https://addons.mozilla.org/firefox/addon/gmeet-unmirror/)** — one click, and Firefox keeps it updated. _(The listing goes live once the add-on clears AMO review.)_

### From source (local)

Build it from this repo and load it into Firefox yourself:

```sh
git clone https://github.com/kud/webext-gmeet-unmirror.git
cd webext-gmeet-unmirror
npm install
npm run build   # → web-ext-artifacts/gmeet-unmirror-<version>.zip
```

Then open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `manifest.json` (or the built zip). Firefox removes temporary add-ons on restart, so this is the quick local route; for a permanent unsigned install you'd need Firefox Developer Edition or Nightly with signature enforcement off.

## Usage

Once installed, open any Google Meet call and share your whole screen as usual:

1. A **Hide presentation** button appears bottom-right on the page — click it, or press **Alt+Shift+H**, to hide the presentation tile and replace it with a small placeholder.
2. Press the shortcut (or click the button, now reading **Show presentation**) again to bring it back.
3. With auto-hide, gmeet-unmirror hides the tile itself as soon as a shared screen dominates the call — no click required. Overriding it manually keeps your choice in effect until the presentation ends.

The extension only ever touches the presentation tile: the participant grid and your self-view stay exactly as they are.

## Development

```sh
git clone https://github.com/kud/webext-gmeet-unmirror.git
cd webext-gmeet-unmirror
npm install
npm run dev
```

`npm run dev` runs `web-ext run --firefox=nightly`, which launches Firefox Nightly with the extension already loaded and reloads it on every save to `src/content.js`.

(For a one-off manual load without the dev server, see **[Install → From source](#from-source-local)** above.)

Other scripts:

```sh
npm run lint    # web-ext lint
npm run build   # bundle into web-ext-artifacts/
```

The extension has a single host permission, `*://meet.google.com/*`, no background worker, and makes no network requests of its own — everything runs in the content script injected into the Meet tab.
