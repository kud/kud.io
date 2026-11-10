---
title: "jenkins"
description: "Headless Jenkins core — client, config, and types behind @kud/jenkins-cli."
hasDocs: true
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
