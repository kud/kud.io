---
title: "mcp-opencode"
description: "🔮 Query any model configured in opencode from Claude — zero API keys, auto-starts the server"
---

## Features

- **Zero API key** — routes prompts through a locally running opencode server, so no provider credentials are needed in your AI client.
- **Multi-model support** — any model configured in opencode is available; query GPT-4.1, Claude, Gemini, or any other supported provider.
- **Model filtering** — restrict or block models via `MCP_OPENCODE_MODEL_ALLOW` and `MCP_OPENCODE_MODEL_BLOCK` environment variables using glob-style patterns.
- **Talk to a live session** — `list_sessions`, `send` and `read` let your assistant hold a conversation with a running opencode session, such as the one open in your TUI, and the exchange shows up there live.
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

### Talking to a live opencode session

A plain `opencode` opens no port, so the MCP can't see it. Give each window a port and the MCP finds it on its own (it looks for listening opencode processes with `lsof`), so several windows work at once.

**1. Start opencode with a port.** Any free one from 4097 up; 4096 is kept for the MCP's own background server, which `query` uses, so its throwaway sessions never land in your windows.

```sh
opencode --port 4097
```

To stop thinking about ports, add this to your `~/.zshrc` or `~/.bashrc`. `oc` then picks the next free port for every window, and an explicit `--port` still wins:

```sh
oc() {
  case " $* " in *" --port "*|*" --port="*) opencode "$@"; return ;; esac
  local port
  for port in $(seq 4097 4196); do
    lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1 || {
      opencode --port "$port" --hostname 127.0.0.1 "$@"
      return
    }
  done
  opencode "$@"
}
```

**2. Say something in the window.** opencode only creates a session once you send the first message.

**3. Ask your assistant to talk to it.** For example: _"list my opencode sessions and ask the one in my-project what it thinks of this plan"_. It calls `list_sessions` to find the session, `send` to talk to it, and `read` to catch up on its history. Messages appear live in that window, and you can reply there yourself.

If the same project is open in two windows, `send` goes to the lowest port and says so. Pass `port` to choose.

### Environment variables

| Variable                    | Default                 | Purpose                                                                                                                                 |
| --------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `MCP_OPENCODE_URL`          | `http://127.0.0.1:4096` | Pin one opencode server instead of discovering windows (and the server `query` spawns if nothing listens on its port)                   |
| `MCP_OPENCODE_SEND_TIMEOUT` | `600`                   | Seconds `send` waits for a reply before handing back and letting you `read` it later                                                    |
| `MCP_OPENCODE_MODEL_ALLOW`  | all                     | Comma-separated models or `provider/*` patterns `query` may use                                                                         |
| `MCP_OPENCODE_MODEL_BLOCK`  | none                    | Comma-separated models or patterns to block. Filters apply to `query` and `list_models`, not `send`, which uses the session's own model |

### Available tools

| Tool            | Description                                                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `query`         | Send a prompt to an opencode model. Accepts `prompt` (required) and `model` (optional, default: `github-copilot/gpt-4.1`).                                                                                                     |
| `list_models`   | List models available through the running opencode server. Accepts an optional `provider` filter (e.g. `anthropic`).                                                                                                           |
| `list_sessions` | List sessions across every discovered opencode window, most recent first, with the port each is on. Accepts an optional `directory` filter.                                                                                    |
| `send`          | Send a message to an existing session and return the reply. Accepts `session_id`, `prompt`, and optional `agent`, `port` and `timeout_seconds`. Routes to the window that owns the session. Never creates or deletes sessions. |
| `read`          | Read a session's recent messages as a condensed transcript. Accepts `session_id` and optional `limit` (default 20) and `port`.                                                                                                 |

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
