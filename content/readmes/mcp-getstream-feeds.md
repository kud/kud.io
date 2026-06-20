---
title: "mcp-getstream-feeds"
description: "🔔 Debug GetStream push delivery from Claude — inspect follows, followers & activity fan-out"
---

> Investigate GetStream feed subscriptions and debug push notification delivery from your AI assistant.

## Install

```bash
npx @kud/mcp-getstream-feeds
```

Set `MCP_GETSTREAM_API_KEY` and `MCP_GETSTREAM_SECRET` in your MCP client's `env`
block. The SDK signs requests server-side automatically.

## Development

```bash
git clone https://github.com/kud/mcp-getstream-feeds.git
cd mcp-getstream-feeds
npm install
npm run dev          # run via tsx (no build step)
npm run build        # compile to dist/
npm test             # vitest
npm run inspect:dev  # MCP Inspector
```
