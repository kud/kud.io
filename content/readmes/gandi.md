---
title: "gandi"
description: "Typed Gandi v5 REST API client — the headless core shared by @kud/gandi-cli and future Gandi surfaces"
hasDocs: true
---

## Features

The headless core shared by `@kud/gandi-cli`, a future `@kud/gandi-ink` browser UI, and potentially an MCP server. It talks to Gandi's domain, LiveDNS, and token-introspection endpoints and returns plain typed data. It has no CLI, no UI, and no opinion about how you present the result — that's every consumer's own job.

- **Domains** — list, fetch, availability check, renew, toggle autorenew.
- **LiveDNS records** — list, get, set (replace), add a value to an existing rrset, delete, export the whole zone as a BIND master file.
- **Web redirects** — list (auto-paginated, so a domain with more redirects than a single page never gets silently truncated), add, update, delete.
- **Token introspection** — check what a token can do and when it expires, before you find out the hard way.
- **API key resolution** — `GANDI_API_KEY` env var first, `~/.config/gandi/config.toml` as a fallback.
- **Injectable client** — the same functions wrapped as a `GandiAPI` object, so a consumer can accept `api?: GandiAPI` as a prop and swap in a mock for tests.
- **ESM-only** — fully typed, zero runtime dependencies beyond a TOML parser.

## Install

```sh
npm install @kud/gandi
```

Requires Node >=20.

## Usage
