---
title: "cli-shot"
description: "Automatic screenshots of interactive CLIs — pty capture, terminal emulation, PNG out"
hasDocs: true
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

Everything after `--` is the command being driven, so its own flags stay clear
of cli-shot's.

cli-shot adds `--mock` and `--screen` to that command, but only where you
haven't. Anything you pass wins:

```sh
cli-shot --out shots -- pcloud --screen sync    # shoots Sync, writes sync.png
cli-shot --out shots --only sync -- pcloud      # the same thing, said from here
```

Naming a screen yourself is already an answer to "which one", so cli-shot skips
the discovery loop and takes the filename from your value.

```sh
cli-shot --out shots --only sync -- pcloud        # one screen
cli-shot --out shots --list -- pcloud             # what screens exist
cli-shot --out shots --keys $'jjj\r' -- pcloud    # drive deeper first
cli-shot --out shots --no-mock -- pcloud          # real data (careful)
```

| flag                |                                                   |
| ------------------- | ------------------------------------------------- |
| `-o, --out <dir>`   | directory to write PNGs into                      |
| `--only <screen>`   | shoot one screen instead of every screen          |
| `--list`            | print the screens the command offers, and stop    |
| `--cols` / `--rows` | terminal size (default 110×32)                    |
| `--settle <ms>`     | how long the screen must hold still (default 350) |
| `--jobs <n>`        | screens shot at once; defaults to the core count  |
| `--keys <sequence>` | keystrokes sent once the screen has drawn         |
| `--font <family>`   | font to render with; defaults to a Nerd Font      |
| `--no-mock`         | drive real data instead of fixtures               |
