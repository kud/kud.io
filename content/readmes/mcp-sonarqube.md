---
title: "mcp-sonarqube"
description: "🧭 MCP server for SonarQube: explain a red quality gate, search issues, read measures"
hasDocs: true
---

## Features

- **Red gate, explained** — status, new-code period and every condition, with the failing ones listed first and ratings shown as A–E
- **Issue search** — filter a project's unresolved issues by severity, type, status, branch, pull request or new code, each with file, line, rule, message, author and date
- **Measures on demand** — read any metric (`coverage`, `bugs`, `new_coverage`, `sqale_rating`) for a project, branch or pull request
- **Source in context** — fetch the lines around an issue without leaving your MCP client
- **Strictly read-only** — all six tools are annotated read-only and idempotent; nothing in SonarQube is ever changed
- **Token stays private** — it is never returned, and is redacted from any error message
- **Zero-install usage** — run directly via `npx -y @kud/mcp-sonarqube@latest`

## Install

```sh
npm install -g @kud/mcp-sonarqube
```

Or use without installing via `npx` (see Configuration below). Requires Node.js 22 or later.

## Usage

Set the host and a token, then start the server over stdio:

```sh
SONAR_HOST_URL=https://sonarqube.example.com \
SONAR_TOKEN=your-token \
npx -y @kud/mcp-sonarqube@latest
```

Your MCP client then exposes six tools:

| Tool                     | What it does                                                   | Inputs                                                                                           |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `sonarqube_quality_gate` | Explains why a quality gate is red, failing conditions first   | `project`, `branch?`, `pullRequest?`                                                             |
| `sonarqube_issues`       | Searches unresolved issues                                     | `project`, `newCode?`, `severities?`, `types?`, `statuses?`, `branch?`, `pullRequest?`, `limit?` |
| `sonarqube_measures`     | Reads measures such as `coverage`, `bugs` or `new_coverage`    | `project`, `metricKeys`, `branch?`, `pullRequest?`                                               |
| `sonarqube_issue_source` | Shows the source lines around an issue                         | `component`, `line`, `contextLines?`                                                             |
| `sonarqube_branches`     | Lists branches with quality gate status and last analysis date | `project`                                                                                        |
| `sonarqube_projects`     | Lists or searches the projects the token can see               | `query?`, `limit?`                                                                               |

A few details worth knowing:

- `severities` accepts `INFO`, `MINOR`, `MAJOR`, `CRITICAL`, `BLOCKER`; `types` accepts `CODE_SMELL`, `BUG`, `VULNERABILITY`.
- `statuses` defaults to unresolved issues. `limit` defaults to 10 for issues and 50 for projects, with a maximum of 500.
- `sonarqube_issue_source` takes the `component` and `line` exactly as `sonarqube_issues` returns them, for example `my-project:src/index.ts`. `contextLines` defaults to 5, maximum 50.

Typical questions to put to your client: "why is the gate red on my-project?", "list the blocker bugs in new code on pull request 42", "what is the new coverage on the main branch?".
