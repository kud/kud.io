---
title: "mcp-bsky"
description: "MCP server for Bluesky — search, read, and post via the AT Protocol."
hasDocs: true
---

## 🌟 Features

- **App-password auth** — uses your Bluesky App Password via `BLUESKY_HANDLE` / `BLUESKY_APP_PASSWORD` (shared with `@kud/bsky-cli`).
- **11 tools** — 5 read, 6 write.
- **Writes are gated** — every posting/engagement tool requires an explicit `confirm: true`, so an agent can never publish by accident.
- **Thin wrapper** — each tool is one line over `@kud/bsky`; the API logic lives in the core library, not here.
- **TypeScript, ESM, zero business logic** — `@modelcontextprotocol/sdk` + `zod`.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- A Bluesky account and an **App Password** (Settings → App Passwords)

### Installation

```sh
npx @kud/mcp-bsky
```

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "bsky": {
      "command": "npx",
      "args": ["@kud/mcp-bsky"],
      "env": {
        "BLUESKY_HANDLE": "you.bsky.social",
        "BLUESKY_APP_PASSWORD": "xxxx-xxxx-xxxx-xxxx"
      }
    }
  }
}
```

✅ Restart your client and the `bsky` tools appear.
