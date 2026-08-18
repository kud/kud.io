---
title: "ding-cli"
description: "A tiny macOS alarm/timer CLI — set a relative or absolute time, get a notification and a sound when it fires"
---

Originally built to remember when Claude's usage quota resets — `ding 5h "quota is back"` and forget about it.

---

## 🌟 Features

- ⏱ **Relative and absolute times** — `5h`, `90m`, `1h30m`, `30s`, `14:30`, `2:30pm`, `9am`; absolute times already past today roll to tomorrow
- 🔔 **Desktop notifications** — zero-dependency setup; ships with `node-notifier` which vendors its own `terminal-notifier`, no `brew install` required
- 🔊 **Built-in alarm presets** — six synthesised sounds (`beep`, `digital`, `radar`, `bell`, `siren`, `chime`), macOS Clock ringtones (e.g. `Radial`, `Daybreak`, `Arpeggio`), macOS system sounds, or any audio file via `afplay`
- 🧙 **Interactive wizard** — `ding` with no arguments launches a tabbed TUI (When · Message · Sound · Notify · Mode · Review); press Space on the Sound step to preview before choosing
- 🔗 **Click-to-open notifications** — `--open https://claude.ai` makes the notification banner a shortcut to any URL
- ⚡ **Run a command when it fires** — `--exec 'npm run build'` acts without waiting for a human to notice; output is logged, and a non-zero exit sounds a distinct alarm and becomes `ding`'s own exit status
- 🖥 **Foreground and detached modes** — live countdown with progress bar by default; `--detach` backgrounds the process and returns the prompt immediately

---

## 🚀 Quick Start

Install globally:

```sh
npm install -g @kud/ding-cli
```

Or run without installing:

```sh
npx @kud/ding-cli 5h "quota is back"
```

Set a timer and watch the countdown:

```console
$ ding 90m "tea is ready"
ding → 16:37:22 · tea is ready
01:29:58 ▸ tea is ready
```

When it fires, the terminal rings (loops the alarm) until you press any key to dismiss, and a desktop notification pops up.

---

## 📖 CLI Reference

```
ding <time> [message] [options]
```

### Time formats

| Format              | Example  | Meaning                                    |
| ------------------- | -------- | ------------------------------------------ |
| Relative — hours    | `5h`     | 5 hours from now                           |
| Relative — minutes  | `90m`    | 90 minutes from now                        |
| Relative — seconds  | `30s`    | 30 seconds from now                        |
| Relative — compound | `1h30m`  | 1 hour 30 minutes from now                 |
| Bare number         | `45`     | 45 minutes from now                        |
| 24-hour clock       | `14:30`  | fires at 14:30 today (or tomorrow if past) |
| 12-hour clock       | `2:30pm` | fires at 14:30                             |
| Hour only           | `9am`    | fires at 09:00                             |

### Options

| Flag                    | Alias | Description                                                                                                                                                                                                                                |
| ----------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--detach`              | `-d`  | Background the process; prints fire time then returns the prompt                                                                                                                                                                           |
| `--sound <value>`       | `-s`  | Alarm preset (`beep` `digital` `radar` `bell` `siren` `chime`), macOS Clock ringtone name (e.g. `Daybreak`; quote names with spaces like `"Milky Way"`), macOS system sound name (e.g. `Glass`), or path to an audio file. Default: `bell` |
| `--no-sound`            |       | Disable alarm sound entirely                                                                                                                                                                                                               |
| `--no-notify`           |       | Disable desktop notification                                                                                                                                                                                                               |
| `--title <text>`        |       | Notification title (default: `ding`)                                                                                                                                                                                                       |
| `--subtitle <text>`     |       | Notification subtitle                                                                                                                                                                                                                      |
| `--icon <path>`         |       | Absolute path to a custom notification icon image                                                                                                                                                                                          |
| `--open <url>`          |       | URL to open when the notification banner is clicked                                                                                                                                                                                        |
| `--notify-sound <name>` |       | Notification banner sound (e.g. `Glass`, `Ping`) — distinct from `--sound`, which plays via `afplay`                                                                                                                                       |
| `--exec <command>`      |       | Shell command to run when the timer fires, via `/bin/sh -c`, inheriting `ding`'s environment. Output is appended to `~/Library/Logs/ding/exec.log` (override with `DING_EXEC_LOG`). Does not imply `--detach`                              |
| `--exec-fail-sound <v>` |       | Sound played when `--exec` exits non-zero (default: `siren`). Same values as `--sound`; silenced by `--no-sound`                                                                                                                            |
| `--icons <mode>`        |       | Icon set: `nerd` (default, requires Nerd Font), `emoji`, or `ascii`. Also set via `DING_ICONS` env var                                                                                                                                     |
| `-i` / `--interactive`  |       | Force-launch the interactive wizard                                                                                                                                                                                                        |
| `--help`                | `-h`  | Show help                                                                                                                                                                                                                                  |
| `--version`             | `-V`  | Show version                                                                                                                                                                                                                               |

### Examples

```sh
# Relative timer with a message
ding 90m "tea is ready"

# Absolute time
ding 14:30 "stand-up"

# Fires at 9 am — rolls to tomorrow if 9 am has already passed
ding 9am

# Open claude.ai when the notification is clicked
ding 5h "quota is back" --open https://claude.ai --subtitle "Anthropic"

# Background the process, return the prompt immediately
ding 5h "quota is back" --detach

