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

#### Search

| Tool             | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `search_artists` | Search for artists by name                                |
| `search_albums`  | Search for albums by name                                 |
| `search_tracks`  | Search for tracks by name, optionally scoped to an artist |

#### Artist

| Tool                    | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `get_artist`            | Artist bio, listener/play stats, and tags                 |
| `get_similar_artists`   | Artists similar to a given one, with match scores         |
| `get_artist_top_tracks` | An artist's most-played tracks                            |
| `get_artist_top_albums` | An artist's most-played albums                            |
| `get_artist_top_tags`   | The tags most applied to an artist                        |
| `correct_artist`        | Last.fm's canonical spelling for a misspelled artist name |

#### Album & Track

| Tool                 | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `get_album`          | Album info, tracklist, and tags                            |
| `get_album_top_tags` | The tags most applied to an album                          |
| `get_track`          | Track info, stats, and tags                                |
| `get_similar_tracks` | Tracks similar to a given one                              |
| `get_track_top_tags` | The tags most applied to a track                           |
| `correct_track`      | Last.fm's canonical spelling for a misspelled track/artist |

#### User

| Tool                           | Description                                             |
| ------------------------------ | ------------------------------------------------------- |
| `get_user_info`                | A user's profile and listening stats                    |
| `get_user_recent_tracks`       | Recent scrobbles, including the currently playing track |
| `get_user_top_artists`         | Most-played artists over a time period                  |
| `get_user_top_tracks`          | Most-played tracks over a time period                   |
| `get_user_top_albums`          | Most-played albums over a time period                   |
| `get_user_loved_tracks`        | Tracks the user has marked as loved                     |
| `get_user_friends`             | The user's Last.fm friends                              |
| `get_user_personal_tags`       | Items the user has tagged with a given tag              |
| `get_user_top_tags`            | The user's most-used tags                               |
| `get_user_weekly_album_chart`  | Album play chart for a given week                       |
| `get_user_weekly_artist_chart` | Artist play chart for a given week                      |
| `get_user_weekly_track_chart`  | Track play chart for a given week                       |
| `get_user_weekly_chart_list`   | Available weekly-chart date ranges                      |

#### Chart

| Tool                    | Description                                   |
| ----------------------- | --------------------------------------------- |
| `get_chart_top_artists` | The most popular artists on Last.fm right now |
| `get_chart_top_tracks`  | The most popular tracks on Last.fm right now  |
| `get_chart_top_tags`    | The most popular tags on Last.fm right now    |

#### Tag

| Tool                        | Description                                  |
| --------------------------- | -------------------------------------------- |
| `get_tag_top_artists`       | Top artists for a tag                        |
| `get_tag_top_tracks`        | Top tracks for a tag                         |
| `get_tag_info`              | A tag's description and usage stats          |
| `get_similar_tags`          | Tags similar to a given one                  |
| `get_tag_top_albums`        | Top albums for a tag                         |
| `get_top_tags`              | The most popular tags globally               |
| `get_tag_weekly_chart_list` | Available weekly-chart date ranges for a tag |

#### Geo

| Tool                  | Description                    |
| --------------------- | ------------------------------ |
| `get_geo_top_artists` | Top artists in a given country |
| `get_geo_top_tracks`  | Top tracks in a given country  |

#### Library

| Tool                  | Description                                   |
| --------------------- | --------------------------------------------- |
| `get_library_artists` | Artists in a user's library, with play counts |

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
