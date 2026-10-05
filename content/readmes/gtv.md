---
title: "gtv"
description: "Google TV control library — device store, discovery, pairing, and a stateful remote session"
hasDocs: true
---

The framework-agnostic core of the Google TV stack — discovery, pairing, a stateful session, and a shared device store that every client (CLI, MCP, app) builds on.

## 🌟 Features

- 🔍 **mDNS Discovery** — finds every Google TV on the local network via `dns-sd`; returns pure data, no side effects
- 🔐 **Dependency-injected Pairing** — `onSecret` is a callback you supply (terminal `readline`, MCP round-trip, Tauri dialog…); the library never touches I/O itself
- 📡 **Stateful Session** — `createSession()` returns an `EventEmitter` that reduces the underlying protocol stream to a single observable `SessionState`; subscribe with `.on("change", state => …)`
- ⚡ **One-shot Helpers** — `sendKey`, `launchApp`, `connect`, `withRemote` for scripts that don't need a long-lived connection
- 📱 **App Catalog** — curated `APPS` list with `findApp`, `listApps`, and `appLink` (builds the reliable `market://launch?id=<package>` URI)
- 🗄️ **Shared Config Store** — reads and writes `~/.config/gtv/config.json`; all consumers (`gtv-cli`, `mcp-gtv`, `gtv-app`) share one device registry
- 🔑 **Full Keycode Surface** — `KEYS`, `KEY_LABELS`, and re-exported `RemoteKeyCode` / `RemoteDirection` so consumers need only depend on `@kud/gtv`

## 🚀 Quick Start

```sh
npm install @kud/gtv
```

### Discover and pair

```ts
import { discover, pair } from "@kud/gtv"

const [tv] = await discover()

await pair({
  host: tv.host,
  hostname: tv.hostname,
  port: tv.port,
  name: tv.name,
  onSecret: async () => promptUserForPin(), // PIN displayed on the TV screen
})
```

### Drive a stateful session

```ts
import { createSession, KEYS } from "@kud/gtv"

const session = createSession() // uses the currently configured device
session.on("change", (state) => console.log(state))

session.sendKey(KEYS.home)
session.typeText("interstellar")
session.launchApp("market://launch?id=com.netflix.ninja")
session.stop()
```

### One-shot commands

```ts
import { sendKey, launchApp, findApp, appLink, KEYS } from "@kud/gtv"

await sendKey(KEYS.mute)

const netflix = findApp("netflix")
if (netflix) await launchApp(appLink(netflix))
```
