---
title: "mcp-harness-fme"
description: "🚩 Manage Harness FME (Split.io) feature flags & segments from any MCP client — list, toggle, kill"
hasDocs: true
---

## Features

- **38 tools** — covers workspaces, environments, feature flags, flag definitions, segments, rule-based segments, and change requests.
- **Kill & restore** — instantly kill a flag to force all traffic to the default treatment, or restore it with a single tool call.
- **Safety guard** — every destructive operation (delete, kill, archive, disable) requires `confirm: true`, preventing accidental changes.
- **Rule-based segments** — create, update, enable, disable, and submit change requests for rule-based segments per environment.
- **Change request flow** — submit segment definition changes with optional approvers for teams that require approval gates.
- **Zero-config startup** — reads `MCP_HARNESS_FME_API_KEY` from the environment and exits immediately if it is missing.

## Install

Add to your MCP client config (see Usage below), or install globally to run manually:

```sh
npx --yes @kud/mcp-harness-fme@latest
```

Set the environment variable `MCP_HARNESS_FME_API_KEY` to your Harness FME API key before starting the server.

## Usage

This is a standard stdio MCP server — it works with any MCP client (Claude Desktop, Claude Code, Cursor, Windsurf, Cline, Zed, …). Add it to your client's MCP config:

```json
{
  "mcpServers": {
    "harness-fme": {
      "command": "npx",
      "args": ["--yes", "@kud/mcp-harness-fme@latest"],
      "env": {
        "MCP_HARNESS_FME_API_KEY": "your_api_key"
      }
    }
  }
}
```

Most clients read this `mcpServers` shape — Claude Desktop's config file, Cursor's `.cursor/mcp.json`, Windsurf, Cline, and so on. For **Claude Code**, there's a CLI shortcut:

```sh
claude mcp add --transport stdio --scope user harness-fme \
  --env MCP_HARNESS_FME_API_KEY=your_api_key \
  -- npx --yes @kud/mcp-harness-fme@latest
```

To enable the `get_flag_url` deep-link tool, also set two optional keys — add them to the `env` block above (or as extra `--env` flags for the CLI). See [Configuration](#configuration) for where to find their values.

```json
"env": {
  "MCP_HARNESS_FME_API_KEY": "your_api_key",
  "MCP_HARNESS_FME_ACCOUNT_ID": "your_account_id",
  "MCP_HARNESS_FME_ORG_GUID": "your_org_guid"
}
```

Leave them out and every other tool still works — `get_flag_url` just reports what's missing.
