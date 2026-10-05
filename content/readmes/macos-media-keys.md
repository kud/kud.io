---
title: "macos-media-keys"
description: "Send macOS system media keys (play/pause, next, previous, fast-forward, rewind) from Node"
hasDocs: false
---

## Features

- **System-level events** — posts the exact same `NX_KEYTYPE_*` CGEvents that physical keyboard media keys emit, so any app already responding to those keys reacts immediately.
- **App-agnostic** — controls whichever app currently holds media focus: Music, Spotify, Qobuz, or anything else, with no app-specific integration required.
- **Zero npm dependencies** — ships a small Swift source file; the binary is compiled lazily on first call with `swiftc` and cached, keeping the package footprint minimal.
- **No prebuilt binaries** — source compilation on first use means no architecture-specific blobs to maintain and no native module binding steps.
- **Single, clear API** — one async function, five key names, one Promise return; nothing to configure.
- **macOS only, deliberately** — the `"os": ["darwin"]` guard in `package.json` prevents accidental installation on unsupported platforms.

## Install

```sh
npm install @kud/macos-media-keys
```

Requires macOS and Node.js ≥ 20.

## Usage

```ts
import { sendMediaKey } from "@kud/macos-media-keys"

await sendMediaKey("play") // play/pause toggle
await sendMediaKey("next")
await sendMediaKey("previous")
await sendMediaKey("forward") // fast-forward within the track
await sendMediaKey("rewind")
```

### Accessibility permission

Posting media keys requires the **calling process** to have Accessibility access. Grant it in System Settings → Privacy & Security → Accessibility. If permission is absent, `sendMediaKey` rejects with a message pointing you to that setting.

## Development

```sh
git clone https://github.com/kud/macos-media-keys.git
cd macos-media-keys
npm install
npm run dev
```

| Script              | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run build`     | Compile TypeScript with tsup |
| `npm run dev`       | Watch mode                   |
| `npm run typecheck` | Type-check without emitting  |
| `npm test`          | Run vitest suite             |
