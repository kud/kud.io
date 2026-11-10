---
title: "opencode-sessions-cli"
description: "A TUI session manager for running opencode servers: list every session, attach with a keystroke, stop headless instances"
hasDocs: true
---

## Features

- **Every session, one list** — sessions from every running [opencode](https://opencode.ai) server on your machine, busiest first, then most recently updated
- **Focused by default** — shows only busy and recently updated (≤ 2 h) sessions; headless instances always show all their sessions
- **Attach with a keystroke** — `↵` hands the terminal to `opencode --server … --session …`; quit opencode and you land back in the list
- **Service, headless and windows** — finds the opencode v2 background service, headless instances from the [`@kud/mcp-opencode`](https://github.com/kud/mcp-opencode) registry, and any other opencode server listening locally (found with `lsof`), shown as windows
- **Safe stop** — `x` stops a headless instance after a `y` confirmation; the service and windows are never touched
- **Live state** — busy or idle comes from each server's active sessions, and the list refreshes every three seconds
- **Two names** — installs as `opencode-sessions` and the short alias `ocs`

## Install

Needs [opencode](https://opencode.ai) v2. v1 servers are not supported; stay on 0.x of this package for those.


```sh
npm install -g @kud/opencode-sessions-cli
```

Or run it once with `npx @kud/opencode-sessions-cli`.

## Usage

```console
$ ocs
```

One row per session: repo, title, state, age, and whether the server is the background service, a headless instance or a window, with its port.

| Key               | Action                                                           |
| ----------------- | ---------------------------------------------------------------- |
| `↑` `↓` / `j` `k` | Move                                                             |
| `↵`               | Attach to the session; quitting opencode returns you to the list |
| `x`               | Stop a headless instance (asks for `y` to confirm)               |
| `r`               | Refresh                                                          |
| `a`               | Toggle all sessions / recent only                                |
| `q`               | Quit                                                             |

Demo flags:

```console
$ ocs --mock
$ ocs --screen list
sessions
$ ocs --screen sessions
```

`--mock` runs on fixtures with no live data, `--screen list` prints the screen names, and `--screen <name>` opens directly on one.
