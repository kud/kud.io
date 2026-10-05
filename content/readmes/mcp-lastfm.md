---
title: "mcp-lastfm"
description: "🎧 MCP server for Last.fm — discover artists, albums and tracks, and browse scrobble history and charts"
hasDocs: true
---

## Features

- **41 read-only tools** — search, artist, album/track, user, chart, tag, geo, and library lookups, all backed by the official Last.fm API
- **Scrobble history at a glance** — pull any user's recent tracks, loved tracks, friends, top artists/tracks/albums/tags, and weekly charts over a chosen time period
- **Global, tag, and country charts** — surface what's trending on Last.fm overall, within a tag (e.g. `shoegaze`), or by country
- **Name corrections** — check Last.fm's canonical-name correction data for misspelled artists and tracks
- **Just an API key** — a single `MCP_LASTFM_API_KEY`, no OAuth flow or session handshake; set an optional `MCP_LASTFM_USERNAME` to default the user tools to your own account
- **Safe by design** — read-only throughout; no scrobbling, no writes, nothing that touches a user's Last.fm account

## Install

```sh
npm install -g @kud/mcp-lastfm
```

Or install as a Claude plugin from the kud marketplace:

```
/plugin install lastfm@kud
```

> npm publish is pending — until `@kud/mcp-lastfm` lands on the registry, install from source (see [Development](#development)).

### Getting an API key

1. Go to [last.fm/api/account/create](https://www.last.fm/api/account/create) (you'll need to be signed in to a Last.fm account).
2. Fill in **Application name** (e.g. `mcp-lastfm`) and a short **description**. Leave **Callback URL** blank — it's only used for the web login flow, which this read-only server doesn't need.
3. Submit. Last.fm shows you an **API key** and a **shared secret** — you only need the **API key**. (The shared secret is for signed write calls like scrobbling, which aren't supported here.)

### Configuration

Add it to your MCP client config:

```json
{
  "mcpServers": {
    "lastfm": {
      "command": "mcp-lastfm",
      "env": {
        "MCP_LASTFM_API_KEY": "your-api-key",
        "MCP_LASTFM_USERNAME": "your-lastfm-username"
      }
    }
  }
}
```

| Variable              | Required | Purpose                                                                                                                                                                                                                  |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MCP_LASTFM_API_KEY`  | yes      | Authenticates every request                                                                                                                                                                                              |
| `MCP_LASTFM_USERNAME` | no       | Default account for the `get_user_*` tools, so you can ask "what have I been listening to?" without repeating your username. An explicit `user` argument still overrides it, so you can look up anyone's public profile. |

## Usage

Once connected, ask your MCP client things like:

```console
> Search for the artist "Slowdive"
> What are Radiohead's top tracks?
> Show me my recent scrobbles
> What's trending on the shoegaze tag right now?
```
