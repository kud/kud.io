---
title: "jenkins-cli"
description: "🧰 Jenkins in your terminal — interactive TUI, scriptable build commands and smart log highlighting"
hasDocs: true
---

## Features

- **Failure diagnosis** — `jenkins why` explains a red build in one screen: each failing stage, the error lines pulled out of its step log, report links, skipped stages folded away
- **Interactive TUI** — a full-screen explorer for jobs, builds and live logs
- **Log streaming** — follow console output in real time, with syntax highlighting
- **Artifacts** — list, filter and download build artifacts
- **Multi-server profiles** — named servers with their own credentials, multibranch jobs included
- **Scriptable** — every command takes `--json`

## Install

```sh
npm install -g @kud/jenkins-cli
```

Binary: `jenkins` · Requires Node.js >= 22

## Usage

```console
$ jenkins why acme/api-gateway/feature/login
acme/api-gateway/feature/login #12  FAILURE

stage Image scan  UNSTABLE  error signal: 3 high vulnerabilities

stage E2E tests  FAILED
step  npm test  FAILED
  line 1 of 15
     FAIL  src/cart.test.ts > applies the coupon
    Error: expected 3 to be 4

    ⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯
     Test Files  1 failed | 4 passed (5)
    chmod 644 out/0
  last lines hidden (--tail to show)

skipped (earlier failure): Deploy

$ jenkins status my-pipeline
✔ my-pipeline #42  SUCCESS  (2m 14s)

$ jenkins logs my-pipeline --follow
$ jenkins interactive
```
