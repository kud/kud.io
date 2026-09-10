---
title: "jenkins"
description: "Headless Jenkins core — client, config, and types behind @kud/jenkins-cli."
---

## 🌟 Features

- 🧩 **Single client, full surface** — `JenkinsClient` covers job/build metadata, console logs (with live streaming), artifacts, the build queue, and triggers
- ⚙️ **Layered config resolution** — named server → environment variables → per-call overrides, so callers never hardcode credentials
- 🗂 **Multi-server profiles** — add, switch, and remove named Jenkins servers without touching env vars
- 🔁 **Resilient HTTP layer** — timeout and bounded retry with backoff on network errors and 5xx responses, automatic CSRF crumb handling on every mutating call
- 🌲 **Recursive job search** — BFS traversal across nested folders, plus an incremental/concurrent variant with progress callbacks for large instances
- 🧼 **Log sanitisation** — strips ANSI escape codes and control characters from console output for clean rendering
- 📐 **Fully typed** — exported TypeScript types for jobs, builds, artifacts, parameters, and changesets

Surface-agnostic by design: this package holds no CLI, no prompts, no rendering — just data, actions, and auth. [`@kud/jenkins-cli`](https://github.com/kud/jenkins-cli) is the command surface and interactive TUI built on top of it.

## 🚀 Quick Start

```sh
npm install @kud/jenkins
```

```ts
import { JenkinsClient, resolveConfig } from "@kud/jenkins"

const cfg = resolveConfig()
const client = new JenkinsClient(cfg.url, cfg.user, cfg.token)

const jobs = await client.searchJobs("my-service")
const build = await client.getBuild("my-service")

console.log(build.result, build.building)
```

Configuration resolves in layers — named server profile → environment variables → explicit overrides:

```sh
export JENKINS_URL=https://ci.example.com
export JENKINS_USER=erwann
export JENKINS_API_TOKEN=xxxxxxxxxxxx
```

Several instances can be declared at once, comma or pipe separated and matched
positionally. `JENKINS_INSTANCES` names them; without it, each name is derived
from its URL's first hostname label. The first instance is the default, and
`JENKINS_SERVER` (or a `server` override) selects another:

```sh
export JENKINS_INSTANCES=pipeline,scheduler
export JENKINS_URL=https://pipeline.example.com,https://scheduler.example.com
export JENKINS_USER=erwann          # a single value applies to every instance
export JENKINS_API_TOKEN=tok1,tok2
```

A name/URL count mismatch is an error rather than a best-effort pairing: a short
list would silently authenticate one instance with another's credentials.

Or manage named servers on disk (`~/.config/jenkins-cli/config.json`, override the base with `XDG_CONFIG_HOME`):

```ts
import { addServer, useServer, listServers } from "@kud/jenkins"

addServer("prod", {
  url: "https://ci.example.com",
  user: "erwann",
  token: "xxxx",
})
useServer("prod")
listServers() // [{ name: "prod", url: "...", current: true }]
```

## 📖 API Reference

### Jobs & Builds

| Method                                | Description                                                   |
| ------------------------------------- | ------------------------------------------------------------- |
| `getJob(job)`                         | Fetch a job's metadata (depth 1)                              |
| `getBuild(job, buildNumber?)`         | Fetch a build; defaults to the last build                     |
| `listBuilds(job, limit?)`             | Fetch recent builds concurrently                              |
| `getBuildChanges(job, buildNumber?)`  | Trigger cause, culprits, and SCM commits for a build          |
| `getJobParameters(job)`               | Parameter definitions for a parameterised job                 |
| `searchJobs(query, limit?)`           | Recursive BFS search across folders                           |
| `searchJobsIncremental(query, opts?)` | Same search, with a progress callback and bounded concurrency |
| `getSpecificJobs(jobNames)`           | Batch-fetch jobs by name, tolerant of per-job errors          |
| `getPipelineStages(job, buildNumber)` | Pipeline stage breakdown (Workflow API)                       |
| `getTestReport(job, buildNumber)`     | Test report for a build                                       |

### Logs

| Method                                                         | Description                                     |
| -------------------------------------------------------------- | ----------------------------------------------- |
| `getConsoleText(job, buildNumber?)`                            | Full console output as text                     |
| `streamConsole(job, buildNumber, onChunk, intervalMs?, opts?)` | Poll and stream console output as it's produced |

### Artifacts

| Method                                             | Description                        |
| -------------------------------------------------- | ---------------------------------- |
| `getArtifacts(job, buildNumber?)`                  | Build plus its artifact list       |
| `downloadArtifact(job, buildNumber, relativePath)` | Download an artifact as a `Buffer` |

### Actions

| Method                                    | Description                   |
| ----------------------------------------- | ----------------------------- |
| `triggerBuild(job)`                       | Trigger a build               |
| `triggerBuildWithParameters(job, params)` | Trigger a parameterised build |
| `stopBuild(job, buildNumber)`             | Stop a running build          |
| `getQueue()`                              | Fetch the build queue         |
| `cancelQueueItem(id)`                     | Cancel a queued item          |

### Config

| Export                                  | Description                                             |
| --------------------------------------- | ------------------------------------------------------- |
| `resolveConfig(overrides?)`             | Layered resolution: named server → env vars → overrides |
| `addServer(name, { url, user, token })` | Add or update a named server profile                    |
| `useServer(name)`                       | Switch the active named server                          |
| `removeServer(name)`                    | Remove a named server profile                           |
| `listServers()`                         | List all named servers, with the active one flagged     |

### Utilities

| Export                           | Description                                                          |
| -------------------------------- | -------------------------------------------------------------------- |
| `sanitizeLogChunk(chunk, opts?)` | Strip ANSI codes and control characters from console output          |
| `normalizeUrl(url)`              | Fix malformed schemes such as `http:/host` → `http://host`           |
| `ensureScheme(url)`              | Prefix `https://` onto a bare host if no scheme is present           |
| `parseBuildSpecifier(input)`     | Parse a job name, job URL, or build URL into a structured descriptor |

### Types

`JenkinsJob`, `JenkinsBuild`, `JenkinsBuildRef`, `JenkinsArtifact`, `JenkinsCrumb`, `JenkinsParameterDefinition`, `JenkinsCommit`, `JenkinsBuildChanges` — exported from `src/types.ts` and used across every method above.

Auth is HTTP Basic (username + API token) — no OAuth, no sessions. Every mutating call (`triggerBuild`, `stopBuild`, `cancelQueueItem`, …) fetches a CSRF crumb first and attaches it automatically, so callers never manage crumbs themselves.

## 🔧 Development

```
src/
├── index.ts             # public exports
├── jenkins-client.ts    # JenkinsClient — data + actions
├── config.ts            # resolveConfig, named-server helpers
├── types.ts             # shared Jenkins types
├── url-utils.ts         # URL parsing/normalisation helpers
└── log-sanitizer.ts     # sanitizeLogChunk
```

| Script      | Description                         |
| ----------- | ----------------------------------- |
| `build`     | Compile `src/` to `dist/` via `tsc` |
| `typecheck` | Type-check without emitting output  |

```sh
git clone https://github.com/kud/jenkins.git
cd jenkins
npm install
npm run build
```

## 🏗 Tech Stack

| Layer        | Choice                                                        |
| ------------ | ------------------------------------------------------------- |
| Language     | TypeScript 5.9                                                |
| Runtime      | Node.js ≥ 22, native `fetch`                                  |
| Module       | ESM (`type: module`)                                          |
| Dependencies | None at runtime — `@types/node` and `typescript` are dev-only |

---

MIT © [kud](https://github.com/kud) — Made with ❤️
