---
title: "shui"
description: "🌊 Fluid terminal UI for Zsh — a design system for the shell"
---

**shui** = Shell UI. 水 = water in Chinese — fluid, effortless, takes the shape of its container.

Most Zsh scripts scatter raw `echo -e "\033[32m..."` calls everywhere. shui gives you a proper design system instead — semantic components, a token-based theme engine, and a single consistent API. One file to source. No dependencies. Pure Zsh.

## ✨ Features

- **Unified message API** — `shui message <type> <text>` covers success, error, warning, info, and muted in a single consistent command
- **Token-based theme engine** — swap colours, icons, and styles via environment variables without touching component code
- **Inline components** — `badge` and `pill` write to stdout without a newline, composing naturally inside `$(...)` expressions
- **Interactive prompts** — `confirm`, `select`, `radio`, `multiselect`, and `input` with keyboard navigation and sensible defaults
- **Progress & spinners** — `progress`, `spinner`, and `loader` with optional native iTerm2 dock badge integration
- **Zero dependencies** — a single `source shui.zsh` is all you need; no npm, no brew, no external tools
- **NO_COLOR aware** — respects the [NO_COLOR](https://no-color.org/) convention; degrades gracefully to plain ASCII

## 🚀 Quick Start

```zsh
git clone https://github.com/kud/shui ~/.shui
source ~/.shui/shui.zsh

shui message success "Deployment complete"
shui message error   "Build failed"
```

```console
✅ Deployment complete
❌ Build failed
```

In a script:

```zsh
#!/usr/bin/env zsh
source "${0:A:h}/lib/shui/shui.zsh"
```

## 📖 Documentation

Full component reference, theming, icon sets, installation methods, and configuration live on the docs site:

**→ [kud.io/projects/shui/docs](https://kud.io/projects/shui/docs)**

## 🔧 Development

Tasks are managed with [mise](https://mise.jdx.dev/):

```zsh
mise run test   # run all test suites
mise run lint   # syntax-check all Zsh source files
mise run demo   # run the visual component demo
```

## Requirements

- Zsh 5.0+
- A [Nerd Font](https://www.nerdfonts.com/) for the `default`/`minimal` themes — or use `SHUI_ICONS=emoji`

## License

MIT © [kud](https://github.com/kud) — Made with ❤️
