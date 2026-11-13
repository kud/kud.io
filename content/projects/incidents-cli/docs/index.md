---
title: "incidents-cli"
description: "Which of the services you depend on are declaring trouble right now: vendor status pages in one terminal view"
---

Which of the services you depend on are declaring trouble right now: vendor status pages in one terminal view.

It reads each vendor's own status page, worst first, and tells you what they have **declared**. A green row is not proof your calls work; a page it cannot read is shown as `? unreadable` and counts as not green, never as fine.

![The overview: every service, worst first](https://raw.githubusercontent.com/kud/incidents-cli/HEAD/assets/overview.png)

![The board: a tally, a card per service in trouble, the rest in a grid](https://raw.githubusercontent.com/kud/incidents-cli/HEAD/assets/board.png)

![One service in detail: open incidents, affected components, earlier ones](https://raw.githubusercontent.com/kud/incidents-cli/HEAD/assets/detail.png)

## Install

```sh
npm install -g @kud/incidents-cli
```

Node 22 or later.

## Use

| Command                    | What it does                                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| `incidents`                | Interactive view: live list, worst first, rows fill in as they answer    |
| `incidents <service>`      | Interactive view opened on that service's detail                         |
| `incidents list [service]` | One-shot static output: the overview, or one service's detail            |
| `incidents services`       | One service per line: id, name, aliases (comma-separated), tab-separated |

Keys in the interactive view: `↑↓` or `j k` move, `⏎` opens a service, `←→` (or `tab`) moves between the status tabs (All, Trouble, then one per status), `/` searches names and aliases, `z` folds the operational services into one line, `v` switches between the list and the board, `s` sorts by status (worst first) or by name, `esc` clears a search or goes back, `⌫` goes back, `r` refreshes, `q` quits. The view and the sort are independent: either view works in either order, and the service name leads every row. Whenever a tab, the fold or a search hides services, a line under the list says how many and which key brings them back.

Add `--json` to any form for JSON records. With no TTY on stdin or stdout, or `CI` set, every form falls back to the static output (or JSON), so pipes, `$(...)` and cron never hang.

### Exit codes

| Code | Meaning                                                     |
| ---- | ----------------------------------------------------------- |
| 0    | All clear (maintenance and manual-link rows count as clear) |
| 1    | Something is degraded, or a page could not be read          |
| 2    | Usage or configuration error                                |

The interactive view exits 0 on quit.

## Configuration

`${XDG_CONFIG_HOME:-~/.config}/incidents/config.yml`, then every `config.d/*.yml` merged over it by service id, in lexical order. `INCIDENTS_CONFIG=<file>` replaces both.

```yaml
timeout: 4000 # milliseconds per request, default 4000
view: list # the view to open on: list (default) or board
sort: status # the order to open on: status, worst first (default), or name
services:
  github: {} # take the built-in entry as it is
  aws:
    regions: [us-east-1, us-west-2] # override fields of a built-in entry
  npm:
    enabled: false # drop one
  acme:
    name: Acme # a full entry defines a new service
    kind: statuspage
    url: https://status.acme.example
    aliases: [ac]
```

With no config file the defaults are `github`, `npm`, `cloudflare` and `claude`, and one muted line names the config path.

`list`, `services` and `help` are reserved words and cannot be a service id or alias; loading fails with exit 2 and a message naming the file and the id. Any other configuration error also exits 2.

### Built-in services

`github`, `claude`, `openai`, `vercel`, `cloudflare`, `npm`, `docker`, `figma`, `linear`, `notion`, `gandi`, `todoist`, `bluesky`, `jira`, `confluence`, `bitbucket`, `sentry`, `harness`, `datadog`, `slack`, `aws`.

### Kinds

| Kind         | Reads                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `statuspage` | Atlassian Statuspage v2: `<url>/api/v2/summary.json`, history from `<url>/history.rss`                   |
| `rss`        | An incident feed only. Current state comes from how recent the last post is (`window`, hours, default 6) |
| `slack`      | Slack's status API                                                                                       |
| `aws`        | AWS Health's public event list; `regions` narrows it, global events always count                         |
| `link`       | No machine-readable page: the row points at `url` and claims nothing                                     |

Other fields: `aliases`, `note` (printed under the detail), `timeout` (per service, milliseconds).

## JSON records

`incidents list --json` prints an array, worst first. `incidents list <service> --json` prints one record, with its history loaded.

```json
{
  "id": "github",
  "name": "GitHub",
  "url": "https://www.githubstatus.com",
  "kind": "statuspage",
  "fetched": "ok",
  "indicator": "minor",
  "description": "Partially Degraded Service",
  "components": [{ "name": "API", "status": "degraded_performance" }],
  "active": [
    {
      "title": "Elevated API errors",
      "link": "https://stspg.io/abc",
      "date": "2026-01-01T10:00:00Z",
      "impact": "minor"
    }
  ],
  "recent": [{ "title": "Earlier incident", "link": "https://…", "date": "…" }],
  "historyLoaded": true,
  "historyFailed": false,
  "note": ""
}
```

| Field           | Meaning                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `fetched`       | `ok`, or `failed` when the page could not be read                                                         |
| `indicator`     | `critical`, `major`, `unknown`, `minor`, `maintenance`, `none` or `link`, worst first in that order       |
| `components`    | Components with their raw vendor status; `operational` ones are included                                  |
| `active`        | Incidents open now                                                                                        |
| `recent`        | Past incidents, newest first; empty until history is loaded                                               |
| `historyLoaded` | `true` once history was requested for this record                                                         |
| `historyFailed` | `true` when the history feed could not be read, so an empty `recent` is not a claim that nothing happened |

`unknown` means the page could not be read. It sorts above every healthy row and fails the exit code.

## Environment

| Variable           | Effect                                             |
| ------------------ | -------------------------------------------------- |
| `INCIDENTS_CONFIG` | A single config file, replacing the default lookup |
| `NO_COLOR`         | Plain output                                       |
| `CI`               | Forces the static output                           |

Requests identify themselves as `incidents-cli/<version>`.

## Development

```sh
npm install
npm run dev -- --mock
npm test
```

`--mock` swaps every data source for fixtures; `--screen <name>` opens straight on a screen (`--screen list` prints the names).

`scripts/screenshots.zsh` regenerates the images above from the same fixtures (needs [vhs](https://github.com/charmbracelet/vhs)).

## Licence

MIT
