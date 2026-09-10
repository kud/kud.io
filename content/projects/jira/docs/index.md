---
title: "jira"
description: "Headless Jira client — issues, comments, attachments, ADF conversion, agile boards and instance metadata, with no environment or process dependencies"
---

## 🌟 Features

- 🏭 **Factory, not a class** — `createJiraClient(options)` returns a plain object of methods; no `new`, no inheritance, nothing to extend.
- 🔌 **~45 methods, one client** — issues, comments, worklogs, watchers, links, projects, agile boards/sprints/epics, people search, and instance metadata (fields, priorities, statuses, labels, filters, dashboards, server info, permissions) all come off the same object.
- 🧼 **Zero environment coupling** — no `process.env` reads, no `process.exit`. Every credential and setting comes in through the options object, so the same client works identically in a CLI, an MCP server, a TUI, or a test.
- 🧪 **Injectable `fetch`** — defaults to `globalThis.fetch`, but a caller can pass a fake for tests or a wrapped one for logging/retries.
- 📝 **ADF ⇄ Markdown, both directions** — `adfToMarkdown` and `markdownToAdf` convert Jira's Atlassian Document Format to and from plain Markdown, without ever touching ANSI or HTML.
- 📎 **Attachment origin tracking** — `locateAttachments` maps each attachment back to where it was actually referenced (issue body, description, or a specific comment), something Jira's API never says directly.
- ⚠️ **Typed API errors** — `jiraApiError` / `isJiraApiError` give callers a narrowed error shape instead of a bare thrown string.
- 📦 **Zero runtime dependencies** — pure `fetch`-based client using only Node/Web platform APIs (`Buffer`, `fetch`).

## 🚀 Quick Start

```sh
npm install @kud/jira
```

```ts
import { createJiraClient } from "@kud/jira"

const jira = createJiraClient({
  baseUrl: "myorg.atlassian.net",
  email: "me@myorg.com",
  token: process.env["JIRA_TOKEN"]!,
})

const issue = await jira.getIssue("PROJ-123")
console.log(issue.fields.summary)

const results = await jira.searchIssues(
  "project = PROJ AND status = 'In Progress'",
  { limit: 20 },
)
```

`baseUrl` accepts a bare host (`myorg.atlassian.net`) as readily as a full URL — `normalizeBaseUrl` fills in `https://` when it's missing, since a bare host is the common shape a config value or env var arrives in.

## 📚 API Reference

### `createJiraClient(options)`

The library's single entry point. Everything else is returned from it.

| Option         | Type                              | Description                                                                   |
| -------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| `baseUrl`      | `string`                          | Instance host or URL. Passed through `normalizeBaseUrl`.                      |
| `email`        | `string`                          | Account email for HTTP Basic auth.                                            |
| `token`        | `string`                          | API token for HTTP Basic auth.                                                |
| `customFields` | `{ id: string; label: string }[]` | Optional. Custom fields to request on every issue fetch/search.               |
| `sprintField`  | `string`                          | Optional. This instance's sprint field id (e.g. `customfield_10020`).         |
| `fetch`        | `typeof globalThis.fetch`         | Optional. Defaults to `globalThis.fetch` — override to fake or wrap requests. |

Returns a client object exposing `request` (the raw authenticated fetch wrapper), `customFields`, `sprintField`, and the methods below.

### Search & issues

| Method                               | Description                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `searchPage(jql, opts?)`             | One page of the enhanced JQL search (`/search/jql`), cursor-based.                         |
| `searchIssues(jql, opts?)`           | Walks the cursor up to `opts.limit` (default 50) issues, guarding against a looping token. |
| `getIssue(key)`                      | Fetches an issue with summary, status, description, comments, and attachments.             |
| `createIssue(fields)`                | Creates an issue from a Jira fields object.                                                |
| `updateIssue(key, fields)`           | Updates an issue's fields.                                                                 |
| `deleteIssue(key, deleteSubtasks?)`  | Deletes an issue.                                                                          |
| `assignIssue(key, accountId)`        | Assigns (or unassigns, with `null`) an issue.                                              |
| `getTransitions(key)`                | Lists the transitions available for an issue's current status.                             |
| `transitionIssue(key, transitionId)` | Executes a transition.                                                                     |
| `approximateCount(jql)`              | An index-estimate count for a JQL query — not a scan, will disagree with a full page walk. |

### Comments, worklogs, watchers & links

| Method                                    | Description                                                  |
| ----------------------------------------- | ------------------------------------------------------------ |
| `getComments(key)`                        | Lists an issue's comments.                                   |
| `addComment(key, body)`                   | Adds a comment (ADF body).                                   |
| `deleteComment(key, commentId)`           | Deletes a comment.                                           |
| `getWatchers(key)`                        | Lists an issue's watchers.                                   |
| `addWatcher(key, accountId)`              | Adds a watcher.                                              |
| `removeWatcher(key, accountId)`           | Removes a watcher.                                           |
| `getWorklogs(key)`                        | Lists an issue's worklogs.                                   |
| `addWorklog(key, body)`                   | Adds a worklog (`timeSpent`, optional `comment`, `started`). |
| `getChangelog(key)`                       | Lists an issue's changelog entries.                          |
| `getIssueLinkTypes()`                     | Lists the instance's issue link types.                       |
| `linkIssues(type, inwardKey, outwardKey)` | Links two issues by link type name.                          |

### Projects

