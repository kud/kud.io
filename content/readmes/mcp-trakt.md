---
title: "mcp-trakt"
description: "🎬 Track TV & movies from Claude via Trakt — search, sync, rate, watchlist, check in & scrobble"
hasDocs: true
---

## Features

- **53 tools** — complete coverage of the Trakt API: search, metadata, sync, ratings, watchlists, and check-ins.
- **OAuth via macOS Keychain** — credentials stored securely; one-time setup with `npx @kud/mcp-trakt setup`.
- **Personalised calendars** — see your upcoming episodes and movies, or browse what's airing across all Trakt users.
- **Full sync support** — history, collection, watched state, playback progress, and last-activity timestamps.
- **Scrobble lifecycle** — start, pause, and stop playback tracking so watches are recorded automatically.
- **Recommendations** — personalised movie and show suggestions driven by your viewing history.

## Install

### 1. Create a Trakt application

Create an app at [trakt.tv/oauth/applications/new](https://trakt.tv/oauth/applications/new) — or manage existing ones at [trakt.tv/oauth/applications](https://trakt.tv/oauth/applications):

- **Redirect URI** — set it to `urn:ietf:wg:oauth:2.0:oob`. This server authenticates with Trakt's device flow, which never redirects, but Trakt requires the field; `oob` is the standard out-of-band placeholder.
- Copy the **Client ID** and **Client Secret** — you'll paste them in the next step.

### 2. Authenticate

Run the one-time OAuth setup. It exchanges your credentials for an access token and stores everything in the macOS Keychain (service `mcp-trakt`):

```sh
npx @kud/mcp-trakt@latest setup
```

> **Credentials resolution:** the server reads from the macOS Keychain by default. On platforms without Keychain (Linux, CI, Docker), set `MCP_TRAKT_CLIENT_ID` and `MCP_TRAKT_ACCESS_TOKEN` instead — env vars take precedence over the Keychain.

Then register the server with your MCP client:

```sh
claude mcp add trakt npx -- -y @kud/mcp-trakt@latest
```

Or add it manually to your MCP client config:

```json
{
  "mcpServers": {
    "trakt": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-trakt@latest"]
    }
  }
}
```

## Usage

Once connected, the following tools are available grouped by category.
