---
title: "mcp-raindrop-io"
description: "🔖 Connect Claude to Raindrop.io — search, save, organise and audit your bookmarks"
---

> A Raindrop.io MCP server with 23 tools for managing bookmarks, collections, tags, and highlights from any MCP client.

## Install

```bash
npx --yes @kud/mcp-raindrop-io@latest
```

Add it to your MCP client with a Raindrop.io token in `MCP_RAINDROPIO_TOKEN`:

```json
{
  "mcpServers": {
    "Raindrop": {
      "command": "npx",
      "args": ["--yes", "@kud/mcp-raindrop-io@latest"],
      "env": {
        "MCP_RAINDROPIO_TOKEN": "your-token-here"
      }
    }
  }
}
```

Per-client setup (Claude Code CLI, Cursor, Windsurf, VSCode) and how to get a token are in the [documentation](https://kud.io/projects/mcp-raindrop-io/docs).

## Development

```bash
git clone https://github.com/kud/mcp-raindrop-io.git
cd mcp-raindrop-io
npm install
npm run build      # compile TypeScript
npm run dev        # run directly with tsx
npm test           # run the test suite
npm run inspect:dev # interactive MCP inspector
```
