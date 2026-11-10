---
title: "ding-cli"
description: "A tiny macOS alarm/timer CLI — set a relative or absolute time, get a notification and a sound when it fires"
hasDocs: true
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
