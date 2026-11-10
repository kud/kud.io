---
title: "jira"
description: "Headless Jira client — issues, comments, attachments, ADF conversion, agile boards and instance metadata, with no environment or process dependencies"
hasDocs: true
---

## Features

- **Factory, not a class** — `createJiraClient(options)` returns a plain object of methods: no `new`, no inheritance, nothing to extend.
- **Nearly 60 methods, one client** — issues, comments, attachments, worklogs, watchers, links (including remote links), projects, boards, sprints, epics, backlog and ranking, people search and instance metadata all come off the same object.
- **No environment coupling in the client** — it never reads `process.env` or calls `process.exit`; every credential and setting arrives through the options object, so the same client behaves identically in a CLI, an MCP server, a TUI or a test. Config loading lives separately in `loadConfig`, for hosts that want the shared lookup.
- **Injectable `fetch`** — defaults to `globalThis.fetch`; pass a fake for tests or a wrapped one for logging and retries.
- **ADF and Markdown, both ways** — `adfToMarkdown` and `markdownToAdf` convert Jira's document format without ever emitting ANSI or HTML.
- **Attachments that know where they came from** — `locateAttachments` maps each one back to the body, description or comment that referenced it, and `uploadAttachment` / `downloadAttachment` handle the multipart and redirect quirks.
- **JQL helpers and typed errors** — `buildJql`, `searchJql` and friends compose and escape queries; `isJiraApiError` and `errorMessagesOf` give callers an error they can act on.
- **Zero runtime dependencies** — plain `fetch` and Node platform APIs only.

## Install

```sh
npm install @kud/jira
```

## Usage

```ts
import { createJiraClient, loadConfig } from "@kud/jira"

const jira = createJiraClient({
  baseUrl: "jira.example.com",
  email: "me@example.com",
  token: process.env["JIRA_TOKEN"]!,
})

const issue = await jira.getIssue("ACME-1234")
console.log(issue.fields.summary)

const results = await jira.searchIssues(
  "project = ACME AND status = 'In Progress'",
  { limit: 20 },
)

const transitions = await jira.getTransitions("ACME-1234")
await jira.transitionIssue("ACME-1234", transitions[0].id, {
  resolution: { name: "Done" },
})
```

`baseUrl` accepts a bare host as readily as a full URL. When you would rather not wire credentials by hand, `loadConfig()` resolves the instance URL, email and token from the environment and an optional config file, and returns `{ config }` ready for `createJiraClient`, or `{ missing }` naming every absent value.

| Area                | What you get                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Issues              | get, create, update, delete, assign, transitions (with screen fields), changelog                                |
| Comments            | list, add, update, delete, with ADF bodies                                                                      |
| Attachments         | upload from a path or bytes, download, locate where each was used                                               |
| Worklogs and links  | worklogs (add, update, delete), watchers, issue links, remote links, `flattenIssueLinks`                        |
| Projects            | projects, versions, components, statuses per issue type                                                         |
| Agile               | boards, board configuration, sprints, epics, backlog, `moveIssuesToSprint`, `moveIssuesToBacklog`, `rankIssues` |
| People and metadata | user search, fields, issue types, priorities, resolutions, statuses, labels, filters, dashboards, permissions   |
