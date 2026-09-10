---
title: "jira-cli"
description: "Jira on the command line — read issues, comments and attachments as plain text"
---

Jira on the command line. Reads issues, comments and **attachments** as plain text, so you can pipe them into anything.

Black and white output, `--json` on every read, stable exit codes. Every subcommand is plain and pipeable — the interactive view lives behind the bare `jira` command and nowhere else.

## Install

```sh
npm install -g @kud/jira-cli
```

## Setup

Only the token is a secret, so only the token comes from the environment:

```sh
export ATLASSIAN_API_TOKEN=...   # id.atlassian.com/manage-profile/security/api-tokens
jira init --base-url myorg.atlassian.net --email you@example.com
```

That writes `~/.config/jira/config.json`. `ATLASSIAN_BASE_URL` and `ATLASSIAN_USER_EMAIL` override it when you need a second instance.

## Attachments

The thing most Jira CLIs skip. Attachments are listed with the comment they came from, and text ones print straight to stdout:

```sh
jira attachment list ABC-123
# ID      FILENAME     SIZE   TYPE        FROM
# 292542  error.log    22.0KB text/plain  comment by Ada Lovelace
# 292731  screen.png   118KB  image/png   description

jira attachment read ABC-123 error.log | grep -i timeout
jira attachment get ABC-123 screen.png --output ~/Desktop/
```

Descriptions and comments render as Markdown, with embedded files named rather than left as opaque ids:

```sh
jira issue view ABC-123 --comments
```

## The interactive view

Run `jira` with no arguments:

```sh
jira
```

Your open issues, newest first. `↑↓` to move, `enter` to open, `a` to include closed ones, `r` to refresh, `q` to quit.

Inside an issue, `←→` switches between description, comments and attachments — descriptions and comments render as real Markdown, and attachments are listed with the comment or description each was embedded in. `t` transitions, `c` comments, `a` assigns to you, `o` opens the browser, `esc` goes back. Writes ask before they act.

Ink is loaded only for this view, via a dynamic import, so `jira issue list | grep` never pays for it. Piped or redirected, bare `jira` prints help instead of opening a UI.

## Using it alongside the Atlassian MCP

The Atlassian MCP returns an issue's fields and comments, but **not** the content of its attachments — it can tell you a file is there and nothing more. When the answer to a ticket is inside a screenshot, a log or a CSV, that is the gap this fills:

```sh
jira attachment list ABC-123               # what is there, and where it came from
jira attachment read ABC-123 error.log     # text, straight to stdout
jira attachment get ABC-123 shot.png -o /tmp/shot.png   # then open or read it
```

Useful for agents in particular: `get` writes a real file, so an image can then be read and reasoned about rather than skipped.

## Issues

```sh
jira issue list                            # yours, most recently updated first
jira issue list --status 'In Progress'
jira issue list --project ABC --sprint current
jira issue view ABC-123
jira issue transition ABC-123              # list what's available
jira issue transition ABC-123 'In Review'
jira issue open ABC-123
```

Writing:

```sh
jira issue create -p ABC -t Task -s 'Fix the thing' -b 'Longer **markdown** body'
jira issue edit ABC-123 --summary 'Better title'
jira issue assign ABC-123 me               # or a name, or 'none'
jira issue comment add ABC-123 -          # body from stdin
jira issue comment list ABC-123
jira issue link ABC-1 Blocks ABC-2
jira issue watch add ABC-123
jira issue worklog add ABC-123 '2h 30m'
jira issue history ABC-123
```

Bodies accept Markdown — paragraphs, headings, lists, fenced code, links and code spans are converted to ADF.

## Projects, boards and sprints

```sh
jira project list
jira project versions ABC
jira project components ABC
jira project statuses ABC

jira board list
jira board issues 42
jira board backlog 42
jira board epics 42
jira epic ABC-100

jira sprint list 42 --state active
jira sprint issues 1234
```

## Knowing what this instance supports

```sh
jira whoami
jira meta issuetypes      # also: priorities, statuses, resolutions, linktypes
jira meta labels
jira meta filters
jira meta permissions ABC
jira meta server
jira count 'project = ABC AND status = Done'
```

## Scripting

Every read command takes `--json`:

```sh
jira issue list --mine --json | jq -r '.[].key'
jira search 'project = ABC AND created >= -7d' --json
```

Exit codes:

| Code | Means                                   |
| ---- | --------------------------------------- |
| `0`  | success                                 |
| `1`  | Jira rejected the request, or bad usage |
| `2`  | the environment is not set up           |
| `4`  | not authenticated                       |

Colour is disabled automatically when stdout is not a TTY, and when `NO_COLOR` is set.

## Custom fields

Jira instances differ. Find yours, then name the ones you care about:

```sh
jira fields points
# ID                 NAME                   TYPE
# customfield_10784  Offshore Story Points  string
# customfield_10002  Story Points           number
```

```json
{
  "baseUrl": "myorg.atlassian.net",
  "email": "you@example.com",
  "customFields": [{ "id": "customfield_10002", "label": "points" }],
  "sprintField": "customfield_10020",
  "defaultProject": "ABC"
}
```

Named fields are requested on every search and shown in `issue view`.

## Escape hatch

Anything not covered:

```sh
jira api /rest/api/3/myself
jira api /rest/api/3/issue/ABC-123/watchers -X POST -d '{"accountId":"..."}'
```

## Licence

MIT
