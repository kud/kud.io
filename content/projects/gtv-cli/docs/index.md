---
title: "gtv-cli"
description: "Control your Google TV from the CLI via the Android TV Remote protocol"
---

## Features

- **Fullscreen TUI remote** — pair on first run; subsequent launches open an interactive Ink remote directly, no extra steps
- **Keyboard typing** — press `Tab` to enter keyboard mode and type directly into TV text fields (e.g. YouTube search) via IME text injection; text input the Android TV Remote protocol would otherwise leave inaccessible
- **Multiple TVs** — pair as many devices as you like and switch between them with `gtv switch` or browse them with `gtv devices`
- **Responsive layout** — the two-column remote adapts automatically to your terminal width
- **Icon styles** — choose between text, Nerd Font, or emoji icons via an in-app Preferences modal (press `o`)
- **One-shot commands** — send individual key presses, media controls, or deep-link app launches straight from the shell without opening the TUI
- **Network discovery** — find Google TV devices on the local network via mDNS; check device health with `gtv status` or `gtv doctor`

## Install

```sh
npm install -g @kud/gtv-cli
```

Requires Node.js ≥ 22.

## Usage

```console
$ gtv                   # open the remote (pairs on first run)
$ gtv pair / unpair
$ gtv discover --select
$ gtv switch [name]
$ gtv devices
$ gtv status / doctor
$ gtv home / back / up / down / left / right / select
$ gtv vol up|down|mute
$ gtv key <name>
$ gtv app https://www.netflix.com/
```

Inside the TUI: arrow keys and Enter navigate the remote buttons; `Tab` switches to keyboard mode for text input; `o` opens the Preferences modal (icon style, active device); `q` quits.

## Development

```sh
git clone https://github.com/kud/gtv-cli.git
cd gtv-cli
npm install
npm run dev          # run from source with tsx
npm run typecheck    # type-check without emitting
npm run build        # compile to dist/ via tsup
```
