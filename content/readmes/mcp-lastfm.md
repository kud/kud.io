---
title: "mcp-lastfm"
description: "🎧 MCP server for Last.fm — discover artists, albums and tracks, and browse scrobble history and charts"
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

### Tools

**Search** — `search_artists` · `search_albums` · `search_tracks`

**Artist** — `get_artist` · `get_similar_artists` · `get_artist_top_tracks` · `get_artist_top_albums` · `get_artist_top_tags` · `correct_artist`

**Album & Track** — `get_album` · `get_album_top_tags` · `get_track` · `get_similar_tracks` · `get_track_top_tags` · `correct_track`

**User** — `get_user_info` · `get_user_recent_tracks` · `get_user_top_artists` · `get_user_top_tracks` · `get_user_top_albums` · `get_user_loved_tracks` · `get_user_friends` · `get_user_personal_tags` · `get_user_top_tags` · `get_user_weekly_album_chart` · `get_user_weekly_artist_chart` · `get_user_weekly_track_chart` · `get_user_weekly_chart_list`

**Chart** — `get_chart_top_artists` · `get_chart_top_tracks` · `get_chart_top_tags`

**Tag** — `get_tag_top_artists` · `get_tag_top_tracks` · `get_tag_info` · `get_similar_tags` · `get_tag_top_albums` · `get_top_tags` · `get_tag_weekly_chart_list`

**Geo** — `get_geo_top_artists` · `get_geo_top_tracks`

**Library** — `get_library_artists`

## Development

```sh
git clone https://github.com/kud/mcp-lastfm.git
cd mcp-lastfm
npm install
MCP_LASTFM_API_KEY=your-api-key MCP_LASTFM_USERNAME=your-username npm run dev
```

Inspect the server interactively with the MCP inspector:

```sh
npm run inspect:dev
```

📚 **Full documentation → [mcp-lastfm/docs](https://kud.io/projects/mcp-lastfm/docs)**
</content>
