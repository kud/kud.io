---
title: "mcp-google-keep"
description: "📝 Read & write Google Keep notes from Claude — search, create, checklists, labels & colours"
---

> Search, create, and manage your Google Keep notes directly from Claude, Cursor, or any MCP-compatible AI — 18 tools, credentials in the macOS Keychain.

## Install

```bash
uv tool install git+https://github.com/kud/mcp-google-keep
mcp-google-keep-setup
claude mcp add google-keep mcp-google-keep
```

`mcp-google-keep-setup` runs the one-time Google credential flow and stores your master token in the macOS Keychain.

## Development

```bash
git clone https://github.com/kud/mcp-google-keep.git
cd mcp-google-keep && uv sync
uv run python server.py        # start the MCP server
uv run python keep_setup.py    # run the credential setup flow
```

The server lives in `server.py` (FastMCP, all 18 tools); credential setup lives in `keep_setup.py`.
