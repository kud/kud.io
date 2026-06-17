---
title: "claude-dash-cli"
description: "Terminal dashboard for monitoring Claude Code sessions in real time"
---

A fast, minimal terminal dashboard for monitoring your [Claude Code](https://claude.ai/code) sessions in real time.

Built entirely in Rust with [Ratatui](https://ratatui.rs). Zero lag, no Electron, no browser, no Node.js.

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

## Features

- **Live session list** — see all running Claude Code agents at a glance, grouped by status (waiting for approval → active → idle → ended)
- **Permission modals** — review and approve/deny tool permission requests (Edit, Write, Bash) without leaving the terminal
- **Usage panel** — today's cost, monthly spend, all-time totals, 7-day cost chart, token breakdown and model breakdown — all pulled from [ccusage](https://github.com/ryoppippi/ccusage)
- **Usage cache** — usage data is persisted locally so it appears instantly on next launch
- **Animated indicators** — braille spinner `⠋⠙⠹⠸⠼⠴⠦⠧` while agents are thinking, Nerd Font section icons
- **Session management** — rename sessions, launch new Claude sessions (tmux window, iTerm2 tab, or Terminal.app), clear ended sessions
- **Auto-spawns daemon** — `claude-dash daemon` starts automatically on first launch; no separate step needed
- **Mouse support** — scroll the agent list with the mouse wheel
- **Pure Rust** — single binary, no Node.js or npm required

## Requirements

- macOS (Linux should work for the TUI; `osascript` session launch only works on macOS)
- [Claude Code](https://claude.ai/code) installed
- A [Nerd Font](https://www.nerdfonts.com) terminal font for icons (optional but recommended)

## Installation

### From crates.io

```bash
cargo install claude-dash
claude-dash install
```

### From source

```bash
git clone https://github.com/kud/claude-dash-cli
cd claude-dash-cli/tui
cargo install --path .
claude-dash install
```

## Usage

```bash
claude-dash
```

The TUI launches immediately. The daemon is auto-spawned in the background on first run.

To install hooks manually (if you reinstall or update the binary):

```bash
claude-dash install
```

### Keybindings

| Key       | Action                                                                         |
| --------- | ------------------------------------------------------------------------------ |
| `↑` / `k` | Select previous session                                                        |
| `↓` / `j` | Select next session                                                            |
| `a`       | Allow pending permission                                                       |
| `s`       | Allow permission for this session (auto-approve future requests for same tool) |
| `d`       | Deny pending permission                                                        |
| `e`       | Rename selected session                                                        |
| `n`       | Launch a new Claude session                                                    |
| `r`       | Refresh usage data                                                             |
| `x`       | Clear ended sessions                                                           |
| `q`       | Quit                                                                           |
| `Q`       | Quit and kill daemon                                                           |

## Architecture

```
claude-dash-cli/
└── tui/
    └── src/
        ├── main.rs         # CLI dispatch (clap), TUI event loop, daemon spawn
        ├── app.rs          # TUI app state, key handling, usage cache
        ├── types.rs        # Shared domain types
        ├── daemon.rs       # Unix socket client (TUI ↔ daemon)
        ├── usage.rs        # ccusage + Anthropic API rate limits
        ├── utils.rs        # Formatting helpers
        ├── cmd/
        │   ├── daemon.rs   # Daemon process — two Unix socket servers, state machine
        │   ├── hook.rs     # Claude Code hook handler — reads stdin, fires events
        │   └── install.rs  # Hook installer — writes ~/.claude/settings.json
        └── ui/
            ├── mod.rs          # Layout
            ├── header.rs       # Top bar
            ├── footer.rs       # Key hints bar
            ├── session_list.rs # Agent list with status groups
            ├── usage_panel.rs  # Cost/token/chart panel
            └── overlays.rs     # Permission modal, new session, rename
```

Two Unix sockets connect the pieces:

- `/tmp/claude-dash.sock` — hook processes send events here (fire-and-forget, or await decision for PermissionRequest)
- `/tmp/claude-dash-tui.sock` — TUI connects here to receive state snapshots/deltas and send permission decisions

Claude Code hooks trigger `claude-dash hook` on every tool use. The daemon tracks session state and pushes updates to all connected TUI clients over newline-delimited JSON.

## License

MIT
