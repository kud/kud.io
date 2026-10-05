---
title: "mcp-github-copilot"
description: "🤖 Query any GitHub Copilot model from Claude — no extra API key, uses your Copilot login"
hasDocs: true
---

## Features

- **No extra API key** — uses your existing GitHub Copilot CLI credentials automatically.
- **Any model** — target GPT-5, Codex, Claude Sonnet, or any model your subscription grants.
- **File and image attachments** — attach local files or base64 blobs alongside a prompt.
- **Model discovery** — list available models with context window limits and billing multipliers.
- **Streaming progress** — sends MCP progress notifications for each streamed chunk.

## Install

```sh
npm install -g @kud/mcp-github-copilot
```

## Usage

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "mcp-github-copilot": {
      "command": "mcp-github-copilot"
    }
  }
}
```
