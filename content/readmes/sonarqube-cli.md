---
title: "sonarqube-cli"
description: "A fast, focused CLI & TUI for SonarQube metrics, quality gates, issues and code snippets — with branch awareness and zero config friction."
hasDocs: false
---

> SonarQube from the terminal: why the quality gate is red, metrics, issues, hotspots and rules, plus an interactive issues dashboard.

Built on [`@kud/sonarqube`](https://github.com/kud/sonarqube), the headless core that holds the client, the layered config and the quality-gate model.

## Install

```bash
npm install -g @kud/sonarqube-cli
```

Two binaries, same program: `sonarqube` and `sonarqube-dash` (kept for existing scripts). Node 22 or later.

## Quick start

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

## Commands

| Command                | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| _(none)_               | Issues dashboard (TUI)                                 |
| `quality-gate`, `gate` | Gate status, new-code period, failing conditions first |
| `metrics`, `m`         | Gate status and headline metrics                       |
| `issues`               | List issues; `-i` opens the dashboard                  |
| `issues:summary`       | Issue counts by severity, type and status              |
| `issue <key>`          | One issue (`--url`, `--open`)                          |
| `hotspots`             | Security hotspots                                      |
| `hotspot <key>`        | One hotspot (`--url`, `--open`)                        |
| `rules`, `rule <key>`  | Search rules, show one                                 |
| `measures`             | Measures for a component (`-C`)                        |
| `measures:history`     | Measure history with sparklines                        |
| `component-tree`       | Files under a component                                |
| `duplications`         | Duplicated blocks in a file (`-f`)                     |
| `quality-profiles`     | Quality profiles                                       |
| `print-config`         | Resolved configuration, token redacted                 |
| `config`               | `set key=value…`, `get`, `show`, `path`                |

Shared flags on every command that talks to SonarQube:

| Flag                  | Meaning                                   |
| --------------------- | ----------------------------------------- |
| `-H, --host <url>`    | Server URL (`-h` is always help)          |
| `-t, --token <token>` | Auth token                                |
| `-p, --project <key>` | Project key                               |
| `-b, --branch <name>` | Branch                                    |
| `-c, --config <path>` | Config file to use instead of the default |
| `-j, --json`          | JSON output                               |

### quality-gate

```
🚦 Quality gate: FAILED  my-project (main)
   New code: PREVIOUS_VERSION 1.2.0, since 2026-10-01

  ✖ new_coverage                   62.1, needs ≥ 80
  ✖ new_reliability_rating         C, needs A
  ✔ new_duplicated_lines_density   0.5, needs ≤ 3

2 failing conditions
```

Ratings show as A–E. `--fail` exits 1 when the gate status is `ERROR`; `--json` prints the same explanation as data.

### issues

| Flag           | Values                                                          |
| -------------- | --------------------------------------------------------------- |
| `--severities` | `BLOCKER,CRITICAL,MAJOR,MINOR,INFO`                             |
| `--types`      | `BUG,VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT`                 |
| `--statuses`   | `OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED` (default: unresolved) |
| `--new-code`   | Only issues in the new-code period                              |
| `-l, --limit`  | Max issues (default 10)                                         |

Each issue shows its author (the part before `@`) and creation date as `YYYY-MM-DD`.

## Configuration

Layers, each overriding the last: config file, environment, flags. Without a project key anywhere, `sonar.projectKey` is read from `sonar-project.properties` in the current directory. There is no default host.

| Setting | Environment (first set wins)                             | File key  |
| ------- | -------------------------------------------------------- | --------- |
| host    | `SONARQUBE_DASH_HOST`, `SONAR_HOST_URL`                  | `host`    |
| token   | `SONARQUBE_DASH_TOKEN`, `SONARQUBE_TOKEN`, `SONAR_TOKEN` | `token`   |
| project | `SONARQUBE_DASH_PROJECT`                                 | `project` |
| branch  | `SONARQUBE_DASH_BRANCH`                                  | `branch`  |

The file lives at `$XDG_CONFIG_HOME/sonarqube-dash-cli/config.json` (default `~/.config/sonarqube-dash-cli/config.json`):

```bash
sonarqube config set host=https://sonarqube.example.com token=abc project=my-project
sonarqube config show
```

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Licence

MIT
