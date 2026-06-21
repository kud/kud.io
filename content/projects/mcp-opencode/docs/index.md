---
title: "mcp-opencode"
description: "🔮 Query any model configured in opencode from Claude — zero API keys, auto-starts the server"
---

## Features

- **Zero API key** — routes prompts through a locally running opencode server, so no provider credentials are needed in your AI client.
- **Multi-model support** — any model configured in opencode is available; query GPT-4.1, Claude, Gemini, or any other supported provider.
- **Model filtering** — restrict or block models via `MCP_OPENCODE_MODEL_ALLOW` and `MCP_OPENCODE_MODEL_BLOCK` environment variables using glob-style patterns.
- **Auto-start** — if opencode is not already listening on port 4096, the server spawns it automatically in the background.
- **Session isolation** — each `query` call creates and destroys a dedicated opencode session, preventing state leakage between calls.
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

### Available tools

| Tool          | Description                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `query`       | Send a prompt to an opencode model. Accepts `prompt` (required) and `model` (optional, default: `github-copilot/gpt-4.1`). |
| `list_models` | List models available through the running opencode server. Accepts an optional `provider` filter (e.g. `anthropic`).       |

## Development

```sh
git clone https://github.com/kud/mcp-opencode.git
cd mcp-opencode
npm install
npm run build
npm test
```

Use the local `.mcp.json` to connect Claude Code to your dev build, or `npm run inspect` to open the MCP Inspector against the compiled output.

| Script            | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Run from source via `tsx`                   |
| `npm run build`   | Compile TypeScript to `dist/`               |
| `npm test`        | Run the Vitest test suite                   |
| `npm run inspect` | Open MCP Inspector against the built server |
