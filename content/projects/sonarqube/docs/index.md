---
title: "sonarqube"
description: "Headless SonarQube core: client, config, quality-gate model and types."
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

## Configuration

Resolved in layers, each overriding the last: config file, environment, explicit options.

| Setting | Environment (first set wins)                          | File key  |
| ------- | ----------------------------------------------------- | --------- |
| host    | `SONARQUBE_DASH_HOST`, `SONAR_HOST_URL`               | `host`    |
| token   | `SONARQUBE_DASH_TOKEN`, `SONARQUBE_TOKEN`, `SONAR_TOKEN` | `token`   |
| project | `SONARQUBE_DASH_PROJECT`                              | `project` |
| branch  | `SONARQUBE_DASH_BRANCH`                               | `branch`  |

The file is `$XDG_CONFIG_HOME/sonarqube-dash-cli/config.json` (default `~/.config/sonarqube-dash-cli/config.json`). Without a project key anywhere, `sonar.projectKey` is read from `sonar-project.properties` in the working directory. There is no default host: constructing a client without one throws `MissingHostError`.

## API

| Export                                                  | What it does                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| `SonarQubeClient`                                       | `getProjectStatus`, `explainGate`, `getMeasures`, `getMeasuresHistory`, `getComponentTree`, `getIssues`, `getIssue`, `getIssuesSummary`, `getIssueSource`, `searchHotspots`, `getHotspot`, `searchRules`, `getRule`, `getDuplications`, `searchQualityProfiles`, `getBranches`, `searchProjects` |
| `resolveConfig`, `readSonarProjectKey`, `writeConfig`   | Layered config, properties fallback, config file writer         |
| `configFilePath`, `readConfigFile`                      | Config file location and reader                                 |
| `redactToken`, `redactConfig`                           | Strip the token from text or a config                           |
| `explainGate`, `gateStatusWord`, `formatMetricValue`    | The gate model and its helpers                                  |
| `formatIssueAuthor`, `formatDate`                       | Author (before `@`) and `YYYY-MM-DD` formatters                 |
| `MissingHostError`, `SonarQubeHttpError`                | Typed errors                                                    |

With `newCode: true`, `getIssues` sends `inNewCodePeriod=true` and retries once with `sinceLeakPeriod=true` if the server answers 400. Issues are filtered to `resolved=false` unless `statuses` is given.

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

## Licence

MIT
