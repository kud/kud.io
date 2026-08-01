---
title: "duux-cli"
description: "Control your Duux Whisper Flex 2 smart fan from the CLI"
---

## Features

- **Interactive TUI** — arrow-key control panel for power, speed, mode, horizontal/vertical oscillation, night mode, and timer, with live status
- **Passwordless sign-in** — one-time email code; tokens are stored in the macOS Keychain, never on disk
- **Multi-fan aware** — discover fans from the Duux cloud, list them, and switch the active one
- **Scriptable status** — `duux status` prints a one-shot state readout and sets a non-zero exit code when the fan is unreachable
- **Raw command passthrough** — `duux debug "tune set horosc 3"` sends an arbitrary command and prints the fan's response, for probing undocumented parameters
- **Scriptable** — `duux preset sleep` applies a named combination, `duux status --json` pipes state anywhere, and `duux watch` streams changes as they happen
- **Optional local control** — `duux broker setup` runs the fan through a broker on your own network instead of the cloud, for control that works offline
- **Accessible by default** — every state is a glyph plus a word (● on / ○ off); colour only ever reinforces, it never carries meaning alone

Built on [`@kud/duux`](https://github.com/kud/duux), which owns auth, discovery, and the cloud/MQTT transports — this CLI is the terminal surface over it.

## Install

```sh
npm install -g @kud/duux-cli
```

## Usage

```console
$ duux
# launches the interactive TUI — prompts to sign in / discover on first run

$ duux auth
# passwordless email-code sign-in (alias: login)

$ duux discover --select
# fetch fans from the Duux cloud, save them, and pick the active one

$ duux devices
# list known fans

$ duux switch
# switch the active fan

$ duux status
  Fan            Whisper
  Connection     reachable ●
  Power          on
  Speed          15/30
  Mode           natural
  H-oscillation  30°
  V-oscillation  45°
  Night mode     off
  Child lock     off
  Timer          off

$ duux status --json
# same state as one line of JSON, for scripting

$ duux preset sleep
# apply a named combination; `duux preset` lists them

$ duux watch
# stream state changes as they happen

$ duux doctor
# check the whole setup and name the next thing to fix

$ duux debug "tune set horosc 3"
# send a raw command and print the resulting state
```

TUI keys: `↑↓` select · `←→` adjust · `⇧←→` adjust by a larger step · `↵`/`space` toggle or cycle · `o` preferences · `q` quit

## Development

```sh
git clone https://github.com/kud/duux-cli.git
cd duux-cli
npm install
npm run dev
```

| Script              | Description                            |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Run the CLI with `tsx`, no build step  |
| `npm run build`     | Bundle to `dist/` with `tsup`          |
| `npm run typecheck` | Type-check with `tsc --noEmit`         |
| `npm run link`      | Build and `npm link` for local testing |
