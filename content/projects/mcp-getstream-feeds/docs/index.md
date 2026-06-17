---
title: "mcp-getstream-feeds"
description: "MCP server for GetStream Feeds — investigate push notification delivery and subscription state."
---

```
 ██████╗ ███████╗████████╗███████╗████████╗██████╗ ███████╗ █████╗ ███╗   ███╗
██╔════╝ ██╔════╝╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔══██╗████╗ ████║
██║  ███╗█████╗     ██║   ███████╗   ██║   ██████╔╝█████╗  ███████║██╔████╔██║
██║   ██║██╔══╝     ██║   ╚════██║   ██║   ██╔══██╗██╔══╝  ██╔══██║██║╚██╔╝██║
╚██████╔╝███████╗   ██║   ███████║   ██║   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║
 ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
███████╗███████╗███████╗██████╗ ███████╗
██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝
█████╗  █████╗  █████╗  ██║  ██║███████╗
██╔══╝  ██╔══╝  ██╔══╝  ██║  ██║╚════██║
██║     ███████╗███████╗██████╔╝███████║
╚═╝     ╚══════╝╚══════╝╚═════╝ ╚══════╝
```

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![MCP](https://img.shields.io/badge/MCP-1.0-purple?logo=anthropic)
![npm](https://img.shields.io/badge/npm-%40kud%2Fmcp--getstream--feeds-red?logo=npm)
![License](https://img.shields.io/badge/License-MIT-blue)

**Investigate GetStream feed subscriptions and push notification delivery state via MCP.**

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation-guides) • [Tools](#-available-tools) • [Development](#-development)

</div>

---

## 🌟 Features

- 🔐 **Server-side JWT auth** — SDK handles signing automatically via API key + secret
- 🛠️ **5 tools** covering feed following, followers, activities, and follow/unfollow mutations
- 📦 **ESM + TypeScript** — modern module system, fully typed
- 🔒 **Safety gates** on destructive mutations (follow/unfollow require `confirm: true`)
- 📡 Designed for debugging **push notification fan-out** in any GetStream-powered application

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- A GetStream account with an API key and secret

### Installation

```bash
# Use directly via npx
npx @kud/mcp-getstream-feeds

# Or clone locally
git clone https://github.com/kud/mcp-getstream-feeds.git
cd mcp-getstream-feeds
npm install && npm run build
```

### Quick Setup (Claude Desktop)

```json
{
  "mcpServers": {
    "getstream-feeds": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-getstream-feeds"],
      "env": {
        "MCP_GETSTREAM_API_KEY": "your_api_key",
        "MCP_GETSTREAM_SECRET": "your_api_secret"
      }
    }
  }
}
```

✅ Restart Claude Desktop — GetStream Feeds tools will be available immediately.

## 📚 Installation Guides

- [Claude Code CLI](#-claude-code-cli)
- [Claude Desktop](#-claude-desktop-macos--windows)
- [Cursor](#-cursor)
- [Windsurf](#-windsurf)
- [VSCode](#-vscode)

---

<details>
<summary><h3>⌨️ Claude Code CLI</h3></summary>

```bash
claude mcp add getstream-feeds \
  -e MCP_GETSTREAM_API_KEY=your_api_key \
  -e MCP_GETSTREAM_SECRET=your_api_secret \
  -- npx -y @kud/mcp-getstream-feeds
```

</details>

<details>
<summary><h3>🖥️ Claude Desktop (macOS + Windows)</h3></summary>

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "getstream-feeds": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-getstream-feeds"],
      "env": {
        "MCP_GETSTREAM_API_KEY": "your_api_key",
        "MCP_GETSTREAM_SECRET": "your_api_secret"
      }
    }
  }
}
```

</details>

<details>
<summary><h3>🖱️ Cursor</h3></summary>

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "getstream-feeds": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-getstream-feeds"],
      "env": {
        "MCP_GETSTREAM_API_KEY": "your_api_key",
        "MCP_GETSTREAM_SECRET": "your_api_secret"
      }
    }
  }
}
```

</details>

<details>
<summary><h3>🌊 Windsurf</h3></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "getstream-feeds": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-getstream-feeds"],
      "env": {
        "MCP_GETSTREAM_API_KEY": "your_api_key",
        "MCP_GETSTREAM_SECRET": "your_api_secret"
      }
    }
  }
}
```

</details>

<details>
<summary><h3>💻 VSCode</h3></summary>

Add to `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "getstream-feeds": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-getstream-feeds"],
      "env": {
        "MCP_GETSTREAM_API_KEY": "your_api_key",
        "MCP_GETSTREAM_SECRET": "your_api_secret"
      }
    }
  }
}
```

</details>

## 🛠️ Available Tools

### 📋 Feed Subscriptions (4 tools)

| Tool                       | Description                                                     |
| -------------------------- | --------------------------------------------------------------- |
| `getstream_feed_following` | Get what feeds a specific feed follows (subscriptions)          |
| `getstream_feed_followers` | Get who follows a specific feed (subscribers)                   |
| `getstream_feed_follow`    | Subscribe a feed to another feed _(requires confirm: true)_     |
| `getstream_feed_unfollow`  | Unsubscribe a feed from another feed _(requires confirm: true)_ |

### 📰 Feed Activities (1 tool)

| Tool                        | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `getstream_feed_activities` | Get recent activities on a feed with timestamps and payloads |

**Total: 5 Tools** covering the GetStream Feeds API for push notification debugging!

## 💬 Example Conversations

```
You: "Is user_123 subscribed to the timeline feed?"
AI: *Calls getstream_feed_following with feed_slug=notification, feed_id=user_123 and checks if timeline:timeline_global appears in the results.*

