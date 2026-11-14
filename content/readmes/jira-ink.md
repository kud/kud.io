---
title: "jira-ink"
description: "Ink components for viewing Jira issues: the issue detail screen, shared by jira-cli's TUI and cockpit"
hasDocs: true
---

Controlled [Ink](https://github.com/vadimdemedes/ink) components for viewing
Jira issues in the terminal — the board and the issue detail screen, extracted
from [`@kud/jira-cli`](https://github.com/kud/jira-cli)'s TUI so they can be
shared with ambre's cockpit.

Every component is **presentation-only**: props in, no data fetching, no
app-level input. The consuming surface owns selection, navigation and loading,
so the same components drop into a full-screen CLI or a single pane inside a
larger dashboard. Data comes from [`@kud/jira`](https://github.com/kud/jira);
markdown rendering comes from [`@kud/ink-markdown`](https://github.com/kud/ink-markdown);
primitives and colour tokens come from [`@kud/ink-ui`](https://github.com/kud/ink-ui).

```
@kud/jira        headless core — client, types (framework-agnostic)
└─ @kud/jira-ink  this package — Ink rendering
```

## Install

```sh
npm install @kud/jira-ink @kud/jira @kud/ink-ui ink react
```

`ink` and `react` are peer dependencies.

## Usage

A host with a client and a key mounts the self-fetching body — the shape a cockpit wants:

```tsx
import { createJiraClient, loadConfig } from "@kud/jira"
import { IssueBody } from "@kud/jira-ink"

const loaded = loadConfig()
if ("missing" in loaded) throw new Error(loaded.missing.join(", "))
const client = createJiraClient(loaded.config)

<IssueBody
  client={client}
  baseUrl={loaded.config.baseUrl}
  issueKey="SHOP-1234"
  onExit={() => setScreen("list")}
/>
```

A host that already holds an `IssueDetail` and owns the prompts behind the write verbs — jira-cli's own TUI — mounts the view directly. A verb whose handler is absent is neither hinted nor bound, so a read-only host gets the same screen minus the keys it cannot honour:

```tsx
import { IssueDetailView, issueDetailOf } from "@kud/jira-ink"

const issue = await issueDetailOf(client, baseUrl, "SHOP-1234")

<IssueDetailView
  issue={issue}
  width={80}
  height={30}
  onBack={back}
  onTransition={transition}
  onComment={comment}
  onAssign={assign}
  onOpenBrowser={open}
/>
```

| Export            | What it is                                                               |
| ----------------- | ------------------------------------------------------------------------ |
| `IssueBody`       | Self-fetching issue screen: hand it a client and a key, read-only        |
| `IssueDetailView` | The issue screen over an `IssueDetail`, with optional write verbs        |
| `issueDetailOf`   | Fetches one issue through a `@kud/jira` client into the view-ready shape |
| `transitionsOf`   | The issue's available status transitions, `{ id, name, to }`             |
| `IssueDetail`     | The shape the view reads: strings throughout, ADF already Markdown       |
