---
title: "ai-conventional-commit-cli"
description: "🤖 AI Conventional Commits that learn your repo's style — generate, split and refine messages"
---

## Features

- **AI-generated conventional commits** — reads your staged diff and produces a Conventional Commits-compliant message in one command.
- **Smart commit splitting** — clusters hunks semantically and proposes multiple atomic commits, each selectively staged and applied.
- **Gitmoji style support** — `standard`, `gitmoji` (emoji + type), and `gitmoji-pure` (emoji only) modes out of the box.
- **Refine & reword** — iteratively reshape the last commit's wording, or reword any past commit by hash or interactive pick.
- **Plugin system** — register custom `transform` and `validate` hooks to enforce team conventions or post-process candidates.
- **Privacy-aware diff filtering** — three tiers (`low` / `medium` / `high`) control exactly how much code is sent to the model.

## Install

```sh
npm install -g @kud/ai-conventional-commit-cli
```

## Usage

```console
$ git add .
$ ai-conventional-commit
✔ feat(api): add pagination metadata to list endpoint

$ ai-conventional-commit split
1. refactor(parser): simplify token scanning
2. feat(parser): support negated glob segments
3. test(parser): add cases for brace + extglob combos

$ ai-conventional-commit refine --shorter
$ ai-conventional-commit refine --scope ui
$ ai-conventional-commit reword HEAD
$ ai-conventional-commit models --interactive --save
$ ai-conventional-commit config set style gitmoji
```

## Development

```sh
git clone https://github.com/kud/ai-conventional-commit-cli.git
cd ai-conventional-commit-cli
npm install
npm run dev -- generate
```
