---
title: "opencode-plugins"
description: "🔌 opencode plugins by kud"
---

The opencode counterpart of [kud/claude-plugins](https://github.com/kud/claude-plugins). Each plugin is a single TypeScript file, published to npm as `@kud/opencode-<name>`: name it in your opencode config, pinned to a version, and forget about it. There is no build step.

## Features

- **One file per plugin.** Read the whole thing in a sitting, copy it, tweak it.
- **Loaded as-is.** opencode runs the `.ts` directly: nothing to compile or bundle.
- **Typechecked.** Every plugin is checked against the real `@opencode-ai/plugin` and `@opentui/solid` types, so API drift shows up here before it shows up in your terminal.
- **Easy to switch off.** Each plugin registers under its own ID, so a single `plugin_enabled` entry turns it off without touching the rest of your setup.
- **Small and focused.** Plugins do one job and leave the rest of opencode alone.

## Plugins

| Plugin                             | Kind | What it does                                                                         |
| ---------------------------------- | ---- | ------------------------------------------------------------------------------------ |
| [quiet-home](https://github.com/kud/opencode-plugins/blob/HEAD/plugins/quiet-home) | TUI  | The home screen laid out like a session: logo top left, prompt docked at the bottom. |

## Install

Installation differs by plugin kind (TUI plugins go in `tui.json`, server plugins in `opencode.json`), so each plugin documents its own. For quiet-home, follow [plugins/quiet-home/README.md](https://github.com/kud/opencode-plugins/blob/HEAD/plugins/quiet-home/README.md).

## Development

```sh
git clone https://github.com/kud/opencode-plugins.git
cd opencode-plugins
npm install
npm run typecheck
```

`typecheck` runs `tsc --noEmit` and is the only script: there is no build and no test suite. Plugins live under `plugins/<name>/` as a single `.ts` file with its own `package.json` and README, and each is released by pushing a `<name>-v<version>` tag.

## License

MIT © [kud](https://github.com/kud)
