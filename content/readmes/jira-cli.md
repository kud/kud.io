---
title: "jira-cli"
description: "Jira on the command line — read issues, comments and attachments as plain text"
hasDocs: true
---

## Features

- **Attachments as text** — list what is attached, with the comment it came from, and print text files straight to stdout or download the rest
- **Plain and pipeable** — black and white output, `--json` on every read, stable exit codes
- **Full issue workflow** — create, edit, transition (with a resolution), comment, link, watch, rank and log work
- **Projects, boards and sprints** — browse projects, boards, sprints, epics and the backlog
- **Automation rules** — list, export, import and switch Jira Automation rules, with secrets redacted on request
- **Interactive board** — bare `jira` opens your issues as tabs, with search and in-place writes; Ink loads only for this view

## Install

```sh
npm install -g @kud/jira-cli
```

## Usage

Only the API token is a secret, so only the token comes from the environment:

```sh
export ATLASSIAN_API_TOKEN=...
jira init --base-url jira.example.com --email you@example.com
```

```console
$ jira attachment list ACME-1234
ID      FILENAME     SIZE   TYPE        FROM
292542  error.log    22.0KB text/plain  comment by Ada Lovelace
292731  screen.png   118KB  image/png   description

$ jira attachment read ACME-1234 error.log | grep -i timeout
$ jira issue view ACME-1234 --fields status,assignee,issuelinks
$ jira issue transition ACME-1234 Done --resolution Fixed
$ jira issue open ACME-1234 --print
$ jira issue watch list ACME-1234
$ jira issue worklog edit ACME-1234 456 --time 3h --started 2026-10-27T09:00:00.000+0000
$ jira issue comment delete ACME-1234 12345
$ jira user search ada --project ACME
$ jira project view ACME
$ jira sprint view 1234
$ jira search 'project = ACME AND created >= -7d' --json | jq -r '.[].key'
$ jira automation get 0192e5ac-0e25-71de-ba7b-d972e6a2049a --redact
```

Run `jira` with no arguments in a terminal for the interactive board. Inside an issue, description, comments and attachments sit in one scrolling view. Two flags help when exploring it: `--screen detail:ACME-1234` opens an issue directly (`--screen list` prints the available screens), and `--mock` runs against built-in sample data with no Jira needed.

Exit codes: `0` success, `1` Jira rejected the request or bad usage, `2` environment not set up, `3` `--json` result may be truncated, `4` not authenticated.

Anything not covered has an escape hatch: `jira api /rest/api/3/myself`.
