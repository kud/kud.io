---
title: "jenkins-ink"
description: "Controlled Ink components for rendering Jenkins builds, jobs, stages and logs"
hasDocs: true
---

Controlled [Ink](https://github.com/vadimdemedes/ink) components for rendering
Jenkins domain objects — builds, jobs, pipeline stages and logs — in the
terminal.

Every component is **presentation-only**: props in, no data fetching, no
app-level input. The consuming surface owns selection, navigation and loading, so
the same `<BuildList>` drops into a full-screen CLI or a single pane inside a
larger dashboard. Data and formatting come from [`@kud/jenkins`](https://github.com/kud/jenkins);
primitives and colour tokens come from [`@kud/ink-ui`](https://github.com/kud/ink-ui).

```
@kud/jenkins        headless core — client, types, status tokens (framework-agnostic)
└─ @kud/jenkins-ink  this package — Ink rendering
```

## Install

```sh
npm install @kud/jenkins-ink @kud/jenkins @kud/ink-ui ink react
```

`ink` and `react` are peer dependencies.

## Usage

The components are **controlled** — you hold the selection index and key handling
in your app shell, and pass them down. Nothing here calls `useInput` at app level.

```tsx
import { useState } from "react"
import { render, Box, useInput } from "ink"
import { JenkinsClient } from "@kud/jenkins"
import { BuildList, BuildInfo } from "@kud/jenkins-ink"

const Builds = ({ client, job }) => {
  const [builds, setBuilds] = useState([])
  const [selected, setSelected] = useState(0)

  useInput((_input, key) => {
    if (key.upArrow) setSelected((s) => Math.max(0, s - 1))
    if (key.downArrow) setSelected((s) => Math.min(builds.length - 1, s + 1))
  })

  // ...load builds from client.listBuilds(job) into setBuilds...

  return (
    <Box flexDirection="column">
      <BuildInfo build={builds[selected] ?? null} />
      <BuildList builds={builds} selected={selected} rows={20} />
    </Box>
  )
}
```

Because selection lives in your shell, you can render a `<BuildList>` beside other
panes (PRs, tickets) in one screen — composition a shelled-out full-screen CLI
can't give you.
