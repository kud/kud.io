---
title: "mcp-github-copilot"
description: "🤖 Query any GitHub Copilot model from Claude — no extra API key, uses your Copilot login"
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

### Tools

| Tool          | Description                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`       | Send a prompt to a Copilot model and return the response. Accepts an optional `model` name and optional `attachments` (file paths or base64 blobs). |
| `list_models` | List all available Copilot models with capabilities, context window limits, and billing multipliers.                                                |

## Development

```sh
git clone https://github.com/kud/mcp-github-copilot.git
cd mcp-github-copilot
npm install
npm run dev
```
