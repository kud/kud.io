---
title: "androidtv-remote"
description: "Control Android TV / Google TV devices over the Android TV Remote v2 protocol (TypeScript)"
hasDocs: true
---

A modern TypeScript/ESM implementation of the Android TV Remote v2 protocol — pair with a device over TLS, then send keys, launch apps, and inject text directly from Node.

## 🌟 Features

- 🔑 **First-class pairing** — handles the full certificate-based TLS pairing flow and persists credentials for reconnect
- ⌨️ **Native text input** — `sendText()` uses IME injection to type arbitrary strings, no keycode mapping required
- 📺 **Full key control** — send any Android key via `RemoteKeyCode` constants (navigation, media, DPAD, volume, and more)
- 📡 **State events** — subscribe to `powered`, `volume`, `current_app`, and `unpaired` with typed payloads
- 🪶 **Lean dependencies** — `crypto-js`, `systeminformation`, and `core-js` dropped; relies only on `node-forge` and `protobufjs`
- 🔇 **Silent by default** — all internal logging is suppressed unless `debug: true` is set, so it fits cleanly inside a larger application
- 🏷️ **Typed API** — full TypeScript types exported; `on()`, `once()`, and `emit()` are all narrowed to the event map

## 🚀 Quick Start

```sh
npm install @kud/androidtv-remote
```

### Pair a new device

```js
import { createAndroidRemote } from "@kud/androidtv-remote"

const remote = createAndroidRemote("192.168.1.42")

remote.on("secret", () => {
  // The TV shows a pairing PIN — read it from stdin and submit
  remote.sendCode("123456")
})

remote.on("ready", () => {
  console.log("paired and connected")
  remote.sendPower()
})

await remote.start()

// Persist the certificate so you skip pairing next time
const cert = remote.getCertificate()
```

### Reconnect with a saved certificate

```js
import { createAndroidRemote } from "@kud/androidtv-remote"

const remote = createAndroidRemote("192.168.1.42", {
  cert: { key: savedKey, cert: savedCert },
})

remote.on("ready", () => {
  remote.sendText("Hello, TV!")
})

await remote.start()
```
