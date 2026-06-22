---
title: "claude-sessions-cli"
description: "🗂️ TUI session manager for Claude Code — browse, resume, organise and clean up every session"
---

## Features

- **Three-tab interface** — Code sessions grouped by project, Chat sessions with pins and tag folders, and a Scheduled tab.
- **Named sessions** — sessions with a Claude title display as `name · prompt` so you can tell them apart at a glance.
- **Named filter** — press `n` on the Code tab to show only named sessions.
- **Instant resume** — press `enter` on any session and Claude Code opens right where you left off, using `--resume`, `--continue`, or `--name` automatically.
- **Pin and tag chat sessions** — star important chats to the top, group others into collapsible `#tag` folders.
- **Auto CLAUDE.md creation** — new chat sessions get a `CLAUDE.md` bootstrapped automatically; preview any session's file in-place with `m`.
- **Clean mode** — run `claude-sessions clean` for interactive cleanup of ghost entries, history-less projects, and orphaned history folders.
- **Live search** — filter sessions by name or path as you type with `/`.
- **Move sessions** — relocate a session between project folders with `M`.
- **Rename sessions** — press `r` to rename any session in-place.
- **Session delete** — press `d` to delete a session or all sessions in a group.

![preview](https://raw.githubusercontent.com/kud/claude-sessions-cli/HEAD/assets/preview.png)

## Install

```sh
npm install -g @kud/claude-sessions-cli
```

## Usage

```console
$ claude-sessions
$ claude-sessions clean
$ claude-sessions --no-banner
```

## Development

```sh
git clone https://github.com/kud/claude-sessions-cli.git
cd claude-sessions-cli
npm install
npm run dev
```
