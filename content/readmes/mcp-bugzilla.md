---
title: "mcp-bugzilla"
description: "🐞 Search, triage and comment on Firefox/Mozilla bugs from Claude via the Bugzilla REST API"
---

## Install

```bash
npx @kud/mcp-bugzilla
```

Or register it with Claude Desktop:

```json
{
  "mcpServers": {
    "mcp-bugzilla": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-bugzilla"],
      "env": {
        "MCP_BUGZILLA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Read-only without a key; add `MCP_BUGZILLA_API_KEY` to create, update, and
comment. Per-editor guides live in the docs.

## Development

```bash
npm install
npm run build      # compile TypeScript to dist/
npm test           # run the test suite
npm run typecheck  # type-check without emitting
npm run inspect:dev # open MCP Inspector against source
```

Follow the existing tool handler pattern: an exported arrow function registered
with `server.registerTool`. Run `npm run typecheck` and `npm test` before
committing.

## License

MIT — see [LICENSE](https://github.com/kud/mcp-bugzilla/blob/HEAD/LICENSE).
