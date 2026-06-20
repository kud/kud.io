---
title: "mcp-trakt"
description: "🎬 Track TV & movies from Claude via Trakt — search, sync, rate, watchlist, check in & scrobble"
---

## Install

```bash
npx @kud/mcp-trakt@latest setup
```

This runs the Trakt OAuth device flow and saves your credentials to the macOS Keychain. Then add it to your MCP client:

```bash
claude mcp add trakt npx -- -y @kud/mcp-trakt@latest
```

## Development

```bash
npm run dev          # run directly with tsx, no build needed
npm run inspect:dev  # open the MCP Inspector against live tsx
npm run build        # compile TypeScript to dist/
npm run typecheck    # type-check without emitting
```

---

📚 **Full documentation → https://kud.io/projects/mcp-trakt/docs**

<div align="center">

Made with ❤️ for TV and movie fans

</div>
