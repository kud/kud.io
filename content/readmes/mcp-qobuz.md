---
title: "mcp-qobuz"
description: "🎵 MCP server for Qobuz — search, browse, and explore your music library via AI"
hasDocs: true
---

## Features

- **AI-native Qobuz access** — exposes Qobuz to any MCP client (Claude Desktop, Claude Code) as tools.
- **Search & lookup** — search albums, artists, and tracks; fetch full details for any track, album, artist, or playlist by ID.
- **Browse your library** — list your favourited tracks, albums, and artists, and all your playlists.
- **Now playing** — read the current track from the Qobuz desktop app (macOS only — the server must run on the same Mac).
- **Flexible auth** — Keychain locally, or `QOBUZ_TOKEN` / `QOBUZ_APP_ID` env vars for headless and remote MCP hosts.
- **Guarded writes** — create playlists, add tracks, and update descriptions, gated behind an explicit `confirm` flag.

## Install

```sh
npm install -g @kud/mcp-qobuz
```

## Usage

Add the server to your `.mcp.json`:

```json
{
  "mcpServers": {
    "mcp-qobuz": { "command": "npx", "args": ["-y", "@kud/mcp-qobuz"] }
  }
}
```

## Disclaimer

This is an independent, unofficial project — not affiliated with, endorsed by, or sponsored by Qobuz. "Qobuz", the Qobuz logo, and any icons derived from it are trademarks of Qobuz Music, used here only to indicate compatibility.
