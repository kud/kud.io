---
title: "sonarqube-cli"
description: "A fast, focused CLI & TUI for SonarQube metrics, quality gates, issues and code snippets — with branch awareness and zero config friction."
hasDocs: true
---

## Features

SonarQube from the terminal: why the quality gate is red, metrics, issues, hotspots and rules, plus an interactive issues dashboard. Built on [`@kud/sonarqube`](https://github.com/kud/sonarqube), the headless core that holds the client, the layered config and the quality-gate model.

- **Quality gate, explained** — status, new-code period and failing conditions first, with `--fail` to break a CI step
- **Issues dashboard** — list, detail and a highlighted code snippet in one TUI, with `b` to switch branch and keep your filters
- **Everything else in reach** — metrics, measures and their history, hotspots, rules, duplications, quality profiles
- **Branch aware** — `-b` on every command that talks to SonarQube
- **Layered config** — config file, then environment, then flags, with `sonar-project.properties` as a fallback for the project key
- **Scriptable** — `--json` on every command that talks to SonarQube

## Install

```bash
npm install -g @kud/sonarqube-cli
```

Two binaries, same program: `sonarqube` and `sonarqube-dash` (kept for existing scripts). Node 22 or later.

## Usage

```bash
export SONARQUBE_DASH_HOST=https://sonarqube.example.com
export SONARQUBE_DASH_TOKEN=<token>
export SONARQUBE_DASH_PROJECT=my-project

sonarqube                         # open the issues dashboard
sonarqube quality-gate            # why is the gate red
sonarqube quality-gate --fail     # same, exit 1 when it is (for CI)
sonarqube issues --new-code -l 25
```

Running `sonarqube` with no command opens the dashboard (issues list, detail and a highlighted code snippet; `b` switches branch and keeps your filters). Outside a terminal it prints help instead. `sonarqube issues -i` opens it with filters.
