---
title: "mcp-gtv"
description: "MCP server for Google TV — control paired devices (keys, text, app launch) via @kud/gtv"
hasDocs: true
---

> **Proof of concept — experimental and unfinished.**
> This package is not yet published to npm. The API, tool names, and behaviour may change or break at any time. Run it from source (see [Development](#-development)). Do not use in production.

`@kud/mcp-gtv` exposes Google TV control to any MCP client, letting an assistant open apps, control playback, type into search fields, and read back what's currently on the TV.

## 🌟 Features

- 🔌 **Zero credentials** — reads paired devices from `~/.config/gtv/config.json`; no API key, no token, no extra setup
- 📺 **Device switching** — list all paired TVs and switch the active target at any time during a session
- 🎮 **Full remote control** — send any key from navigation and media to volume, power, and input
- ⌨️ **IME text input** — type arbitrary text into the focused field directly, without keycode mapping
- 🚀 **App launcher** — launch Netflix, YouTube, Prime Video, Spotify, and more by name, or pass any raw deep-link URI
- 📡 **State feedback** — every control tool returns the TV's resulting state (power, volume, foreground app) so the model can confirm its action landed
- 🤖 **Broad MCP client support** — stdio transport works with Claude Desktop, Claude Code, Cursor, and any MCP-compatible client

![A laptop on the sofa reads "Open YouTube on the TV", and the TV across the room opens YouTube](https://raw.githubusercontent.com/kud/mcp-gtv/HEAD/assets/living-room.jpg)

## 🚀 Quick Start

### 1. Pair your TV first

Pairing is handled by `@kud/gtv-cli`, not this server. If you have not paired a device yet:

```sh
npx @kud/gtv-cli pair
```

Follow the PIN prompt on the TV. The paired device is written to `~/.config/gtv/config.json` — the shared config store that `mcp-gtv` reads automatically. You only need to do this once per device.

### 2. Run the server from source

The package is not yet on npm. Clone the repo and run with `tsx`:

```sh
git clone https://github.com/kud/mcp-gtv.git
cd mcp-gtv
npm install
npm run dev
```

### 3. Ask naturally

Once an MCP client has the server connected:

> "What's playing on the TV right now?"
> "Open Netflix"
> "Turn up the volume"
> "Go back to the home screen"
> "Type 'Blade Runner' into the search field"

### What it's good at

This server works well for discrete, confirmable actions: opening apps, controlling playback, adjusting volume, typing into search, and checking what's currently on screen. It is **not** suited to navigating menus or lists inside an app — see [Known Limitations](#-known-limitations).
