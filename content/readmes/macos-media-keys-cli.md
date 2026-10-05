---
title: "macos-media-keys-cli"
description: "CLI to send macOS system media keys — play/pause, next, previous, fast-forward, rewind"
hasDocs: false
---

## Features

- **System-level media keys** — sends real macOS media key events, not app-specific API calls.
- **App-agnostic** — targets whichever app is currently responding to media keys: Music, Qobuz, Spotify, and others.
- **Five commands** — `play`, `next`, `previous`, `forward`, and `rewind` cover the full range of playback control.
- **Zero config** — no setup beyond granting Accessibility permission once; install and run.
- **Thin surface** — a minimal CLI wrapper over [`@kud/macos-media-keys`](https://www.npmjs.com/package/@kud/macos-media-keys), keeping each layer focused.

## Install

```sh
npm install -g @kud/macos-media-keys-cli
```

macOS only. Node.js 20 or later required.

> **Accessibility permission** — your terminal must have Accessibility access (System Settings → Privacy & Security → Accessibility). If it is not granted, the command exits with a clear message instructing you to enable it.

## Usage

```console
$ media-keys play       # play/pause toggle
$ media-keys next
$ media-keys previous
$ media-keys forward    # fast-forward within the track
$ media-keys rewind
```

## Development

```sh
git clone https://github.com/kud/macos-media-keys-cli.git
cd macos-media-keys-cli
npm install
npm run dev
```

| Script              | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run build`     | Compile TypeScript to `dist/` via tsup  |
| `npm run dev`       | Run from source via tsx (no build step) |
| `npm run typecheck` | Type-check without emitting             |
