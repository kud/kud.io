---
title: "pcloud"
description: "☁️ Typed pCloud API client with OAuth and session auth — shared core for CLI, MCP and TUI surfaces"
hasDocs: true
---

## Features

Typed pCloud API client — shared SDK for CLI, MCP, and extensions.

- **Two ways in** — username and password (two-factor included) or an OAuth access token, with a stored credential resolved for you
- **Files and folders** — list, stat, create, copy, move, rename, delete, checksums and download links
- **Recovery** — revisions, trash, and a Rewind replay engine built from the change log, since pCloud exposes no Rewind API
- **Sharing** — folder shares and requests, public links, zip downloads
- **Fully typed** — every method returns a typed promise, every type exported from the root

## Install

```sh
npm install @kud/pcloud
```

Requires Node.js 20 or later.

## Usage
