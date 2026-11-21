---
title: "macos-media-keys"
description: "Send macOS system media keys (play/pause, next, previous, fast-forward, rewind) from Node"
hasDocs: true
---

## Features

- **System-level events** — posts the exact same `NX_KEYTYPE_*` CGEvents that physical keyboard media keys emit, so any app already responding to those keys reacts immediately.
- **App-agnostic** — controls whichever app currently holds media focus: Music, Spotify, Qobuz, or anything else, with no app-specific integration required.
- **Zero npm dependencies** — ships a small Swift source file; the helper binary is compiled lazily on first call with `swiftc` and cached, keeping the package footprint minimal.
- **No prebuilt binaries** — source compilation on first use means no architecture-specific blobs to maintain and no native module binding steps; the only build tool needed is `swiftc`, from Xcode or the Command Line Tools.
- **Single, clear API** — one async function, five key names, one Promise return; nothing to configure.
- **macOS only, deliberately** — the `"os": ["darwin"]` guard in `package.json` prevents accidental installation on unsupported platforms.

## Install

```sh
npm install @kud/macos-media-keys
```

Requires macOS, Node.js ≥ 20 and `swiftc` on the `PATH`. `swiftc` ships with Xcode or the Xcode Command Line Tools; if neither is installed:

```sh
xcode-select --install
```

The package is ESM only.

### How the helper is built

The package ships `native/media-key.swift` as source. The first call to `sendMediaKey` compiles it with `swiftc -O` into the system temporary directory (`<os.tmpdir()>/macos-media-keys/`), under a name keyed on a hash of the Swift source, and later calls reuse that binary. An upgrade that changes the source therefore rebuilds the helper once on its first call. If the temporary directory is cleared, the next call rebuilds it. If `swiftc` is missing, the first call rejects with the compiler's error.

## Usage

```ts
import { sendMediaKey } from "@kud/macos-media-keys"

await sendMediaKey("play") // play/pause toggle
await sendMediaKey("next")
await sendMediaKey("previous")
await sendMediaKey("forward") // fast-forward within the track
await sendMediaKey("rewind")
```
