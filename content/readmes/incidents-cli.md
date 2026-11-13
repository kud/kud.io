---
title: "incidents-cli"
description: "Which of the services you depend on are declaring trouble right now: vendor status pages in one terminal view"
hasDocs: true
---

## Features

It reads each vendor's own status page, worst first, and tells you what they have **declared**. A green row is not proof your calls work; a page it cannot read is shown as `? unreadable` and counts as not green, never as fine.

- **One view of every vendor** — a list worst first, or a board with a card per service in trouble and the healthy ones in a grid
- **Honest about gaps** — an unreadable page is never shown as fine, and fails the exit code
- **Watch mode** — polls every few minutes and prints a line, or runs a command, only when a status changes
- **Scriptable** — `--json` on every form, meaningful exit codes, static output whenever there is no TTY
- **Configurable** — 21 built-in services, plus any Statuspage, RSS feed or plain link you add

![The board: a filter column that doubles as the tally, a card per service in trouble, the healthy ones in a grid](https://raw.githubusercontent.com/kud/incidents-cli/HEAD/assets/board.png)

![The list (v): every service, worst first, with a preview of the selected one](https://raw.githubusercontent.com/kud/incidents-cli/HEAD/assets/list.png)

![One service in detail: open incidents, affected components, earlier ones](https://raw.githubusercontent.com/kud/incidents-cli/HEAD/assets/detail.png)

## Install

```sh
npm install -g @kud/incidents-cli
```

Node 22 or later.
