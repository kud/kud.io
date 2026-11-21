---
title: "macos-nowplaying-bridge"
description: "Publish Now Playing metadata to macOS Control Center and receive its media-button events, from Node"
hasDocs: true
---

## Features

- **Control Center ownership** — claims the Now Playing slot by playing a silent, looping audio buffer, so your track info appears in Control Center even though the Node process itself plays nothing.
- **Media-button events** — play, pause, toggle, next, and previous button presses from Control Center (or media keys) are forwarded back to Node as typed events.
- **Rich metadata** — push title, artist, album, artwork URL, duration, elapsed time, playback rate, and play/pause state; updates merge, so fields you omit keep their last value, and artwork appears once its download finishes.
- **Zero runtime npm dependencies** — ships a Swift source file compiled lazily on first call with `swiftc` and wrapped in a minimal `.app` bundle (macOS only lists a process in Now Playing when it lives in a bundle with a bundle identifier).
- **No prebuilt binaries** — on-demand compilation means no architecture-specific blobs and no native binding steps; the compiled helper is cached under `$TMPDIR/macos-nowplaying-bridge/`, keyed by a hash of the Swift source, so an upgrade rebuilds it once and later runs start immediately.
- **macOS only, deliberately** — the `"os": ["darwin"]` field in `package.json` stops npm installing it elsewhere, and `createNowPlayingBridge()` rejects on any other platform.

## Install

```sh
npm install @kud/macos-nowplaying-bridge
```

Requires macOS and Node.js ≥ 20, plus `swiftc` on your `PATH`. It ships with the Xcode Command Line Tools (`xcode-select --install`). The helper is compiled on the first call, which therefore takes a few seconds; if `swiftc` is missing, that call rejects with the compiler error.

## Usage

```ts
import { createNowPlayingBridge } from "@kud/macos-nowplaying-bridge"

const bridge = await createNowPlayingBridge()

// Push track metadata to Control Center
bridge.update({
  title: "Intro",
  artist: "The xx",
  album: "xx",
  duration: 126,
  elapsed: 30,
  state: "playing",
})

// React to Control Center / media-key events
bridge.on("next", () => playNextTrack())
bridge.on("previous", () => playPreviousTrack())
bridge.on("toggle", () => togglePlayback())

// Tear down the co-process when done
bridge.stop()
```
