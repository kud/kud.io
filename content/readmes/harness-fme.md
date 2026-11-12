---
title: "harness-fme"
description: "Headless Harness FME (Split) admin API client with a safe plan, backup, write and read-back engine for feature flag changes."
hasDocs: true
---

## Features

- **Results, not exceptions** — every call returns an `FmeResult`: `{ ok: true, data }` or `{ ok: false, message, status? }`
- **Key kept in a closure** — the API key is never stored on the client object, so logging or serialising the client cannot print it
- **Rate-limit aware** — optional request spacing, and 429s are retried by waiting out the window named in the `x-ratelimit-reset-seconds-org` / `-ip` headers
- **Broad resource coverage** — workspaces, environments, feature flags, flag definitions, classic and rule-based segments, and a flag URL builder
- **Honest paging** — pages are walked to the end by what the API actually returns, using `limit` (the API ignores `size`), never by what was asked for
- **A safe-write engine** — plan from reads only, take a backup before each write, write with a title and comment, read back and diff against the plan, stop at the first failure
- **A production gate** — writes stay a plan until you say go; an environment matching `/prod/i` also needs its exact name typed
- **Pure helpers** — diffing, definition normalisation, rollout classification and rollout-table builders
- **Zero runtime dependencies** — ESM only, Node.js 20 or later

Surface-agnostic by design: this package holds no terminal, no MCP and no prompts, just data, actions and the write engine. Three siblings sit on top of it:

- [`@kud/harness-fme-cli`](https://www.npmjs.com/package/@kud/harness-fme-cli) for the terminal
- [`@kud/harness-fme-ink`](https://www.npmjs.com/package/@kud/harness-fme-ink) for the interactive terminal UI
- [`@kud/mcp-harness-fme`](https://www.npmjs.com/package/@kud/mcp-harness-fme) for MCP clients

## Install

```sh
npm install @kud/harness-fme
```

Requires Node.js 20 or later. The package is ESM only.

## Usage