You: "How many users are subscribed to timeline_global?"
AI: *Calls getstream_feed_followers with feed_slug=timeline, feed_id=timeline_global and returns the count.*

You: "Show me the last 5 activities on the user_activity feed for user_123."
AI: *Calls getstream_feed_activities with feed_slug=user_activity, feed_id=user_123, limit=5.*

You: "Subscribe user_123 to timeline_global."
AI: *Calls getstream_feed_follow with source=notification:user_123, target=timeline:timeline_global, confirm=true.*

You: "Why isn't this user receiving notifications?"
AI: *Checks their notification feed following list — if timeline:timeline_global is missing, the missing subscription is the root cause.*

You: "Unsubscribe user_456 from user_activity:user_456."
AI: *Calls getstream_feed_unfollow with source=notification:user_456, target=user_activity:user_456, confirm=true.*
```

## 🧪 Development

### Project Structure

```
mcp-getstream-feeds/
├── src/
│   ├── index.ts              # Server entry point + all tool handlers
│   └── __tests__/
│       └── tools.test.ts     # Vitest unit tests
├── dist/                     # Compiled output (generated)
├── .mcp.json                 # Local MCP config for development
├── CLAUDE.md                 # Feed patterns and auth reference
├── package.json
└── tsconfig.json
```

### Available Scripts

| Script                | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Run via tsx (no build step)  |
| `npm run build`       | Compile TypeScript to dist/  |
| `npm run build:watch` | Watch mode compilation       |
| `npm test`            | Run tests with Vitest        |
| `npm run test:watch`  | Watch mode tests             |
| `npm run coverage`    | Test coverage report         |
| `npm run inspect`     | MCP Inspector (built)        |
| `npm run inspect:dev` | MCP Inspector (dev, via tsx) |
| `npm run typecheck`   | Type-check without emitting  |

### Development Workflow

Terminal 1 — watch compilation:

```bash
npm run build:watch
```

Terminal 2 — MCP Inspector:

```bash
export MCP_GETSTREAM_API_KEY=your_api_key
export MCP_GETSTREAM_SECRET=your_api_secret
npm run inspect:dev
```

### Testing with MCP Inspector

```bash
export MCP_GETSTREAM_API_KEY=your_api_key
export MCP_GETSTREAM_SECRET=your_api_secret
npm run inspect:dev
```

Open http://localhost:5173 to interactively test all tools.

## 🔐 Authentication

1. Log in to your GetStream dashboard at https://dashboard.getstream.io
2. Select your app and navigate to **Overview**
3. Copy your **API Key** and **API Secret**
4. Set the env vars:

```bash
export MCP_GETSTREAM_API_KEY=your_api_key
export MCP_GETSTREAM_SECRET=your_api_secret
```

Verify connectivity:

```bash
node -e "
import('getstream').then(({ connect }) => {
  const client = connect(process.env.MCP_GETSTREAM_API_KEY, process.env.MCP_GETSTREAM_SECRET);
  console.log('Connected:', client.baseURL);
});
"
```

## 🐛 Troubleshooting

### Server Not Showing

- Ensure `MCP_GETSTREAM_API_KEY` and `MCP_GETSTREAM_SECRET` are set in the MCP config's `env` block
- Confirm `dist/index.js` exists — run `npm run build` if missing
- Check the MCP config JSON is valid (no trailing commas)

### Authentication Errors

- Verify the API key and secret match the correct GetStream app
- Confirm you're using a server-side secret (not a user token)

### Check Logs

macOS: `~/Library/Logs/Claude/mcp-server-getstream-feeds.log`
Windows: `%APPDATA%\Claude\logs\mcp-server-getstream-feeds.log`

```bash
claude mcp get getstream-feeds
```

## 🔒 Security Best Practices

- ✅ Never hardcode API keys or secrets in source files
- ✅ Never commit `.env` files or credentials to git
- ✅ Store secrets in env vars or a secrets manager
- ✅ Rotate the API secret immediately if it is ever exposed

## 📊 Tech Stack

**Runtime:** Node.js 20+
**Language:** TypeScript 5
**Target:** ES2023
**Protocol:** Model Context Protocol (MCP) 1.0
**SDK:** getstream (official JS SDK)
**Module System:** ESM

## 🤝 Contributing

1. Run `npm run typecheck` to verify types
2. Run `npm run build && npm test` to confirm everything passes
3. Follow the single-file architecture (`src/index.ts`) — extract handlers as exported arrow functions for testability

## 📄 License

MIT — see [LICENSE](https://github.com/kud/mcp-getstream-feeds/blob/HEAD/LICENSE)

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) — the MCP standard
- [GetStream Feeds API](https://getstream.io/activity-feeds/docs/node/) — official SDK docs

## 📮 Support

[Open an issue](https://github.com/kud/mcp-getstream-feeds/issues)

---

<div align="center">

**Made with ❤️ by kud**

⭐ Star this repo if it helped you!

[Back to Top](#getstream-feeds-mcp-server)

</div>
