---
title: "claude-sessions-cli"
description: "🗂️ TUI session manager for Claude Code — browse, resume, organise and clean up every session"
---

## Features

- **Three-tab interface** — Code sessions grouped by project, Chat sessions with pins and tag folders, and a Scheduled tab.
- **Instant resume** — press `enter` on any session and Claude Code opens right where you left off, using the correct flag automatically.
- **Pin and tag chat sessions** — star important chats to the top, group others into collapsible `#tag` folders.
- **Auto CLAUDE.md creation** — new chat sessions get a `CLAUDE.md` bootstrapped automatically; preview any session's file in-place with `m`.
- **Clean mode** — interactive cleanup of ghost entries, history-less projects, and orphaned history folders.
- **Live search** — filter sessions by name or path as you type with `/`.

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
