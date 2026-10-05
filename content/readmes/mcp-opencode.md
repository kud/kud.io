---
title: "mcp-opencode"
description: "🔮 Query any model configured in opencode from Claude — zero API keys, auto-starts the server"
hasDocs: true
---

## Features

- **Zero API key** — routes prompts through a locally running opencode server, so no provider credentials are needed in your AI client.
- **Multi-model support** — any model configured in opencode is available; query GPT-4.1, Claude, Gemini, or any other supported provider.
- **Model filtering** — restrict or block models via `MCP_OPENCODE_MODEL_ALLOW` and `MCP_OPENCODE_MODEL_BLOCK` environment variables using glob-style patterns.
- **Talk to a live session** — `list_sessions`, `send` and `read` let your assistant hold a conversation with a running opencode session, such as the one open in your TUI, and the exchange shows up there live.
- **Headless jobs** — `start_instance`, `task`, `wait`, `list_instances` and `stop_instance` run work on a private opencode server per job, with guard rails (no git push, no credentials, no permission prompts) and an `opencode attach` command to watch it live.
- **Auto-start** — if opencode is not already listening on the configured port (default 4096), the server spawns `opencode serve` on that port in the background.
- **Session isolation** — each `query` call creates and destroys its own opencode session, so one-off questions leave nothing behind.
- **Works everywhere** — compatible with Claude Desktop, Claude Code, Cursor, Windsurf, VSCode, and any MCP-capable client.

## Install

```sh
npm install -g @kud/mcp-opencode
```

Requires [opencode](https://opencode.ai) installed with at least one provider configured, and Node.js ≥ 20.

## Usage

Add the server to your MCP client configuration:

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

To restrict which models are available, pass environment variables:

```json
{
  "mcpServers": {
    "opencode": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-opencode"],
      "env": {
        "MCP_OPENCODE_MODEL_ALLOW": "github-copilot/*",
        "MCP_OPENCODE_MODEL_BLOCK": "github-copilot/gpt-4o-mini"
      }
    }
  }
}
```
