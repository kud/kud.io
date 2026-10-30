---
title: "opencode-plugins"
description: "🔌 opencode plugins by kud"
hasDocs: true
---

The opencode counterpart of [kud/claude-plugins](https://github.com/kud/claude-plugins). Each plugin is a single TypeScript file, published to npm as `@kud/opencode-<name>`: name it in your opencode config, pinned to a version, and forget about it. There is no build step.

These are opencode v2 plugins and need opencode 2.1.0 or later.

## Features

- **One file per plugin.** Read the whole thing in a sitting, copy it, tweak it.
- **Loaded as-is.** opencode runs the `.ts` directly: nothing to compile or bundle.
- **Typechecked.** Every plugin is checked against the real `@opencode/plugin` and `@opentui` types, so API drift shows up here before it shows up in your terminal.
- **Easy to switch off.** Each plugin registers under its own ID, so a single `-<id>` entry in `plugins` turns it off without touching the rest of your setup.
- **Small and focused.** Plugins do one job and leave the rest of opencode alone.

## Install

TUI plugins go in `~/.config/opencode/cli.json`. Name the package, pinned to a version:

```json
{
  "plugins": [
    "@kud/opencode-statusline@0.1.1",
    "@kud/opencode-shell-highlighting@0.1.0"
  ]
}
```

opencode installs them on the next start. Each plugin's README lists the built-ins it pairs with.
