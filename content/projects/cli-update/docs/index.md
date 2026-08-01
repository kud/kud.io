---
title: "cli-update"
description: "Tell users when a @kud CLI has an update, without blocking startup or corrupting piped output"
---

## Features

- **Never blocks startup** — reads a cached answer from disk and returns instantly. A stale cache (24h by default) triggers a detached, `unref`'d background refresh; the fresh result appears on the _next_ run, never the current one.
- **Silent on non-TTY output** — returns `null` immediately whenever `process.stdout.isTTY` is false, so piped or redirected output (`duux status --json | jq`) is never touched.
- **Respects the ecosystem's opt-outs** — stays quiet when `CI` or `NO_UPDATE_NOTIFIER` is set, on top of its own config file.
- **Per-package or global opt-out** — `~/.config/kud/cli.json` supports a global `updateNotifier` flag and per-package overrides, with `disableNotices()` / `enableNotices()` to manage it programmatically from a CLI's own subcommand.
- **Real semver comparison** — uses the `semver` package to compare versions correctly, prereleases included, instead of a naive string check.
- **Never throws** — a broken network, an unreachable registry, or a read-only home directory all degrade silently to `null`/no-op. An update check can never break the CLI that calls it.

## Install

`@kud/cli-update` hasn't been published to npm yet — this is a pre-release library (`0.1.0`), still under review. Once it's published, install it as a normal dependency:

```sh
npm install @kud/cli-update
```

Until then, install straight from the repository:

```sh
npm install kud/cli-update
```

## Usage

Call `checkForUpdate` once at CLI startup, and print the notice yourself if one comes back:

```ts
import { checkForUpdate, formatNotice } from "@kud/cli-update"
import pkg from "../package.json" with { type: "json" }

const notice = await checkForUpdate({ name: pkg.name, version: pkg.version })
if (notice) console.error(formatNotice(notice))
```

`checkForUpdate` always resolves — it never rejects, and it never waits on the network. `formatNotice` turns the result into a single line:

```console
Update available: @kud/duux-cli 1.2.0 -> 1.3.0. Run `npm i -g @kud/duux-cli` to upgrade.
```

### Opting out

A CLI can expose its own `update --disable` subcommand on top of the config file at `~/.config/kud/cli.json`:

```ts
import { disableNotices, enableNotices, noticesEnabled } from "@kud/cli-update"

disableNotices()
disableNotices("@kud/duux-cli")
enableNotices("@kud/duux-cli")

noticesEnabled("@kud/duux-cli")
```

The first call turns off notices for every `@kud` CLI; passing a package name scopes it to just that one, and `enableNotices` reverses either. `noticesEnabled` reads the current state.

Per-package settings win over the global one. Users can reach the same switch directly, without any CLI-specific code, by editing the config file or setting `NO_UPDATE_NOTIFIER=1`:

```json
{
  "updateNotifier": false,
  "packages": {
    "@kud/duux-cli": true
  }
}
```

### API

```ts
type UpdateNotice = {
  name: string
  current: string
  latest: string
  command: string
}

checkForUpdate(options: { name: string; version: string; cacheHours?: number }): Promise<UpdateNotice | null>
formatNotice(notice: UpdateNotice): string
disableNotices(scope?: string): void
enableNotices(scope?: string): void
noticesEnabled(name: string): boolean
```

`cacheHours` defaults to `24` and controls how long a cached "latest version" answer is trusted before a background refresh is triggered.

## Development

```sh
git clone https://github.com/kud/cli-update.git
cd cli-update
npm install
npm run build
```

`npm test` runs the Vitest suite, `npm run build:watch` rebuilds on change, and `npm run typecheck` runs a type-only check with no emit.
