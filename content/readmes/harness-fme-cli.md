---
title: "harness-fme-cli"
description: "Terminal client for Harness FME (Split) feature flags: list, status, targeting and rollout changes with plans, backups and read-back checks."
hasDocs: true
---

## Features

- **Rollouts at a glance** — one table of flags against environments, with the rollout status and default rule for each; `unreleased` lists what is not fully on yet
- **Interactive dashboard** — `harness-fme tui` is a full-screen view of flags and environments, read-only unless you start it with `--write`
- **Change targeting from the shell** — add or remove an individual key on a treatment, serve `on` or `off`, ramp to a percentage, or act on a segment
- **Plan, backup, read-back** — every write prints a plan first, saves the original definition before it lands, and checks the flag afterwards, stopping at the first failure
- **Production guard** — an environment whose name matches `/prod/i` refuses to write unless its exact name is spelled out
- **Scriptable** — `--json` for machine-readable output, `--no-color` for plain text, stable exit codes, and API calls spaced politely with 429 reset headers honoured

## Install

```sh
npm install -g @kud/harness-fme-cli
```

Binary: `harness-fme` · Requires Node.js >= 20

There is deliberately no second binary. If you would rather type less, alias it:

```sh
alias fme=harness-fme
```

## Usage

```console
$ export HARNESS_FME_API_KEY=<your-api-key>
$ export HARNESS_FME_WORKSPACE="Storefront"

$ harness-fme list --env QA --env Prod
$ harness-fme status checkout_new_flow
$ harness-fme unreleased --env QA

$ harness-fme on checkout_new_flow --env QA
$ harness-fme on checkout_new_flow --env QA --go

$ harness-fme tui --env QA --env Prod
$ harness-fme tui --env QA --write
```

The first `on` shows the plan and writes nothing. The second applies it.
