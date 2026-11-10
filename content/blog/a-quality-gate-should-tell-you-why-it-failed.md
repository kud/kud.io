---
title: "A quality gate should tell you why it failed"
description: "Why a small, predictable CLI can make SonarQube quality gates easier to understand—and where a read-only MCP companion fits."
date: "2026-11-10"
slug: "a-quality-gate-should-tell-you-why-it-failed"
tags: ["engineering","tools"]
cover: "/blog/a-quality-gate-should-tell-you-why-it-failed/77b13386a80e.png"
updated: "2026-11-10T18:37:00.000Z"
---

A red quality gate tells you something is wrong. It doesn't necessarily tell you what to do about it.

When I'm working in a terminal and a SonarQube analysis fails, I want to know two things: what actually failed, and did I introduce it?

Opening the web UI, finding the right project and working through its issues isn't difficult. It's just another interruption when I'm already in the middle of something.

That's why I built [sonarqube-cli](https://kud.io/projects/sonarqube-cli), a terminal client for SonarQube. Version 0.3.0 makes the questions above easier to answer without leaving the command line.

## A quality gate is more than a status

A quality gate can fail because of coverage, reliability, duplication or any other condition configured for the project. Knowing that it's red is useful. Knowing which conditions failed is what lets you act.

`sonarqube gate` (also `sonarqube quality-gate`) shows the conditions with the failures first, including the value and the threshold each condition missed.

For CI, the same command has a useful extra flag:

```bash
sonarqube gate --fail
```

When the gate fails, the command exits with code 1. A CI job can stop on that exit status, without a separate script to interpret the response.

I like that the same command works for both: an explanation when I'm looking at it, an unambiguous result when a script is.

## Start with what you just changed

An established project may have plenty of technical debt. When I'm reviewing a change, I don't always want the entire backlog; I want to see what the current work introduced.

```bash
sonarqube issues --new-code
```

This filters issues to SonarQube's configured new-code period. It doesn't claim older problems aren't there. It just puts the recent ones in front of me first.

If I need more context, running `sonarqube` on its own opens an interactive issues dashboard with issue details and highlighted code. A short command can answer a quick question; the dashboard is there when I want to investigate.

## Why I still like CLIs

One thing I appreciate about a command-line interface is how predictable it is. A command has a defined job, a handful of arguments, an output and an exit code. Its limitations are part of the appeal.

This matters when I'm writing scripts, and it also matters when an assistant is using a tool. If it has shell access, a single command with concise output can be simpler to invoke and cheaper in tokens than discovering and coordinating several MCP tools.

Not always, of course. MCP exposes structured tools to assistants, and a well-designed MCP integration can be just as economical. The cost depends on the task, the tool definitions and the amount of data returned. I wouldn't claim that a CLI is inherently cheaper.

What I value is being able to choose a narrow interface when the task is narrow. Sometimes one command and one answer really are enough.

## One core, different interfaces

The CLI now resolves connection settings from flags, environment variables and a config file. When no project key has been provided, it can read `sonar.projectKey` from `sonar-project.properties`.

Underneath, it uses the shared [shared @kud/sonarqube core](https://github.com/kud/sonarqube). The same core powers [`@kud/mcp-sonarqube`](https://github.com/kud/mcp-sonarqube), a read-only MCP server that lets compatible assistants inspect quality gates, issues, measures and source context.

I want to keep exploring that pairing. The CLI works well when I know the command I need; MCP makes the information available in an assistant's workflow without requiring me to prescribe every step. They serve different needs, and neither has to replace the other.

As they evolve, I'd rather keep both interfaces focused than add more machinery simply because it's possible.

## Installing 0.3.0

The package has changed from `sonarqube-dash` to `@kud/sonarqube-cli`:

```bash
npm install -g @kud/sonarqube-cli
```

Both `sonarqube` and `sonarqube-dash` commands still work, but the package requires Node.js 22 or later. The host flag is now `-H`, leaving `-h` for help, so existing scripts using `-h` for a host will need updating.

The [0.3.0 changelog](https://github.com/kud/sonarqube-cli/blob/main/CHANGELOG.md) has the complete details.

I don't need every task to become an interactive experience. Sometimes I just want to see what failed, understand the reason and get back to the code.