---
title: "foxhop"
description: "Focus a specific Firefox tab from anywhere on macOS — CLI, Raycast, and a Firefox extension."
---

## Ecosystem

foxhop isn't a single CLI — it's one product with three surfaces, all sharing the same targets in `~/.config/foxhop/tabs.json`:

- **CLI + native host** (`@kud/foxhop-cli`) — the engine: focuses tabs, manages targets, and bridges macOS to Firefox over native messaging.
- **Firefox extension** — the in-browser half of the bridge; it receives a request from the native host and switches to the matching tab.
- **Raycast extension** — a launcher-native way to search, add, edit, and focus targets, plus generated per-tab hotkeys via `foxhop sync`.

Reach for whichever surface fits the moment — a global hotkey, a Raycast command, or the terminal — they all drive the same configuration.

## Features

- **Global hotkey focus** — jump to a specific Firefox tab from a global hotkey, Raycast command, or the terminal without touching the mouse
- **Config-driven** — declare the tabs you care about in `~/.config/foxhop/tabs.json`; nothing is hardcoded and the file is editable by hand, by the CLI, or from Raycast
- **Smart matching** — match tabs by hostname, prefix, exact URL, or full search; choose the recent, first, or pinned tab when several match
- **Opens if missing** — focuses the existing tab when it is already open, or opens it at the configured URL when it is not
- **Two Raycast surfaces** — a manage-and-focus extension for searching, adding, and editing targets, plus generated per-tab hotkey scripts via `foxhop sync`

## Install

```sh
npm install -g @kud/foxhop-cli
foxhop install        # register the native messaging host with Firefox
```

Then install the Firefox extension:

- **Permanent** — download the signed [`foxhop-1.0.1.xpi`](https://github.com/kud/foxhop/releases/download/extension-v1.0.1/foxhop-1.0.1.xpi) and open it in Firefox (or drag it onto a Firefox window).
- **Temporary (development)** — open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `extension/manifest.json` from this repo.

## Usage

Targets live in `~/.config/foxhop/tabs.json`. Add one with `foxhop add` or by editing the file directly.

```console
$ foxhop focus chatgpt          # focus a saved target (foregrounds Firefox)
$ foxhop list                   # list saved targets   (--json for machine output)
$ foxhop tabs                   # list currently open Firefox tabs   (--json)
$ foxhop add gmail --match mail.google.com --url https://mail.google.com --title Gmail
$ foxhop remove gmail
$ foxhop sync                   # generate per-tab Raycast hotkey scripts
```

Set `FOXHOP_BROWSER` to override the default Firefox Nightly (e.g. `FOXHOP_BROWSER=Firefox`).

## Development

```sh
# CLI
cd cli && npm run dev        # run from source via tsx
cd cli && npm test           # vitest suite

# Extension
cd extension && npm run dev  # launch Firefox Nightly with the extension loaded
cd extension && npm run lint # web-ext lint
```
