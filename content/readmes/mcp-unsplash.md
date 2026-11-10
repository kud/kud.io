---
title: "mcp-unsplash"
description: "MCP server for Unsplash — search and fetch freely-licensed photos via the public Unsplash API."
hasDocs: true
---

## 🌟 Features

- 🔍 **Keyword search** — full-text search across photos, collections, and users, with pagination, orientation, colour, and sort-order filters
- 🎲 **Random photos** — pull 1–30 random photos, optionally scoped to a query, collection, or topic
- 🖼 **Full photo metadata** — resolve a single photo by ID, including EXIF and location where available
- 📁 **Collections browsing** — list collections, fetch one by ID, list its photos, find related collections
- 🏷 **Editorial topics** — list Unsplash's curated topics, fetch one by ID/slug, and the photos within each one
- 👤 **User profiles** — public profile, photos, collections, and statistics for any Unsplash user
- 📊 **Statistics** — per-photo and per-user download/view/like statistics, plus platform-wide totals and monthly stats
- ✂️ **LLM-trimmed responses** — every tool strips API payloads down to the fields an LLM actually needs (id, description, dimensions, colour, a small set of image URLs, author name + profile link)
- ✅ **Guideline-compliant** — `get_photo` fires the Unsplash download-tracking ping automatically, as required by the API terms

## 🚀 Quick Start

Get a free Access Key from [unsplash.com/developers](https://unsplash.com/developers) — no payment required. New apps start in the **Demo** tier (50 requests/hour); apply for **Production** access to raise that to 5,000 requests/hour.

```sh
npm install -g @kud/mcp-unsplash
```

Run it directly to confirm it starts:

```console
$ MCP_UNSPLASH_ACCESS_KEY=your-access-key npx @kud/mcp-unsplash
mcp-unsplash running
```

The server speaks MCP over stdio, so in practice it's launched by an MCP client (Claude Desktop, Claude Code, etc.) rather than run standalone — see [Configuration](#-configuration) below.
