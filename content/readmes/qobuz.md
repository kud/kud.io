---
title: "qobuz"
description: "Reverse-engineered Qobuz API client for Node.js"
---

## Features

- **Token auth, captcha-proof** — authenticates with a `user_auth_token` borrowed from your logged-in browser; no password handling, no captcha walls.
- **Pluggable credential store** — ships in-memory and macOS Keychain implementations; bring your own.
- **Typed resources** — search, albums, artists, tracks, playlists, favourites — clean camelCase domain types mapped from the raw API.
- **Deep links** — build `open.qobuz.com` URLs to open anything in the Qobuz app.
- **Now playing** — read the track the Qobuz desktop app is currently playing (macOS), bypassing the OS now-playing system Qobuz never registers with.
- **Collection stats** — analyse your library from the desktop app's local database: genre mix, hi-res ratio, top artists/labels, and collection timeline (macOS).
- **ESM + types, zero runtime deps** — tree-shakeable, fully typed, ships nothing extra.

## Install

```sh
npm install @kud/qobuz
```

## Usage

Grab a token from a logged-in [play.qobuz.com](https://play.qobuz.com) session — open DevTools, inspect any `api.json` network request, and copy the `X-User-Auth-Token` header. Then `connect` validates it, persists it to your store, and hands back a ready client (the `app_id` is scraped automatically if you don't pass one):

```ts
import { connect, createKeychainStore } from "@kud/qobuz"

const client = await connect({ token, store: createKeychainStore() })
const { albums } = await client.search.search("radiohead")
console.log(client.deepLink.album(albums[0].id))
```

On later runs the token is already stored, so skip `connect` and build straight from the store:

```ts
import { createQobuzClient, createKeychainStore } from "@kud/qobuz"

const client = await createQobuzClient({ store: createKeychainStore() })
```

Prefer the terminal? The companion CLI [`@kud/qobuz-cli`](https://kud.io/projects/qobuz-cli) wraps all of this in a `qobuz login` flow.

## Development

```sh
git clone https://github.com/kud/qobuz.git
cd qobuz
npm install
npm run build   # tsup → ESM + dts
npm test        # vitest
npm run typecheck
```
