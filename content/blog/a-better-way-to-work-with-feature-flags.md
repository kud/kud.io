---
title: "A better way to work with feature flags"
description: "Why I built a Harness FME CLI for inspecting rollouts, managing user targeting and making safer bulk changes — and how it fits into the way I like to prototype and experiment."
date: "2026-11-12"
slug: "a-better-way-to-work-with-feature-flags"
tags: ["engineering","tools"]
cover: "/blog/a-better-way-to-work-with-feature-flags/4f677083d0c1.png"
updated: "2026-11-12T18:46:00.000Z"
---

I love feature flags. What I enjoy considerably less is managing them.

As a product-minded engineer, I find them particularly useful for prototyping. I can build an idea, deploy it to the actual product and make it available only to myself, a few teammates or selected stakeholders. We can try it in context, collect feedback and keep improving it without releasing it to everyone.

They're just as interesting for technical experiments. If I'm working on an optimisation, I can keep the old and new implementations available, switch between them and compare their behaviour.

But the everyday management can get tedious.

Sometimes I just want to know whether a feature is enabled in a particular environment. Sometimes I need to add my user key to several flags, or give a group of people access to a prototype.

I don't particularly want to spend my time navigating a web interface for that.

So I built a small family of tools around Harness Feature Management and Experimentation (FME), formerly Split: a shared API client, a command-line interface, an interactive terminal dashboard and an updated MCP server.

