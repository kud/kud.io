---
title: "claude-dash-cli"
description: "📊 Pure-Rust terminal dashboard for Claude Code — live sessions, prompts and usage in real time"
---

A fast, minimal terminal dashboard for monitoring your [Claude Code](https://claude.ai/code) sessions in real time — built entirely in Rust.

```
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

## Install

```bash
cargo install claude-dash
claude-dash install
```

Then run `claude-dash` — the TUI launches immediately and auto-spawns its background daemon on first run.

## Development

```bash
git clone https://github.com/kud/claude-dash-cli
cd claude-dash-cli
cargo build
cargo run
```
