---
title: "shui"
description: "🌊 Fluid terminal UI for Zsh — a design system for the shell"
---

## Features

- **Unified message API** — `shui message <type> <text>` covers success, error, warning, info, and muted in one consistent command
- **Token-based theme engine** — swap colours, icons, and styles via environment variables without touching component code; ships with `default`, `minimal`, and `plain` themes
- **Inline components** — `badge` and `pill` write to stdout without a newline, composing naturally inside `$(...)` expressions
- **Interactive prompts** — `confirm`, `select`, `radio`, `multiselect`, and `input` with keyboard navigation and sensible defaults
- **Progress & spinners** — `progress`, `spinner`, and `loader` with optional native iTerm2 dock-badge integration
- **Zero dependencies** — a single `source shui.zsh` is all you need; no npm, no brew, no external tools
- **NO_COLOR aware** — respects the [NO_COLOR](https://no-color.org/) convention and degrades gracefully to plain ASCII

## Install

Clone into a convenient location and source the entry point:

```sh
git clone https://github.com/kud/shui ~/.shui
```

Then add to your `.zshrc`:

```zsh
source ~/.shui/shui.zsh
```

Or source it inline at the top of any script:

```zsh
#!/usr/bin/env zsh
source "${0:A:h}/lib/shui/shui.zsh"
```

### Completion

`shui <TAB>` completes subcommands (with descriptions) and their values —
types, `theme` subcommands, `input --validate` rules, and more. Sourcing
`shui.zsh` in an interactive shell registers it automatically. For the
canonical setup, add the completions directory to `$fpath` before `compinit`:

```zsh
fpath+=(~/.shui/completions)
autoload -Uz compinit && compinit
```

## Usage

```console
$ shui message success "Deployment complete"
✅ Deployment complete

$ shui message error "Build failed"
❌ Build failed

$ shui message warning "Config file missing, using defaults"
⚠️  Config file missing, using defaults

$ shui message info "Fetching dependencies…"
ℹ️  Fetching dependencies…

$ label=$(shui badge "v0.4.4")
$ shui message success "Released ${label}"
✅ Released [v0.4.4]

$ shui confirm "Deploy to production?"
? Deploy to production? [y/N]
```

Switch icon sets with `SHUI_ICONS`:

```zsh
SHUI_ICONS=emoji   # default — requires Nerd Font
SHUI_ICONS=unicode # plain Unicode fallback
SHUI_ICONS=none    # no icons at all
```

## Development

```sh
git clone https://github.com/kud/shui.git
cd shui
```

Tasks are managed with [mise](https://mise.jdx.dev/):

```sh
mise run test   # run all test suites
mise run lint   # syntax-check all Zsh source files
mise run demo   # run the visual component demo
```
