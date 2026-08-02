---
title: "cli-testing"
description: "Test helpers for Ink CLIs — frame-history rendering and isolated subprocess runs"
---

Two tiers, matching the two ways a terminal app can be wrong: the component
renders the wrong thing, or the binary behaves wrongly when actually run.

## Features

- **Frame history by default** — `output()` reads every frame, so a command that renders then exits doesn't race its own unmount
- **`waitFor` that explains itself** — a timeout reports the frames that *were* drawn, not just that time ran out
- **Real-binary runs** — `runCli` spawns the actual entry point, not a mocked module
- **Environment genuinely withheld** — fresh temp `HOME` *and* `cwd`, so a stray `.env` can't hand back the credentials you scrubbed
- **Peer-resolved** — binds to your `react`, `ink` and `ink-testing-library`, never its own copies

## Why

**`renderFrames` reads the frame history, not the last frame.** An Ink command
that renders, fetches, then exits unmounts itself the moment its data lands —
and an unmounted component's last frame is empty. Asserting on the last frame
therefore races the unmount: it fails on exactly the commands that work, and
passes on ones that hang. Every reader here is backed by the history, which
persists.

**`runCli` withholds the developer's environment.** A credential inherited from
your shell is the usual reason a "logged out" test passes locally, fails in CI,
and — worst of all — passes in both while asserting nothing.

## Install

```sh
npm install --save-dev @kud/cli-testing
```

`ink` (>=7) and `react` (>=19) are peer dependencies.

## Usage

### Rendering a component

```ts
import { renderFrames } from "@kud/cli-testing"

const ui = renderFrames(<DnsList domain="example.com" />)

await ui.waitFor("1 record")
expect(ui.output()).toContain("1.2.3.4")

ui.write("j")        // send input, as a user would
ui.unmount()
```

|                          |                                                           |
| ------------------------ | --------------------------------------------------------- |
| `output()`               | every frame so far, joined — what assertions want         |
| `lastFrame()`            | the most recent frame alone                               |
| `waitFor(needle, opts?)` | resolves with the output once a string or pattern appears |
| `write(input)`           | send keystrokes                                           |
| `unmount()`              | tear down                                                 |

A `waitFor` timeout reports the frames that _were_ rendered, so the usual cause
— the text appeared, spelled differently — is visible without a debugger.

### Running the real binary

```ts
import { runCli } from "@kud/cli-testing"

const run = runCli("tsx", ["src/cli.ts", "browse"], {
  scrub: ["PCLOUD_AUTH", "PCLOUD_ACCESS_TOKEN"],
})

expect(run.status).toBe(1)
expect(run.stderr).toMatch(/Not authenticated/)
```

Each run gets a fresh temporary `HOME`, removed afterwards. `cwd` points there
too — which is the isolation that gets missed: a CLI calling `dotenv.config()`
would otherwise read the `.env` beside its own source and be handed back exactly
the credentials `scrub` withheld.

| option    |                                                       |
| --------- | ----------------------------------------------------- |
| `scrub`   | environment names to withhold; wins over `env`        |
| `env`     | extra environment for the child                       |
| `timeout` | milliseconds before the child is killed (default 60s) |
| `input`   | written to the child's stdin                          |

## Development

```sh
npm install
npm test
npm run typecheck
npm run build
```

## Related

- [@kud/cli-shot](https://github.com/kud/cli-shot) — screenshots. A sibling, not
  a dependent: it shares the app contract (`--mock`, `--screen`) but none of this
  code, since `runCli`'s isolation would get in a screenshot's way
- [@kud/ink-ui](https://github.com/kud/ink-ui) — the components under test

## Licence

MIT © Erwann Mest
