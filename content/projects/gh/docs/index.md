---
title: "gh"
description: "The @kud/gh family — GitHub PR tooling: core, Ink components, and CLIs."
---

The **gh family** — GitHub PR tooling as a layered, reusable ecosystem. A
surface-agnostic core, Ink components, and thin CLIs, so the logic lives once
and every surface (standalone command, cockpit dashboard, MCP) consumes it.

## Packages

| Package | Role | Version |
| --- | --- | --- |
| [`@kud/gh`](https://github.com/kud/gh/blob/HEAD/packages/gh) | **core** — `gh` CLI primitives, PR review comments, health, webhook logic | ![npm](https://img.shields.io/npm/v/@kud/gh?style=flat-square&label=&color=CB3837) |
| [`@kud/gh-ink`](https://github.com/kud/gh/blob/HEAD/packages/gh-ink) | **components** — controlled Ink panels, the inbox shell, whose-move banding, token→colour map | ![npm](https://img.shields.io/npm/v/@kud/gh-ink?style=flat-square&label=&color=CB3837) |
| [`@kud/gh-cockpit`](https://github.com/kud/gh/blob/HEAD/packages/gh-cockpit) | **app** — a configurable cockpit: your PRs, reviews and issues in one TUI | ![npm](https://img.shields.io/npm/v/@kud/gh-cockpit?style=flat-square&label=&color=CB3837) |
| [`@kud/gh-pr-comments`](https://github.com/kud/gh/blob/HEAD/packages/gh-pr-comments) | CLI — browse / reply / resolve review threads | ![npm](https://img.shields.io/npm/v/@kud/gh-pr-comments?style=flat-square&label=&color=CB3837) |
| [`@kud/gh-pr-health`](https://github.com/kud/gh/blob/HEAD/packages/gh-pr-health) | CLI — checks / reviews / merge-state for a PR | ![npm](https://img.shields.io/npm/v/@kud/gh-pr-health?style=flat-square&label=&color=CB3837) |
| [`@kud/gh-webhook-replay`](https://github.com/kud/gh/blob/HEAD/packages/gh-webhook-replay) | CLI — replay the latest `pull_request` webhook delivery | ![npm](https://img.shields.io/npm/v/@kud/gh-webhook-replay?style=flat-square&label=&color=CB3837) |

## Design

- **Core** (`tsc`, zero-UI): shells out to `gh` and returns plain data. The
  `ghGraphql` / `ghRest` primitives every tool used to reinvent now live here.
- **Ink layer** (`tsup`): presentation-only components — props in, no fetching,
  no input. The consuming surface owns selection, navigation, and loading.
- **App** (`@kud/gh-cockpit`): the cockpit's views and config surface, with no
  opinion about whose repos matter or which searches are tabs — the host says.
- **CLIs**: arg-parsing + mounting the Ink body over a core client.

The core emits **semantic tokens**; the Ink layer maps token → colour. Same seam
as `@kud/jenkins` → `@kud/jenkins-ink`.

Every layer's defaults are **empty rather than convenient**. A library that ranks
its author's repos first, or guesses where checkouts live, is wrong for its
second reader — so the host supplies all of it through `configureInbox`. See
[building a cockpit](https://github.com/kud/gh/blob/HEAD/packages/gh-cockpit#-build-your-own-cli).

## Development

```sh
npm install          # install all workspaces
npm run typecheck    # across packages
npm run test
npm run build
```

Versioning & publishing is per-package via [changesets](https://github.com/changesets/changesets):

```sh
npm run changeset          # record a change
npm run version-packages   # apply version bumps
npm run release            # build + publish changed packages
```

## Licence

MIT © Erwann Mest
