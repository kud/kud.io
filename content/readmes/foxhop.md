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

- **Permanent** — install from [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/foxhop/) — the signed, auto-updating listing.
- **Temporary (development)** — open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `webextension/manifest.json` from this repo.

## Usage

Targets live in `~/.config/foxhop/tabs.json`. Add one with `foxhop add` or by editing the file directly.

```console
$ foxhop focus chatgpt          # focus a saved target (foregrounds Firefox)
$ foxhop list                   # list saved targets   (--json for machine output)
$ foxhop tabs                   # list currently open Firefox tabs   (--json)
$ foxhop add https://mail.google.com --title Gmail   # id: gmail (slug of the title)
$ foxhop edit gmail --url https://mail.google.com/mail/u/1   # change fields, never the id
$ foxhop remove gmail
$ foxhop sync                   # generate per-tab Raycast hotkey scripts
```

Set `FOXHOP_BROWSER` to override the default Firefox Nightly (e.g. `FOXHOP_BROWSER=Firefox`).

Target ids are the kebab-case slug of the title (`Notion Calendar` becomes `notion-calendar`), fixed when the target is created and never renamed. A taken id gets a `-2`, `-3` suffix instead of overwriting another target. Older configs migrate once on load (`bsky` titled Bluesky becomes `bluesky`); old names are not kept as aliases, so update saved `foxhop focus <name>` calls after upgrading. `foxhop edit <id>` changes any field but the id. Any change from the CLI, the popup or Raycast regenerates the Raycast scripts, and the popup shows each id with its script name. It also remembers favicons, so targets keep their icon when no tab is open.

## Development

```sh
# CLI
cd cli && npm run dev        # run from source via tsx
cd cli && npm test           # vitest suite

# Extension
cd webextension && npm run dev  # launch Firefox Nightly with the extension loaded
cd webextension && npm run lint # web-ext lint
```
