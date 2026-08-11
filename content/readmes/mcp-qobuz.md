---
title: "mcp-qobuz"
description: "🎵 MCP server for Qobuz — search, browse, and explore your music library via AI"
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

### Auth — local macOS (Keychain)

Credentials are read automatically from the macOS Keychain using the same `"qobuz"/"default"` entry written by `qobuz-cli`. Log in once with `qobuz login` and this server picks them up — no extra configuration needed.

### Auth — headless / remote (env vars)

For CI, remote MCP hosts, or any non-Mac environment, pass credentials via the `env` block in `.mcp.json`:

```json
{
  "mcpServers": {
    "mcp-qobuz": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-qobuz"],
      "env": {
        "QOBUZ_TOKEN": "your-token",
        "QOBUZ_APP_ID": "your-app-id"
      }
    }
  }
}
```

Env vars take precedence over the Keychain when both are present.

> **Note:** the `now-playing` tool is macOS-only — it reads the player state file written by the Qobuz desktop app. It will return an error on any other platform.

### Tools

| Tool                          | Description                                                |
| ----------------------------- | ---------------------------------------------------------- |
| `search`                      | Search Qobuz for albums, artists, and/or tracks            |
| `get-track`                   | Fetch full track details by ID                             |
| `get-album`                   | Fetch full album details by ID                             |
| `get-artist`                  | Fetch artist biography and discography by ID               |
| `get-playlist`                | Fetch a playlist and its tracks by ID                      |
| `list-playlists`              | List your Qobuz playlists                                  |
| `list-favourites`             | List your favourited tracks, albums, or artists            |
| `now-playing`                 | Show what the Qobuz desktop app is playing (macOS only)    |
| `create-playlist`             | Create a new playlist — requires `confirm: true`           |
| `add-to-playlist`             | Add tracks to a playlist — requires `confirm: true`        |
| `update-playlist-description` | Update a playlist's description — requires `confirm: true` |

## Development

```sh
git clone https://github.com/kud/mcp-qobuz.git
cd mcp-qobuz
npm install
npm run dev
```

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Run the server with `tsx` (no build step)     |
| `npm run build`       | Compile TypeScript to `dist/`                 |
| `npm test`            | Run the Vitest test suite                     |
| `npm run inspect:dev` | Open the MCP Inspector against the dev server |

📚 **Full documentation → [mcp-qobuz/docs](https://kud.io/projects/mcp-qobuz/docs)**
## Disclaimer

This is an independent, unofficial project — not affiliated with, endorsed by, or sponsored by Qobuz. "Qobuz", the Qobuz logo, and any icons derived from it are trademarks of Qobuz Music, used here only to indicate compatibility.