# Silent notification (no alarm sound)
ding 30m "check the oven" --no-sound

# Run a command when the timer fires
ding 25m --exec 'npm run build'

# Fire-and-forget: no banner, no countdown, just the command
ding 21:40 --detach --no-notify --exec 'say "quota is back"'

# macOS Clock alarm ringtone (played locally via afplay; quote names with spaces)
ding 5h "wake" --sound Daybreak
ding 5h "wake" --sound "Milky Way"

# Notification banner's own macOS sound (separate from the afplay alarm)
ding 30m "stand-up" --notify-sound Glass

# Custom audio file
ding 20m "deploy done" --sound ~/Downloads/alert.aiff

# Use emoji icons (no Nerd Font required)
ding 5m "test" --icons emoji

# Or set permanently in your shell profile
export DING_ICONS=emoji
```

### Recipe: ring when Claude's usage quota resets

`ding` was born to time Claude's 5-hour usage window — but instead of guessing
`5h`, read the _exact_ reset time from [ccusage](https://github.com/ryoppippi/ccusage),
which parses Claude Code's local logs. Pipe its active-block `remainingMinutes`
straight into `ding`:

```sh
mins=$(ccusage blocks --active --json --offline | node -e 'const {blocks=[]}=JSON.parse(require("node:fs").readFileSync(0));const a=blocks.find(b=>b.isActive);process.stdout.write(String(a?.projection?.remainingMinutes??""))')
[ -n "$mins" ] && ding "${mins}m" "Claude quota is back 🎉"
```

`--offline` keeps it fast (no network), and `remainingMinutes` is already
relative, so there is no timezone maths to get wrong.

### Interactive wizard

Running `ding` with no time argument (or with `-i`) launches a tabbed wizard:

```
ding  When · Message · Sound · Notify · Mode · Review
```

Navigate between tabs with `←` / `→`. On the **Sound** step, use `↑` / `↓` to browse presets, macOS Clock ringtones, and system sounds, and press `Space` to preview a sound before confirming with `↵`.

### Icon sets

The countdown display and fired state use glyphs from the active icon set:

| Mode    | Activate                              | Requires                                                       |
| ------- | ------------------------------------- | -------------------------------------------------------------- |
| `nerd`  | default                               | a [Nerd Font](https://www.nerdfonts.com)-patched terminal font |
| `emoji` | `--icons emoji` or `DING_ICONS=emoji` | any modern terminal                                            |
| `ascii` | `--icons ascii` or `DING_ICONS=ascii` | nothing                                                        |

`--icons` takes precedence over `DING_ICONS`. If your font is not Nerd Font-patched, add `export DING_ICONS=emoji` to your shell profile.

### Foreground mode (default)

Without `--detach`, the terminal renders a live countdown. When the timer fires it rings continuously until you press any key:

```console
$ ding 5m "quota is back"
ding → 16:42:00 · quota is back
04:59:58 ▸ quota is back
```

### Detach mode

```console
$ ding 5h "quota is back" --detach
ding → 21:00:00 (detached)
$
```

The process runs silently in the background and fires the notification and alarm at the target time — no terminal required.

---

## 🔧 Development

```
ding-cli/
├── src/
│   ├── index.ts          # CLI entry point and argument definitions
│   ├── countdown.ts      # Foreground countdown rendering loop
│   ├── detach.ts         # Background process spawning
│   ├── icons.ts          # Icon sets (nerd / emoji / ascii)
│   ├── notify.ts         # Desktop notification wrapper
│   ├── parse-time.ts     # Relative and absolute time parsing
│   ├── preview-sound.ts  # Sound preview during wizard
│   ├── sounds.ts         # Alarm presets (WAV synthesis) + system sound resolution
│   ├── ui/               # TUI primitives (tabs, footer hints)
│   └── wizard/           # Interactive wizard (Ink/React)
└── dist/                 # Compiled output (tsup → ESM)
```

### Scripts

| Command               | Description                            |
| --------------------- | -------------------------------------- |
| `npm run dev`         | Run from TypeScript source via `tsx`   |
| `npm run build`       | Compile to `dist/` with `tsup`         |
| `npm run build:watch` | Watch mode compilation                 |
| `npm run typecheck`   | TypeScript type-check without emitting |
| `npm run lint`        | ESLint                                 |
| `npm run format`      | Prettier                               |

### Setup

```sh
git clone https://github.com/kud/ding-cli.git
cd ding-cli
npm install
npm run dev -- 5s "test alarm"
```

After `npm link`, the `ding` binary resolves to the compiled `dist/index.js` (run `npm run build` first).

---

## 🏗 Tech Stack

| Package                                                      | Role                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| [`ink`](https://github.com/vadimdemedes/ink)                 | React renderer for the terminal                           |
| [`@inkjs/ui`](https://github.com/vadimdemedes/ink)           | Text input and select components                          |
| [`citty`](https://github.com/unjs/citty)                     | CLI argument parsing                                      |
| [`node-notifier`](https://github.com/mikaelbr/node-notifier) | macOS desktop notifications (vendors `terminal-notifier`) |
| [`chalk`](https://github.com/chalk/chalk)                    | Terminal colour output                                    |
| [`tsup`](https://github.com/egoist/tsup)                     | ESM build                                                 |
| [`tsx`](https://github.com/privatenumber/tsx)                | TypeScript execution for development                      |

---

MIT © [kud](https://github.com/kud) — Made with ❤️
