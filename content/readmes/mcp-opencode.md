---
title: "mcp-opencode"
description: "🔮 Query any model configured in opencode from Claude — zero API keys, auto-starts the server"
---

## Install

```bash
npm install -g @kud/mcp-opencode
```

Register it with your AI client (Claude Desktop, Cursor, Windsurf, VSCode, Claude Code):

```json
{
  "mcpServers": {
    "opencode": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-opencode"]
    }
  }
}
```

Requires [opencode](https://opencode.ai) installed with at least one provider configured, and Node.js ≥ 20.

---

## Development

```bash
git clone https://github.com/kud/mcp-opencode.git
cd mcp-opencode
npm install
npm run build
npm test
```

Use the local `.mcp.json` to connect Claude Code to your dev build, or `npm run inspect` to open the MCP Inspector.
