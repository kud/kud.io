---
title: "mcp-raindrop-io"
description: "MCP server for Raindrop.io — bookmarks, collections, tags, highlights and more."
---

```
██████╗  █████╗ ██╗███╗   ██╗██████╗ ██████╗  ██████╗ ██████╗    ██╗ ██████╗
██╔══██╗██╔══██╗██║████╗  ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗  ██╔╝██╔═══██╗
██████╔╝███████║██║██╔██╗ ██║██║  ██║██████╔╝██║   ██║██████╔╝ ██╔╝ ██║   ██║
██╔══██╗██╔══██║██║██║╚██╗██║██║  ██║██╔══██╗██║   ██║██╔═══╝ ██╔╝  ██║   ██║
██║  ██║██║  ██║██║██║ ╚████║██████╔╝██║  ██║╚██████╔╝██║    ██╔╝   ╚██████╔╝
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝   ╚═╝    ╚═════╝
```

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-purple?logo=anthropic)](https://modelcontextprotocol.io/)
[![npm](https://img.shields.io/npm/v/@kud/mcp-raindrop-io?color=red&logo=npm)](https://www.npmjs.com/package/@kud/mcp-raindrop-io)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A Raindrop.io MCP server with 22 tools for managing bookmarks, collections, tags, and highlights**

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation-guides) • [Tools](#-available-tools) • [Development](#-development)

</div>

---

## 🌟 Features

- **🔐 Simple Auth** — Single Bearer token via `MCP_RAINDROPIO_TOKEN` env var
- **📚 22 Tools** — Full Raindrop.io API coverage
- **⚡ Modern Stack** — TypeScript 5+, ES2023, Native Fetch API
- **📦 MCP Protocol** — Native integration with Claude Desktop, Claude Code CLI
- **🔖 Bookmark Management** — Create, search, update, delete with advanced filters
- **📁 Collection Control** — Root, nested, CRUD, cleanup of empty collections
- **🏷️ Tag Operations** — List, rename, merge, delete tags
- **✨ Highlights** — Create and manage text highlights on bookmarks
- **🔍 Smart Search** — Filter by broken links, duplicates, untagged, domain, media type, date
- **🧹 Library Utilities** — Audit, empty trash, cleanup empty collections
- **🔍 Debug Tools** — MCP inspector for interactive testing

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- A Raindrop.io account
- A Raindrop.io API token ([how to get one](#-authentication))

### Installation

**Via npx (no install needed):**

```bash
npx --yes @kud/mcp-raindrop-io@latest
```

**Local installation:**

```bash
git clone https://github.com/kud/mcp-raindrop-io.git
cd mcp-raindrop-io
npm install
npm run build
```

### Quick Setup (Claude Desktop)

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

✅ Done! Restart Claude Desktop and start saving bookmarks with AI.

---

## 📚 Installation Guides

- [Claude Code CLI](#-claude-code-cli)
- [Claude Desktop](#%EF%B8%8F-claude-desktop)
- [Cursor](#-cursor)
- [Windsurf](#-windsurf)
- [VSCode](#-vscode)

---

### 🎯 Claude Code CLI

<details>
<summary><b>Click to expand Claude Code CLI setup</b></summary>

**Via npm:**

```bash
claude mcp add --transport stdio --scope user raindrop \
  --env MCP_RAINDROPIO_TOKEN=your-token-here \
  -- npx --yes @kud/mcp-raindrop-io@latest
```

**Local installation:**

```bash
claude mcp add --transport stdio --scope user raindrop \
  --env MCP_RAINDROPIO_TOKEN=your-token-here \
  -- node $HOME/Projects/mcp-raindrop-io/dist/index.js
```

Verify: `claude mcp list` should show `raindrop`

</details>

---

### 🖥️ Claude Desktop

<details>
<summary><b>Click to expand Claude Desktop setup</b></summary>

#### 1. Open Configuration File

**macOS:**

```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**

```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

#### 2. Add Configuration

**Via npm (recommended):**

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

**Local installation:**

```json
{
  "mcpServers": {
    "Raindrop": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-raindrop-io/dist/index.js"],
      "env": {
        "MCP_RAINDROPIO_TOKEN": "your-token-here"
      }
    }
  }
}
```

#### 3. Restart

Quit (Cmd+Q / Alt+F4) and reopen Claude Desktop.

</details>

---

### 🌐 Cursor

<details>
<summary><b>Click to expand Cursor setup</b></summary>

Settings (Cmd+, / Ctrl+,) → Search "MCP" → Edit Config or open `~/.cursor/mcp_config.json`:

```json
{
  "mcpServers": {
    "raindrop": {
      "command": "npx",
      "args": ["--yes", "@kud/mcp-raindrop-io@latest"],
      "env": {
        "MCP_RAINDROPIO_TOKEN": "your-token-here"
      }
    }
  }
}
```

Restart Cursor after configuration.

</details>

---

### 🌊 Windsurf

<details>
<summary><b>Click to expand Windsurf setup</b></summary>

Settings → **AI Settings** → **Model Context Protocol** → Add Server:

```json
{
  "mcpServers": {
    "raindrop": {
      "command": "npx",
      "args": ["--yes", "@kud/mcp-raindrop-io@latest"],
      "env": {
        "MCP_RAINDROPIO_TOKEN": "your-token-here"
      }
    }
  }
}
```

Restart Windsurf after configuration.

</details>

---

### 📝 VSCode

<details>
<summary><b>Click to expand VSCode setup (Cline / Claude Dev)</b></summary>

Settings → Search "Cline: MCP Settings" → Edit in settings.json:

```json
{
  "cline.mcpServers": {
    "raindrop": {
      "command": "npx",
      "args": ["--yes", "@kud/mcp-raindrop-io@latest"],
      "env": {
        "MCP_RAINDROPIO_TOKEN": "your-token-here"
      }
    }
  }
}
```

Reload window after configuration.

</details>

---

## 🛠️ Available Tools

### 🔖 Bookmarks (6 tools)

| Tool               | Description                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `search_raindrops` | Search/list bookmarks with advanced filters (broken, duplicates, important, untagged, domain, media type, date range, sort) |
| `get_raindrop`     | Fetch a single bookmark by ID                                                                                               |
| `create_raindrop`  | Save a new URL as a bookmark                                                                                                |
| `update_raindrop`  | Edit title, excerpt, note, tags, or move to another collection                                                              |
| `delete_raindrop`  | Delete a bookmark (moves to trash)                                                                                          |
| `bulk_raindrops`   | Bulk update, move, or delete multiple bookmarks at once                                                                     |

### 📁 Collections (7 tools)

| Tool                    | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `get_collections`       | List all root collections                                    |
| `get_child_collections` | List all nested/child collections                            |
| `get_collection`        | Fetch a single collection by ID                              |
| `create_collection`     | Create a new collection (with optional parent, view, public) |
| `update_collection`     | Rename, nest, or change view of a collection                 |
| `delete_collection`     | Delete a collection and all its bookmarks                    |
| `cleanup_collections`   | Remove all empty collections (requires `confirm: true`)      |

### 🏷️ Tags (2 tools)

| Tool          | Description                                       |
| ------------- | ------------------------------------------------- |
| `get_tags`    | List all tags, globally or scoped to a collection |
| `manage_tags` | Rename, merge, or delete tags                     |

### ✨ Highlights (2 tools)

| Tool               | Description                           |
| ------------------ | ------------------------------------- |
| `get_highlights`   | List all highlights for a bookmark    |
| `manage_highlight` | Create, update, or delete a highlight |

### 👤 User & Import (3 tools)

| Tool               | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `get_user`         | Get authenticated user info                                     |
| `parse_url`        | Extract title, description, and type from any URL before saving |
| `check_urls_exist` | Check if one or more URLs are already saved                     |

### 🧹 Library Utilities (2 tools)

| Tool            | Description                                                            |
| --------------- | ---------------------------------------------------------------------- |
| `library_audit` | Scan your library for broken links, duplicates, and untagged bookmarks |
| `empty_trash`   | Permanently delete all bookmarks in trash (requires `confirm: true`)   |

**Total: 22 Tools** covering the full Raindrop.io API!

---

## 💬 Example Conversations

Once configured, manage your bookmarks naturally:

```
You: "Save this URL to my Reading List collection: https://example.com/article"
AI: *Creates the bookmark and confirms*

You: "Find all my bookmarks about TypeScript"
AI: *Searches and returns matching bookmarks*

You: "Show me all my broken links"
AI: *Lists all bookmarks with broken links*

You: "Move all bookmarks tagged 'draft' to my Archive collection"
AI: *Bulk moves bookmarks*

You: "What are my most used tags?"
AI: *Lists tags with counts*

You: "Audit my library — how many duplicates and untagged items do I have?"
AI: *Returns counts for broken, duplicates, and untagged*

You: "Add a yellow highlight to bookmark #12345: 'This is the key insight'"
AI: *Creates the highlight*

You: "Rename the tag 'js' to 'javascript' across all my collections"
AI: *Renames the tag globally*

You: "Is https://example.com already in my bookmarks?"
AI: *Checks and returns the existing bookmark ID if found*

You: "Empty the trash"
AI: *Asks for confirmation, then permanently deletes*
```

---

## 🧪 Development

### Project Structure

```
mcp-raindrop-io/
├── src/
│   └── index.ts        # MCP server — all 22 tools in one file
├── dist/               # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

| Script                | Description                      |
| --------------------- | -------------------------------- |
| `npm run build`       | Compile TypeScript               |
| `npm run build:watch` | Watch mode — rebuild on changes  |
| `npm run dev`         | Run directly with tsx (no build) |
| `npm start`           | Run compiled server              |
| `npm run inspect`     | Open MCP inspector (built)       |
| `npm run inspect:dev` | Open MCP inspector (no build)    |
| `npm run typecheck`   | Type-check without building      |
| `npm run clean`       | Remove dist artifacts            |

### Development Workflow

```bash
# Terminal 1: Watch mode
npm run build:watch

# Terminal 2: Interactive inspector
npm run inspect:dev
```

### Testing with MCP Inspector

```bash
export MCP_RAINDROPIO_TOKEN=your-token-here
npm run inspect:dev
```

Opens `http://localhost:5173` — test all 22 tools interactively!

---

## 🔐 Authentication

### Get Your Raindrop.io Token

1. Go to [app.raindrop.io/settings/integrations](https://app.raindrop.io/settings/integrations)
2. Click **Create new app**
3. Give it a name (e.g. "MCP Server")
4. Click the app → copy the **Test token**

That's it — paste it into `MCP_RAINDROPIO_TOKEN`.

> ⚠️ Keep your token private. It grants full read/write access to your Raindrop.io account.

---

## 🐛 Troubleshooting

### Server Not Showing in Claude

1. ✅ Verify `MCP_RAINDROPIO_TOKEN` is set and non-empty
2. ✅ Run `npm install && npm run build`
3. ✅ Check the path in your config is absolute
4. ✅ Restart Claude Desktop completely (Cmd+Q / Alt+F4)

### Authentication Errors

```bash
# Test your token
curl -H "Authorization: Bearer your-token-here" \
  https://api.raindrop.io/rest/v1/user
```

If this returns your user info, the token is valid.

### Check Logs

**Claude Desktop:**

- macOS: `~/Library/Logs/Claude/mcp*.log`
- Windows: `%APPDATA%\Claude\logs\mcp*.log`

**Claude Code CLI:**

```bash
claude mcp get raindrop
```

---

## 🔒 Security Best Practices

- ✅ Always use `MCP_RAINDROPIO_TOKEN` env var — never hardcode tokens
- ✅ Never commit your token to version control
- ✅ Protect your `claude_desktop_config.json`
- ✅ Rotate your token if you suspect it's been exposed (via Raindrop.io integrations settings)

---

## 📊 Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript 5+
- **Target:** ES2023
- **Protocol:** MCP 1.0 (stdio transport)
- **HTTP Client:** Native Fetch API
- **Module System:** ESM

---

## 🤝 Contributing

Contributions welcome! Please ensure:

1. TypeScript strict mode passes: `npm run typecheck`
2. Build succeeds: `npm run build`
3. New tools follow the existing `registerTool` + `ok`/`err` pattern

---

## 📄 License

MIT — see [LICENSE](https://github.com/kud/mcp-raindrop-io/blob/HEAD/LICENSE) file.

---

## 🙏 Acknowledgments

- Built with [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by the [Raindrop.io API](https://developer.raindrop.io/)

---

## 📮 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/kud/mcp-raindrop-io/issues)

---

<div align="center">

**Made with ❤️ for bookmark lovers**

⭐ Star this repo if it helped you!

[Back to Top](#raindropio-mcp-server)

</div>
