---
title: "qobuz-cli"
description: "Command-line interface for Qobuz — search, library, and quick-open in the app"
hasDocs: true
---

## Features

- **Interactive TUI** — full-screen terminal UI (Ink/React): type to search, arrow-key navigate, drill into detail, act. Launched with bare `qobuz` or `qobuz tui`. Works on macOS and Linux.
- **Fast search & metadata** — search albums, tracks, and artists; inspect album, artist, and track details.
- **Library & playlists** — list, add, and remove favourites; list, show, create, and edit playlists.
- **Collection stats** — `qobuz stats` shows your genre mix, hi-res ratio, and top artists/labels from the local desktop library.
- **Media-key playback control** — `play`, `next`, `previous`, `forward`, and `rewind` drive the Qobuz desktop app via real media keys (macOS, requires Accessibility permission).
- **Quick open & copy** — `open` deep-links straight into the Qobuz app; `url` (alias `copy-url`) copies a link to the clipboard — bare `qobuz url` copies the **currently-playing** track.
- **Secure login** — stores a browser-borrowed token in the macOS Keychain; no password handling.

## Install

```sh
npm install -g @kud/qobuz-cli
```

## Usage

```console
$ qobuz                            # open interactive TUI
$ qobuz tui                        # same — explicit subcommand
$ qobuz login                      # connect (opens browser, paste app_id + token)
$ qobuz search "radiohead"
$ qobuz album 0634904032432
$ qobuz fav list
$ qobuz playlist create "Focus"
$ qobuz stats                      # collection analytics from the desktop library
$ qobuz play                       # toggle play/pause in Qobuz
$ qobuz next                       # skip track (also: previous, forward, rewind)
$ qobuz open album 0634904032432   # open in the Qobuz app
$ qobuz url                        # copy the currently-playing track's link
$ qobuz url album 0634904032432    # copy a specific item's deep link
$ qobuz url --plain                # print the bare URL (no clipboard) for scripting
$ qobuz convert <track-url>        # convert a Qobuz track URL to streaming links
$ qobuz now-playing                # show the currently-playing track (alias: np)
```

Full command set: `tui`, `login`, `logout`, `search`, `album`, `artist`, `track`, `similar`, `fav` (list/add/remove), `playlist` (list/show/create/add/remove), `convert`, `now-playing` / `np`, `stats`, `url` / `copy-url`, `open`, `play`, `next`, `previous` / `prev`, `forward` / `ff`, `rewind` / `rew`.

> **macOS note** — playback commands (`play`, `next`, `previous`, `forward`, `rewind`) and TUI playback keys (`space`, `n`, `p`) use real media keys and require Accessibility permission granted to your terminal. The first playback command compiles a small Swift helper via `swiftc`.

## Disclaimer

This is an independent, unofficial project — not affiliated with, endorsed by, or sponsored by Qobuz. "Qobuz", the Qobuz logo, and any icons derived from it are trademarks of Qobuz Music, used here only to indicate compatibility.
