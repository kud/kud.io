---
title: "sonarqube"
description: "Headless SonarQube core: client, config, quality-gate model and types."
hasDocs: true
---

## Features

- **Client** — quality gate status, measures and their history, component tree, issue search (severity, type, status, branch, pull request, paging, new code), issue facets, hotspots, rules, duplications, quality profiles, source snippets, branches and project search, on global `fetch` with no runtime dependencies
- **Layered config** — config file < environment < explicit options; undefined never overwrites; project key falls back to `sonar-project.properties`
- **"Why is the gate red"** — `explainGate` turns a project status into a status word, the new-code period and conditions sorted failing first, with `*_rating` metrics shown as A–E
- **Safe auth** — the token is sent as the basic-auth username with an empty password and never appears in errors; `redactToken` and `redactConfig` are there for your own logging
- **Typed errors** — a missing host throws `MissingHostError`; HTTP failures throw `SonarQubeHttpError`

Surface-agnostic by design: no CLI, no prompts, no rendering.

## Quick start

```sh
npm install @kud/sonarqube
```

```ts
import { SonarQubeClient, resolveConfig } from "@kud/sonarqube"

const config = resolveConfig()
const client = new SonarQubeClient(config)

const why = await client.explainGate({ project: config.project! })
console.log(why.status, why.newCodePeriod)
for (const c of why.conditions)
  console.log(c.failing ? "x" : "ok", c.metric, c.actual, c.comparator, c.threshold)
```
