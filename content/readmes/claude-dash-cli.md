---
title: "claude-dash-cli"
description: "📊 Pure-Rust terminal dashboard for Claude Code — live sessions, prompts and usage in real time"
hasDocs: true
---

## Features

A fast, minimal terminal dashboard for monitoring your [Claude Code](https://claude.ai/code) sessions in real time — built entirely in Rust.

- **Live session list** — every running Claude Code agent at a glance, grouped by status (waiting for approval → active → idle → ended)
- **Permission modals** — review and approve or deny tool permission requests (Edit, Write, Bash) without leaving the terminal
- **Usage panel** — today's cost, monthly spend and all-time totals, with a 7-day cost chart and token and model breakdowns, pulled from [ccusage](https://github.com/ryoppippi/ccusage)
- **Session management** — rename sessions, launch new ones (tmux window, iTerm2 tab, or Terminal.app), and clear ended ones
- **Auto-spawned daemon** — the background daemon starts on first launch, no separate step
- **Pure Rust** — a single binary, no Node.js or npm required

## Install

```sh
cargo install claude-dash
claude-dash install
```

## Usage

Run `claude-dash` — the TUI launches immediately and auto-spawns its background daemon on first run.

```console
◆ claude-dash  2 active  │  today $4.20 · 9.8M tok  month $52.10
┌──────────────────────────────────────────────────────────────────┐
│ Agents · 2 active · 4 total                                      │
│                                                                  │
│  ▶ ACTIVE                                                        │
│  ▶ ◆ abc12345  ~/projects/api  running  1m 42s                   │
│       Bash: cargo test --release                                 │
│    ● def56789  ~/projects/web  processing  28s                   │
│       ⠹ thinking…                                                │
│                                                                  │
│  ~ IDLE                                                          │
│    ○ gh901234  ~/projects/docs  idle  1h 03m                     │
│                                                                  │
│  ✗ ENDED                                                         │
│    ✗ ij567890  ~/projects/old  ended  3h 22m                     │
│                                                                  │
│──────────────────────────────────────────────────────────────────│
│ Usage  $4.20 today                                               │
│ Today        $4.20  ·  9.80M tok                                 │
│ This Month   $52.10  ·  136.20M tok                              │
│ All Time     $248.75  ·  612.40M tok   18 sessions               │
└──────────────────────────────────────────────────────────────────┘
[q] quit  [↑↓] select  [e] rename  [n] new  [r] refresh  ● connected
```
