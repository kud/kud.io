---
title: "cli-shot"
description: "Automatic screenshots of interactive CLIs — pty capture, terminal emulation, PNG out"
---

Point it at a CLI. It asks which screens the CLI has, opens each one, and writes
an image per screen. No per-project script, no keystroke tables, no hand-cropped
window captures that go stale the next time the UI moves.

## Features

- **Screens discovered, not hardcoded** — asks the CLI via `--screen list`, so a tab you add shows up in the next run without touching this package
- **Real terminal emulation** — the pty stream is resolved to the grid a user would see, rather than every redraw concatenated
- **Fixtures by default** — `--mock` is on unless you opt out, because a screenshot outlives the moment it was taken
- **Deterministic and headless** — fixed size, fixed data, no window manager, runnable in CI
- **Scriptable last mile** — `--keys` reaches state a screen name can't address

## Install

```sh
npm install --global @kud/cli-shot
brew install charmbracelet/tap/freeze   # the renderer
```

## Usage

```sh
cli-shot --out assets/screenshots -- pcloud
```

Everything after `--` is the command being driven. That separation matters: it
lets the driven CLI have its own `--mock` or `--screen` without colliding with
cli-shot's flags.

```sh
cli-shot --out shots --screen sync -- pcloud      # one screen
cli-shot --out shots --list -- pcloud             # what screens exist
cli-shot --out shots --keys $'jjj\r' -- pcloud    # drive deeper first
cli-shot --out shots --no-mock -- pcloud          # real data (careful)
```

| flag                  |                                                       |
| --------------------- | ----------------------------------------------------- |
| `-o, --out <dir>`     | directory to write PNGs into                          |
| `-s, --screen <name>` | shoot one screen instead of every screen              |
| `--list`              | print the screens the command offers, and stop        |
| `--cols` / `--rows`   | terminal size (default 110×32)                        |
| `--settle <ms>`       | how long the screen must hold still (default 350)     |
| `--jobs <n>`          | screens shot at once; defaults to the core count      |
| `--keys <sequence>`   | keystrokes sent once the screen has drawn             |
| `--font <family>`     | font to render with; defaults to a Nerd Font          |
| `--no-mock`           | drive real data instead of fixtures                   |

## The contract

A CLI is shootable when it implements three things:

|                   |                                                        |
| ----------------- | ------------------------------------------------------ |
| `--mock`          | swap **every** data source to fixtures, all or nothing |
| `--screen <name>` | open directly on that screen                           |
| `--screen list`   | print the screen names, one per line                   |

`--screen list` is what keeps this package generic: cli-shot asks rather than
knowing. Add a tab to your app and it appears in the next run's output without
this package being touched — and a tab nobody ever captured stops being
invisible.

Mock data is the default, deliberately. A folder listing says more about someone
than they usually intend, and a screenshot outlives the moment it was taken.

## How it works

```
node-pty  →  @xterm/headless  →  serialize  →  freeze  →  png
```

The middle step is the one that isn't obvious. A pty hands back **every redraw
in order**, not a picture of the screen — write that straight out and you render
the whole animation concatenated, with the alternate-screen escape on top. So
the stream is fed through a real terminal emulator, which resolves cursor moves,
clears and repaints into the grid a user would actually be looking at. Only that
grid is serialised.

## Limits

**Terminal graphics protocols don't survive.** Inline images (iTerm2, sixel) are
escape sequences carrying base64 payloads; no ANSI renderer can rasterise them.
A CLI drawing thumbnails needs a real terminal and a window capture for those
screens.

**Compound state needs `--keys`.** `--screen` addresses which screen; scroll
position, an open dialog or a filtered view are beyond what a name can carry.

## Related

- [@kud/cli-testing](https://github.com/kud/cli-testing) — the test-side sibling.
  Same app contract, no dependency between them.

## Licence

MIT © Erwann Mest
