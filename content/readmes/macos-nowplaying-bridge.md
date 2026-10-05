---
title: "macos-nowplaying-bridge"
description: "Publish Now Playing metadata to macOS Control Center and receive its media-button events, from Node"
hasDocs: false
---

## Features

- **Control Center ownership** — claims the Now Playing slot via a silent audio session, so your app's track info appears in Control Center regardless of what other apps are doing.
- **Media-button events** — play, pause, toggle, next, and previous button presses from Control Center (or media keys) are forwarded back to Node as typed events.
- **Rich metadata** — push title, artist, album, artwork URL, duration, elapsed time, playback rate, and play/pause state; Control Center reflects changes immediately.
- **Zero npm dependencies** — ships a Swift source file compiled lazily on first call with `swiftc` and wrapped in a minimal `.app` bundle (required by macOS for Now Playing access).
- **No prebuilt binaries** — on-demand compilation means no architecture-specific blobs and no native binding steps; the binary is cached in `$TMPDIR` for subsequent runs.
- **macOS only, deliberately** — the `"os": ["darwin"]` guard in `package.json` prevents accidental installation on unsupported platforms.

## Install

```sh
npm install @kud/macos-nowplaying-bridge
```

Requires macOS and Node.js ≥ 20. `swiftc` must be available (ships with Xcode Command Line Tools).

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

### API

#### `createNowPlayingBridge(): Promise<NowPlayingBridge>`

Compiles and spawns the Swift co-process on first call (subsequent calls reuse the cached binary). Throws on non-macOS platforms.

#### `bridge.update(info: NowPlayingInfo): void`

Pushes a metadata update. All fields except `title` are optional.

| Field        | Type                    | Description                          |
| ------------ | ----------------------- | ------------------------------------ |
| `title`      | `string`                | Track title (required)               |
| `artist`     | `string`                | Artist name                          |
| `album`      | `string`                | Album name                           |
| `artworkUrl` | `string`                | Remote or `file://` artwork URL      |
| `duration`   | `number`                | Total track length in seconds        |
| `elapsed`    | `number`                | Current playback position in seconds |
| `rate`       | `number`                | Playback rate (`1.0` = normal speed) |
| `state`      | `"playing" \| "paused"` | Playback state                       |

#### `bridge.on(event: RemoteEvent, handler: () => void): void`

Registers a handler for a media-button event. Multiple handlers per event are supported.

`RemoteEvent` values: `"play"` · `"pause"` · `"toggle"` · `"next"` · `"previous"`

#### `bridge.stop(): void`

Kills the Swift co-process and releases the Now Playing slot.

## Development

```sh
git clone https://github.com/kud/macos-nowplaying-bridge.git
cd macos-nowplaying-bridge
npm install
npm run dev
```

| Script              | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run build`     | Compile TypeScript with tsup |
| `npm run dev`       | Watch mode                   |
| `npm run typecheck` | Type-check without emitting  |
| `npm test`          | Run vitest suite             |
