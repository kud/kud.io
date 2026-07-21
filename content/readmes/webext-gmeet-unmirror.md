---
title: "webext-gmeet-unmirror"
description: "Hides the Google Meet presentation tile so full-screen sharing doesn't produce an infinite hall of mirrors."
---

## Features

- **Local-only hiding** — the tile is hidden with CSS `visibility: hidden` in your browser only; the outgoing screen-share stream is untouched, so remote viewers still see your full presentation
- **Only ever acts while you're presenting** — two cooperating, local-only signals confirm it: a MAIN-world hook on `getDisplayMedia` for the transition, and a DOM check for the local "Stop presentation" control as the source of truth. Someone else presenting can never trigger it
- **Robust tile detection** — the presentation is the largest visible `<video>`, resolved to its container via Meet's stable `data-tile-media-id` attribute (with a geometric ancestor-walk fallback); the self-view camera tile is explicitly excluded so your own face is never hidden
- **Popup control surface** — an "Automatic" toggle (persisted, default on) hides the tile the moment you present, plus a manual Show/Hide button and status line that's disabled whenever you're not presenting
- **`Alt+Shift+H` shortcut** — toggle manually without reaching for the popup
- **Collects no data** — a single host permission (`*://meet.google.com/*`), no background worker, no network requests

## Install

### From Firefox Add-ons (remote)

[Gmeet Unmirror on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/gmeet-unmirror/)

The listing goes live once the add-on clears AMO review — until then, install from source below.

### From source (local)

```sh
git clone https://github.com/kud/webext-gmeet-unmirror.git
cd webext-gmeet-unmirror
npm install
npm run build
```

Load it in Firefox: `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → select `manifest.json` (or the built package in `web-ext-artifacts/`). Temporary add-ons are dropped on restart and must be reloaded after every change.

## Usage

Open any Google Meet call at `meet.google.com` and share your whole screen as usual — the extension only ever activates while you are the one presenting:

1. With **Automatic** on (the default), the presentation tile hides itself the moment your share starts.
2. Prefer to control it yourself? Turn **Automatic** off in the toolbar popup and use the **Show/Hide** button there, or press **`Alt+Shift+H`**, whenever you want to toggle the tile.
3. The button and shortcut are disabled/inert whenever you're not presenting — there's nothing to toggle until you are.

Only the presentation tile is ever touched. The participant grid, your own self-view thumbnail, and Meet's controls are left exactly as they are, and remote viewers always see your full, unmodified screen share.

## Development

```sh
git clone https://github.com/kud/webext-gmeet-unmirror.git
cd webext-gmeet-unmirror
npm install
npm run dev
```

`npm run dev` runs `web-ext run --firefox=nightly`, launching Firefox Nightly with the extension already loaded and reloaded on every save.

Other scripts:

```sh
npm run lint    # web-ext lint
npm run build   # bundle into web-ext-artifacts/
```

Requires Firefox 142.0 or later (`strict_min_version`), since the content scripts rely on `world: "MAIN"`.

📚 **Full documentation → [webext-gmeet-unmirror/docs](https://kud.io/projects/webext-gmeet-unmirror/docs)**
</content>
