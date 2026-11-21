---
title: "bsky"
description: "A Bluesky (AT Protocol) client library for Node — post, thread, reply, quote, engage, read, and search"
hasDocs: true
---

## Features

- **Full posting** — posts with rich-text facets (links, hashtags, mentions), replies, quotes, single-image embeds with alt text, and self-threads.
- **Engagement** — like, repost, follow, and all their reversals.
- **Reading** — home timeline, author feeds, notifications, profiles, and threads (a post and its direct replies).
- **Search** — posts and actors.
- **Surface-agnostic** — plain async functions over the raw AT Protocol XRPC API; no SDK, **zero runtime dependencies**.
- **ESM + types** — ESM-only, fully typed, Node 20 or later.

## Install

```sh
npm install @kud/bsky
```

## Usage

Authentication uses your Bluesky **App Password** (Settings → App Passwords) via two environment variables — `BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD` — read once when the package is first imported:

```ts
import { createPost, getTimeline, searchPosts } from "@kud/bsky"

await createPost("hello from @kud/bsky 🦋")

const feed = await getTimeline(20)
const hits = await searchPosts("at protocol")
```

Replies, quotes, and threads:

```ts
import { createPost, createThread } from "@kud/bsky"

await createPost("nice thread!", {
  replyTo: "https://bsky.app/profile/alice.example.com/post/3kexample",
})
await createPost("worth a read", {
  quote: "https://bsky.app/profile/alice.example.com/post/3kexample",
})
await createThread(["1/", "2/", "3/"])
```
