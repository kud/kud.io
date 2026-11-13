---
title: "gh"
description: "The @kud/gh family — GitHub PR tooling: core, Ink components, and CLIs."
hasDocs: true
---

## Features

The **gh family** — GitHub PR tooling as a layered, reusable ecosystem. A surface-agnostic core, Ink components, and thin CLIs, so the logic lives once and every surface (standalone command, cockpit dashboard, MCP) consumes it.

- **Surface-agnostic core** — shells out to `gh` and returns plain data, with the `ghGraphql` / `ghRest` primitives every tool used to reinvent
- **Ink components** — presentation-only panels, the inbox shell and whose-move banding
- **A configurable cockpit** — your PRs, reviews and issues in one TUI
- **Thin CLIs** — browse and resolve review threads, check a PR's health, replay a webhook delivery
- **Empty defaults** — the host supplies every opinion, nothing assumes its author's repos

## Install

Each package installs on its own (Node.js >= 22):

```sh
npm install -g @kud/gh-pr-comments
npm install -g @kud/gh-pr-health
npm install -g @kud/gh-webhook-replay
npm install @kud/gh @kud/gh-ink @kud/gh-cockpit
```
