---
title: "bsky"
description: "A Bluesky (AT Protocol) client library for Node — post, thread, reply, quote, engage, read, and search"
---

## Features

- **Full posting** — posts with rich-text facets (links, hashtags, mentions), replies, quotes, image embeds, and self-threads.
- **Engagement** — like, repost, follow, and all their reversals.
- **Reading** — home timeline, author feeds, notifications, profiles, and full threads.
- **Search** — posts and actors.
- **Surface-agnostic** — plain async functions over the raw AT Protocol XRPC API; no SDK, **zero runtime dependencies**.
- **ESM + types** — fully typed, tree-shakeable.

## Install

```sh
npm install @kud/bsky
```

## Usage

Authentication uses your Bluesky **App Password** (Settings → App Passwords) via two environment variables — `BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD`:

```ts
import { createPost, getTimeline, searchPosts } from "@kud/bsky"

await createPost("hello from @kud/bsky 🦋")

const feed = await getTimeline(20)
const hits = await searchPosts("at protocol")
```

Replies, quotes, and threads:

```ts
await createPost("nice thread!", {
  replyTo: "https://bsky.app/profile/…/post/…",
})
await createThread(["1/", "2/", "3/"])
```

## Powers

This core backs [`@kud/bsky-cli`](https://www.npmjs.com/package/@kud/bsky-cli) (a terminal client) and `@kud/mcp-bsky` (an MCP server) — the CLI and MCP are thin surfaces over this one library.

## Development

```sh
git clone https://github.com/kud/bsky.git
cd bsky
npm install
npm run dev
```
