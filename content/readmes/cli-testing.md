---
title: "cli-testing"
description: "Test helpers for Ink CLIs — frame-history rendering and isolated subprocess runs"
hasDocs: true
---

Two tiers, matching the two ways a terminal app can be wrong: the component
renders the wrong thing, or the binary behaves wrongly when actually run.

## Features

- **Frame history by default** — `output()` reads every frame, so a command that renders then exits doesn't race its own unmount
- **`waitFor` that explains itself** — a timeout reports the frames that *were* drawn, not just that time ran out
- **Real-binary runs** — `runCli` spawns the actual entry point, not a mocked module
- **Environment genuinely withheld** — fresh temp `HOME` *and* `cwd`, so a stray `.env` can't hand back the credentials you scrubbed
- **Peer-resolved** — binds to your `react`, `ink` and `ink-testing-library`, never its own copies

## Install

```sh
npm install --save-dev @kud/cli-testing
```

`ink` (>=7) and `react` (>=19) are peer dependencies.

## Usage