| Method                      | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| `getProjects()`             | Lists all projects, with description expanded.            |
| `getProject(key)`           | Fetches one project, with description/lead/url expanded.  |
| `getProjectVersions(key)`   | Lists a project's versions.                               |
| `getProjectComponents(key)` | Lists a project's components.                             |
| `getProjectStatuses(key)`   | Lists the statuses available per issue type in a project. |

### Agile (boards, sprints, epics)

| Method                        | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| `getBoards()`                 | Lists all boards.                                      |
| `getBoard(id)`                | Fetches one board.                                     |
| `getBoardIssues(id, jql?)`    | Lists a board's issues, optionally filtered by JQL.    |
| `getBacklog(id)`              | Lists a board's backlog issues.                        |
| `getSprints(boardId, state?)` | Lists a board's sprints, optionally filtered by state. |
| `getSprint(id)`               | Fetches one sprint.                                    |
| `getSprintIssues(id)`         | Lists a sprint's issues.                               |
| `getBoardEpics(id)`           | Lists a board's epics.                                 |
| `getEpicIssues(id)`           | Lists an epic's issues.                                |

### People

| Method                                                  | Description                                   |
| ------------------------------------------------------- | --------------------------------------------- |
| `searchUsers(query, maxResults?)`                       | Searches users instance-wide.                 |
| `searchAssignableUsers(query, projectKey, maxResults?)` | Searches users assignable to a given project. |

### Instance metadata

| Method                          | Description                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| `getMe()`                       | The authenticated user.                                               |
| `getFields()`                   | All fields, standard and custom, on the instance.                     |
| `getIssueTypes()`               | All issue types.                                                      |
| `getPriorities()`               | All priorities.                                                       |
| `getResolutions()`              | All resolutions.                                                      |
| `getStatuses()`                 | All statuses.                                                         |
| `getLabels()`                   | Up to 1000 labels used on the instance.                               |
| `getFilters()`                  | Up to 50 saved filters, with JQL expanded.                            |
| `getDashboards()`               | All dashboards.                                                       |
| `getServerInfo()`               | Server/instance info.                                                 |
| `getMyPermissions(projectKey?)` | The authenticated user's permissions, optionally scoped to a project. |

### Error handling

| Export                                    | Description                                                                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jiraApiError(status, method, url, body)` | Builds a typed `JiraApiError` (`Error` with `name: "JiraApiError"`, `status`, `method`, `url`, `body`). Used internally on every non-2xx response. |
| `isJiraApiError(e)`                       | Type guard narrowing an unknown catch value to `JiraApiError`.                                                                                     |

```ts
import { isJiraApiError } from "@kud/jira"

try {
  await jira.getIssue("PROJ-999")
} catch (e) {
  if (isJiraApiError(e) && e.status === 404) {
    console.error("no such issue")
  } else {
    throw e
  }
}
```

### ADF conversion

| Export                       | Description                                                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adfToMarkdown(doc, media?)` | Converts an Atlassian Document Format node tree to Markdown. Handles headings, lists, tables, code blocks, panels, mentions, emoji, and media references.                     |
| `markdownToAdf(text)`        | Converts Markdown back to ADF — paragraphs, fenced code, headings, lists, links, and code spans. Deliberately partial: richer formatting is better authored in Jira directly. |

Both stop at Markdown rather than emitting ANSI or HTML — rendering is the caller's job, so a TUI, a pager, and a `--json` consumer all get the same text.

### Attachments

| Export                                       | Description                                                                                                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locateAttachments(issue)`                   | Maps an issue's attachments back to where they were referenced — the issue body, the description, or a specific comment — since Jira's API never states this directly. |
| `isTextual(attachment)`                      | Mime/extension sniffing for attachments that are safe to render as text.                                                                                               |
| `downloadAttachment(client, id, fetchImpl?)` | Downloads attachment bytes, handling Jira's redirect-to-media-host flow without forwarding the `Authorization` header cross-origin.                                    |

### `normalizeBaseUrl(raw)`

Turns a bare host (`myorg.atlassian.net`) into a full `https://` URL. A no-op on an already-complete URL.

## 🔧 Development

```
src/
├── index.ts           # public API surface — re-exports everything below
├── client.ts           # createJiraClient factory + all client methods
├── types.ts             # Jira REST/Agile response shapes
├── adf.ts                # ADF ⇄ Markdown conversion
└── attachments.ts         # attachment origin tracking, sniffing, download
```

| Script                | What it does                        |
| --------------------- | ----------------------------------- |
| `npm run build`       | Bundles `src/` to `dist/` via tsup. |
| `npm run build:watch` | Same, in watch mode.                |
| `npm run typecheck`   | `tsc --noEmit`.                     |
| `npm test`            | Runs the vitest suite once.         |
| `npm run test:watch`  | Runs vitest in watch mode.          |

```sh
git clone https://github.com/kud/jira.git
cd jira
npm install
npm run build
npm test
```

## 🏗 Tech Stack

| Category     | Choice                        |
| ------------ | ----------------------------- |
| Language     | TypeScript                    |
| Runtime      | Node.js ≥ 20                  |
| Build        | tsup                          |
| Tests        | vitest                        |
| Dependencies | none (runtime) — pure `fetch` |

Consumed today by [`@kud/jira-cli`](https://github.com/kud/jira-cli), which extracted this package's logic from its own `src/api/` layer so a second surface — an MCP server, a TUI — could consume the same client without going through the CLI.

---

MIT © [kud](https://github.com/kud) — Made with ❤️
