---
title: "models-dev-cli"
description: "🤖 Explore the models.dev LLM catalogue in your terminal — fuzzy search, rich TUI, copy IDs"
---

## Install

```bash
# one-shot
npx -p @kud/models-dev-cli models-dev

# or install globally
npm i -g @kud/models-dev-cli
models-dev   # alias: mdl
```

The CLI fetches the live catalogue and opens a split-pane TUI by default. Prefer a non-interactive table? Pass `--ui table` or any flag.

## Development

```bash
git clone https://github.com/kud/models-dev-cli
cd models-dev-cli
npm install
npm link           # exposes `models-dev` and `mdl`
models-dev         # run locally
```