The one I use directly is [harness-fme-cli](https://github.com/kud/harness-fme-cli).

## Why I enjoy working with feature flags

What I find fascinating about feature flags is how they bring engineering and product development closer together.

I enjoy building software, but I also love experimenting with the experience itself. Sometimes I want to try a different interaction, rethink part of an interface or explore an idea that isn't quite ready to become a fully specified feature.

A prototype in a separate environment is useful. But being able to try an idea directly in the real product is something else.

The surrounding application is already there: its navigation, components, existing features and all those little constraints that are difficult to reproduce in a standalone prototype.

With a feature flag, I can make the experiment available only to myself at first. Then perhaps a few teammates, stakeholders or selected users.

I can get feedback, change the implementation and try again.

There's no need to expose the feature to everyone just because the code has been deployed.

I particularly like that flexibility. I can move between imagining something, implementing it and learning from it without treating every experiment as a full product release.

And it works beyond user-facing features.

Suppose I'm optimising a backend operation. I might keep two implementations available behind a flag, then compare their response times, throughput or resource consumption.

Being able to switch between implementations makes the experiment convenient, although a meaningful benchmark still requires comparable workloads and controlled conditions.

The same mechanism can support a gradual rollout once the new implementation looks promising.

That's why I use feature flags so much. They help me experiment with both product experiences and technical behaviour.

But using them frequently also makes their limitations more noticeable.

## The problem with everyday flag management

Harness FME provides a fairly extensive interface for managing feature flags, targeting rules, segments and environments.

I appreciate what it offers, but I've never found the interface especially convenient for some of the simpler things I do regularly.

Often, I just want to understand the current state of a feature.

Is it enabled in Staging? Is it partially rolled out in Production? What's the default treatment? Are there targeting rules that change the behaviour for certain users?

A feature might be enabled in one environment, disabled in another and available only to a specific group somewhere else.

That flexibility is useful, but understanding the overall picture isn't always straightforward.

The other irritation is individual targeting.

Feature flags generally rely on user keys rather than human-readable names. That's perfectly reasonable technically, but depending on how an application manages its identities, identifying the person behind a particular key isn't necessarily obvious.

I might know exactly who should have access to a prototype, but I still need to find the corresponding identifier.

Then I need to add it to the correct treatment, for the correct flag, in the correct environment.

For one flag, that's manageable.

For several flags and several people, it quickly becomes repetitive.

And if I want to repeat the same operation later, I'd much rather have a command I can reuse than another sequence of clicks.

## A CLI for the things I do most often

I've already built an [MCP server for Harness FME](https://github.com/kud/mcp-harness-fme), and I find MCP useful for exposing the API through a common tool interface.

But it isn't always the most convenient way to perform a repetitive operation.

Sometimes I know exactly what I want to do. I'd rather express it as a command, inspect the result and move on.

I also like writing scripts. A CLI gives me a straightforward way to combine operations, filter results and reuse the same behaviour without manually repeating each step.

That's the idea behind `harness-fme-cli`.

The simplest commands are for reading.

```bash
harness-fme list
```

This displays the rollout status and default rule of feature flags across environments.

If I'm interested in one particular flag:

```bash
harness-fme status checkout_new_flow
```

That gives me its state across environments, including the relevant targeting information.

And if I want to see which features aren't fully enabled yet:

```bash
harness-fme unreleased --env Staging
```

I can also filter listings by a name prefix or tag, select environments and request JSON output when I need to process the results in a script.

Nothing particularly complicated.

That's exactly what I wanted: a handful of predictable commands that answer common questions without opening the browser.

## Managing several flags at once

The more interesting part is changing targeting rules.

Suppose I've built a new checkout prototype and want to give myself access to all its experimental features.

I've already configured my user key through `HARNESS_FME_KEY`, and the relevant flags have names beginning with `checkout_`.

I can run:

```bash
harness-fme key add --prefix checkout_ --env Staging
```

The CLI finds the matching active flags and prepares to add my key to their `on` treatment.

This is particularly useful when there are lots of flags. I don't need to inspect and modify each one manually.

But there's an important detail: the command doesn't immediately write anything.

It shows me a plan first.

Using fictional flags, the output might look like this:

```text
add key to treatment on in Staging

FLAG                 ACTION  DETAIL
checkout_new_flow    update  add key to on
checkout_banner      skip    already has the key

Dry run: nothing was written. 1 change ready;
re-run with --go to apply.
```

I can see which flags matched, which ones need updating and which are already in the expected state.

If the plan looks correct, I can apply it explicitly:

```bash
harness-fme key add --prefix checkout_ --env Staging --go
```

I wanted this separation between planning and writing because the convenience of a bulk operation shouldn't make it easier to modify the wrong things.

A command that changes a thousand flags deserves considerably more care than one that changes a single flag.

And even for smaller operations, I'd rather see exactly what I'm about to do.

## Making writes safer

Changing a feature flag isn't necessarily a small operation underneath.

A definition can contain treatments, individual keys, targeting rules, segments and other configuration. Modifying one part may involve sending the updated definition back through the API.

If something is handled incorrectly, an operation intended to add a single user could affect existing targeting.

So I wanted a few safeguards built into the shared client.

**Every write starts with a plan.** Without `--go`, nothing is modified.

**Every original definition is backed up.** Before changing a flag, the CLI saves its current definition under `~/.harness-fme/backups`.

**Every change is verified afterwards.** Once the API accepts the update, the CLI reads the flag again and compares the resulting definition with the plan.

If something doesn't match, the operation stops at the first failure rather than continuing through the remaining flags.

There's an important limitation here: these operations aren't atomic. If a bulk change fails halfway through, some flags may already have been updated. The backups allow manual recovery, but they don't constitute an automatic rollback.

I can also narrow a larger operation with `--only` or `--limit`.

For example:

```bash
harness-fme key add --prefix checkout_ --env Staging --limit 1 --go
```

That applies at most one planned update, which is useful when I want to check the behaviour before proceeding further.

Production environments receive an additional safeguard.

If an environment is called `Prod`, the CLI requires its exact name and an explicit `--go` before writing. A loosely matched name won't silently select it.

Calls are also spaced out, and API rate-limit responses are retried according to the available reset information.

None of this eliminates the need to review what I'm doing. But it helps make the operation predictable, particularly when I'm changing several flags at once.

The CLI also supports enabling or disabling features, targeting segments and changing percentage rollouts.

For example:

```bash
harness-fme on checkout_new_flow --env Staging --percent 25
```

This plans a rollout where 25% of traffic receives the `on` treatment. Adding `--go` applies it.

I find that much more comfortable than repeatedly navigating individual targeting screens.

## An interactive dashboard when I need one

Not every task starts with a specific flag name.

Sometimes I want to browse the available features, inspect their states and decide what to change.

For that, the CLI also includes a terminal dashboard:

```bash
harness-fme tui
```

It lets me navigate a list of flags, move between environments, inspect details and mark several flags.

I can explore without needing to remember every command.

The dashboard starts in read-only mode.

If I want to enable changes, I have to launch it with `--write`:

```bash
harness-fme tui --env Staging --write
```

The same planning, confirmation, backup and verification mechanisms apply.

The dashboard never starts with a production environment selected, and a production change requires typing the environment's exact name.

I like having both interfaces available.

When I know what I need, I use a command. When I want to explore, I use the dashboard.

Both let me stay in the terminal.

## One shared API client

As these tools developed, it made sense to keep the actual Harness API behaviour in one place.

I didn't want the CLI and MCP server implementing pagination, error handling, targeting operations and rate limiting independently.

The result is a small family of packages, released on 12 November 2026:

- [`@kud/harness-fme`](https://github.com/kud/harness-fme) **0.1.0** — the shared API client, with pagination, rollout classification and the safe-write engine.

- [`@kud/harness-fme-cli`](https://github.com/kud/harness-fme-cli) **0.1.0** — the command-line interface and interactive dashboard.

- [`@kud/harness-fme-ink`](https://github.com/kud/harness-fme-ink) **0.1.0** — reusable Ink components for displaying flags, environments, plans and results.

- [`@kud/mcp-harness-fme`](https://github.com/kud/mcp-harness-fme) **1.7.0** — the existing MCP server, now using the shared client.

The Ink package is deliberately focused on presentation. The interactive dashboard lives in the CLI, which provides the navigation, data and write operations.

The shared client also helped address a few problems in the existing MCP implementation.

One of them was pagination.

Flag listings were returning only 20 results per page, regardless of the requested page size.

It turned out the client was sending `size`, while the Harness API expects `limit`.

With the correct parameter, pages can contain up to 50 flags.

For a thousand flags, that reduces a complete listing from 50 requests to 20.

That isn't a dramatic algorithmic breakthrough, but it's a useful improvement when a simple operation needs to inspect a large number of flags.

The update also fixes successful writes with empty response bodies being treated as failures, names containing spaces or slashes breaking API URLs, and workspace lookups missing results beyond the first page.

They're small fixes, but they're exactly the kind of thing that makes an API client more reliable.

And with a shared library, the different interfaces benefit from the same underlying behaviour.

## A note on when not to use feature flags

Given how much I enjoy feature flags, I should probably mention that I don't think they're always the right solution.

Sometimes I feel we rely on them a little too much.

A new feature gets a flag, an improvement gets another, and occasionally even a relatively ordinary bug fix ends up behind one.

I understand the appeal. Having a switch makes a change feel safer.

But a flag doesn't automatically make code safe.

The flag evaluation itself can be wrong. A supposedly disabled implementation might still affect shared state, initialisation or other parts of the application. And when the old and new implementations coexist, both paths need appropriate testing.

There's also a maintenance cost that I think we sometimes underestimate.

Suppose a team is improving an existing feature while keeping the previous implementation available behind a flag.

That's useful during an experiment.

But meanwhile, other development continues. Someone fixes a bug, another engineer refactors a shared component, and perhaps a small additional improvement needs to be made.

Now the team has to consider two implementations.

Does the bug fix belong in both? Does the new behaviour need to be implemented twice? Are both paths still tested and maintained?

It can become surprisingly frustrating, especially when a temporary experiment lasts much longer than intended.

That's why I think feature flags need good hygiene.

A temporary flag should have a clear purpose, someone responsible for it and an idea of when it can be removed.

Once an experiment has reached a decision, and the appropriate rollout or observation period is over, I'd rather remove the obsolete implementation and its flag than leave both paths in the codebase indefinitely.

Of course, some flags are intentionally long-lived. An operational switch that allows an expensive backend operation to be disabled may be worth keeping.

But I wouldn't treat an experimental flag and a permanent operational control in the same way.

I also think we sometimes underestimate what a straightforward release process can achieve.

Not every change needs to reach production as soon as it's merged, and not every change needs a flag to prevent that.

In some projects, keeping a `main` integration branch and a separate stable or release branch can be a reasonable choice. In others, promoting the same tested artefact through QA and production may achieve the same separation without maintaining long-lived branches.

Each approach has trade-offs.

My point isn't that one branching strategy is universally better. It's that feature flags shouldn't have to compensate for a release process that doesn't provide enough confidence.

Continuous delivery doesn't mean every merge must immediately become a production deployment.

I'd rather use feature flags when I genuinely need controlled exposure, experimentation or an operational switch, and use the normal testing and release process when that's sufficient.

That distinction is particularly important when experimenting in production.

I love being able to make a prototype available to selected users in the real application, but restricting its audience doesn't remove every technical risk. The implementation still needs to be safe to deploy, even for people who will never see it.

## Getting started

The CLI is available on npm and requires Node.js 20 or later.

```bash
npm install -g @kud/harness-fme-cli
```

The executable is `harness-fme`.

If I want something shorter, I can create a shell alias:

```bash
alias fme=harness-fme
```

To configure access:

```bash
export HARNESS_FME_API_KEY=<your-api-key>
export HARNESS_FME_WORKSPACE=Storefront
```

The workspace is optional if there's only one available. For individual targeting, I can provide a key using `--key` or configure `HARNESS_FME_KEY`.

From there, I can inspect flags, compare their states across environments, manage individual targeting, change rollout percentages and open the interactive dashboard.

The [CLI repository](https://github.com/kud/harness-fme-cli) has the full documentation, and the [MCP server's 1.7.0 release](https://github.com/kud/mcp-harness-fme/releases/tag/v1.7.0) covers the changes to that interface.

## Back to experimenting

I built these tools because I genuinely enjoy working with feature flags.

I like being able to try a new interaction with a handful of people, compare two implementations, measure an optimisation or gradually make something available to more users.

I like the freedom they give me as an engineer who cares about the product as much as the implementation.

But I don't want the administrative side of feature flags to take up more time than the experiments themselves.

Sometimes I just need to understand what's enabled. Sometimes I need to give someone access. And sometimes I want to repeat the same carefully reviewed operation across several flags.

A small CLI, backed by a shared API client and an optional terminal dashboard, makes those things easier for me.

It doesn't replace the Harness interface, and it doesn't remove the engineering discipline required to use feature flags safely.

It simply gives me a more direct way to work with them.

And that's exactly what I wanted.